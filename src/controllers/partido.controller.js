const Equipos = require('../models/equipos.model');
const Torneos = require('../models/torneos.model');
const Partidos = require('../models/partidos.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

//PDF
const fs = require('fs');
const Pdfmake = require('pdfmake');
const path = require('path')

function partidoJugado(req, res){
    var alcanceJornada;
    var alcancePartido;
    var parametros = req.body;

    var partidosModel = new Partidos();
    if(parametros.descripcionPartido && parametros.golesLocal && parametros.golesVisita 
        && parametros.jornadaJugada && parametros.EquipoLocal && parametros.EquipoVisita){

        partidosModel.descripcionPartido = parametros.descripcionPartido;
        partidosModel.golesLocal = parametros.golesLocal;
        partidosModel.golesVisita = parametros.golesVisita;
        partidosModel.jornadaJugada = parametros.jornadaJugada;

        partidosModel.EquipoLocal = parametros.EquipoLocal;
        partidosModel.EquipoVisita = parametros.EquipoVisita;
        
        if(req.user.rol == "ROL_USUARIO"){
        Partidos.findOne({EquipoLocal: parametros.EquipoLocal, EquipoVisita: parametros.EquipoVisita, jornadaJugada: parametros.jornadaJugada}
            ,(err, partidoJugado)=>{
                if(partidoJugado){
                    return res.status(500).send({ message: 'Estos equipos ya han jugado en la jornada.'});
                }else{
                    if (err) return res.status(500).send({ message: "Error en la peticion de verificar los partidos" });
                
            Equipos.find((err, numeroPartidos)=>{
                var partidoParImpar = numeroPartidos.length % 2 == 0
                if(partidoParImpar){
                    alcancePartido = numeroPartidos.length/2;
                    alcanceJornada = numeroPartidos.length - 1;
                }else{
                    alcancePartido = (numeroPartidos.length - 1)/ 2;
                    alcanceJornada = numeroPartidos.length;
                }
                if(parametros.jornadaJugada <= alcanceJornada){
                    if (err) return res.status(500).send({ message: "Error en la peticion de verificar las jornadas" });
                    partidosModel.save((err,partidoJugadoGuardado)=>{
                        var puntosLocal;
                        var puntosVisita;
                        diferenciaLocal = parametros.golesLocal - parametros.golesVisita;
                        diferenciaVisita = parametros.golesVisita - parametros.golesLocal;
                        if(parametros.golesLocal == parametros.golesVisita){
                            puntosLocal = 1;
                            puntosVisita = 1;
                        }else if(parametros.golesLocal > parametros.golesVisita){
                            puntosLocal = 3;
                            puntosVisita = 0;
                        }else if(parametros.golesVisita > parametros.golesLocal){
                            puntosLocal = 0;
                            puntosVisita = 3;
                        }else{
                            if (err) return res.status(500).send({ message: "Error en la peticion de verificar los puntos" });
                        }

                        Equipos.findOneAndUpdate({_id:parametros.EquipoLocal},{$inc:{golesAnotados: parametros.golesLocal, golesRecibidos: parametros.golesVisita, partidos: 1, diferenciaGoles: diferenciaLocal, puntosTorneo: puntosLocal}},(err,golesAnotadosP)=>{
                            if (err) return res.status(500).send({ message: "error en la peticion goles del equipo uno" });
                            Equipos.findOneAndUpdate({_id: parametros.EquipoVisita}, {$inc:{golesAnotados: parametros.golesVisita, golesRecibidos: parametros.golesLocal, partidos: 1, diferenciaGoles: diferenciaVisita, puntosTorneo: puntosVisita}}, (err, golesAnotadosS)=>{
                                if (err) return res.status(500).send({ message: "error en la peticion goles del equipo dos" });
                            })
                        })
                        return res.status(201).send({partidos: partidoJugadoGuardado});
                    })
                }else{
                    return res.status(201).send({mensaje: 'la cantidad de jornadas supera el alcance esperado'});
                }
            })
        }
        })
    } else {
        return res.status(500).send({mensaje: 'Solamente un usuario puede completar esta accion'});
    }
    } 
}

//BUSCAR EQUIPOS POR TORNEO
function ObtenerTablaTorneo(req, res){
    var nombre = req.params.nombre;

    if(req.user.rol == "ROL_USUARIO"){
        Torneos.findOne({nombre: {$regex:nombre,$options:'i'}},(err, torneoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
            if(!torneoEncontrado) return res.status(404).send({mensaje : "Error, no se encuentran categorias con ese nombre"});

            Equipos.find({idTorneo: torneoEncontrado._id, idUsuario:req.user.sub}, (err, equiposTornoe)=>{
                if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
                if(!equiposTornoe) return res.status(404).send({mensaje : "Error, no se encuentran productos en dicha categoria"});

                return res.status(200).send({torneos : equiposTornoe});
            }).sort({
                puntosTorneo:-1, golesRecibidos: -1, golesRecibidos:1
            })
        })
    } else {
        return res.status(500).send({mensaje: 'No posee permisos para completar la peticion'});
    }
}

//TABLA DEL TORNEO
function tablaTorneo(req, res) {
    var nombre = req.params.nombre;

    if(req.user.rol == "ROL_USUARIO"){
    Torneos.findOne({nombre: {$regex:nombre,$options:'i'}},(err, torneoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
        if(!torneoEncontrado) return res.status(404).send({mensaje : "Error, no se encuentran categorias con ese nombre"});

        Equipos.find({idTorneo: torneoEncontrado._id, idUsuario:req.user.sub}, (err, equiposTornoe)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
            if(!equiposTornoe) return res.status(404).send({mensaje : "Error, no se encuentran productos en dicha categoria"});

    var fonts = {
        Roboto: {
            normal: './fonts/roboto/Roboto-Regular.ttf',
            bold: './fonts/roboto/Roboto-Medium.ttf',
            italics: './fonts/roboto/Roboto-Italic.ttf',
            bolditalics: './fonts/roboto/Roboto-MediumItalic.ttf'
        }
    };
    let pdfmake = new Pdfmake(fonts);
    let content = [{
        text: '¡Tabla del Torneo!', alignment:'center', fontSize:20, decoration:'underline', color:'#00305B', bold:true
    }]
    content.push({
        text: ' ',margin: [0, 0, 0, 10]
    })
    content.push({
        text: 'Visualiza la Tabla del Torneo, Temporada 2022.', alignment:'center', fontSize:15, color:'#00305B',
    })

    var encabezados = new Array('Lugar en Tabla', 'Club','Partidos', 'Goles Anotados', 'Goles Recibidos', 'Diferencia en goles', 'Puntos en Torneo'); 
    var body = [];

    body.push(encabezados);

    for (let i = 0; i < equiposTornoe.length; i++) {
        var equiposTorneoTabla = new Array((i + 1), equiposTornoe[i].nombreEquipo, equiposTornoe[i].partidos,equiposTornoe[i].golesAnotados, 
            equiposTornoe[i].golesRecibidos, equiposTornoe[i].diferenciaGoles, equiposTornoe[i].puntosTorneo)
                body.push(equiposTorneoTabla)
    }
    content.push({
        text: ' ',margin: [0, 0, 0, 10]
    })
    content.push({
        text:'Forman parte del Torneo, '+  torneoEncontrado.nombre, color:'#00305B', fontSize:13
    })
    content.push({
        text: ' ',margin: [0, 0, 0, 10]
    })
    content.push({
        table: {heights: 30,headerRows: 1,widths: ['*', '*', '*', '*', '*', '*', '*'],body: body}, alignment:'center', text:'center'
    })
    let docDefinition = {
        pageSize: {width: 595.28,height: 841.89},content: content,
        background: function(){
            return {canvas: [{type: 'rect',x: 5, y: 31,w: 100,h: 10,color: '#00305B'}]}
        }
    }

    let documentPDF = pdfmake.createPdfKitDocument(docDefinition, {});
    documentPDF.pipe(fs.createWriteStream('tablaTorneo.pdf'));
    documentPDF.end();
    return res.status(200).send({mensaje:'La Tabla del Torneo fue creada'});
    }).sort({
        puntosTorneo:-1, golesRecibidos: -1, golesRecibidos:1
    })
})
} else {
    return res.status(500).send({mensaje: 'No posee permisos para completar la peticion'});
}
}

module.exports = {
    partidoJugado,
    ObtenerTablaTorneo,
    tablaTorneo
}