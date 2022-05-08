const Equipos = require('../models/equipos.model');
const Torneos = require('../models/torneos.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

//PDF
const fs = require('fs');
const Pdfmake = require('pdfmake');

//OBTENER TORNEOS
function ObtenerEquipos (req, res) {

    if(req.user.rol == "ROL_USUARIO"){
        Equipos.find({idUsuario:req.user.sub},(err, equiposObtenidos) => {
            if (err) return res.send({ mensaje: "Error: " + err })
            return res.send({ equipos: equiposObtenidos })
        })
    } else {
        return res.status(500).send({mensaje: 'No posee permisos para completar la peticion'});
    }
}

//REGISTRO DE EQUIPOS EN TORNEO
function RegistrarEquipo(req, res){
    var parametros = req.body;
    var equiposModel = new Equipos();
     
    if(parametros.nombreEquipo && parametros.descripcionEquipos){

        equiposModel.nombreEquipo = parametros.nombreEquipo;
        equiposModel.descripcionEquipos = parametros.descripcionEquipos;
        equiposModel.golesAnotados = 0;
        equiposModel.golesRecibidos = 0;
        equiposModel.diferenciaGoles = 0;
        equiposModel.puntosTorneo = 0;
        equiposModel.partidos = 0;
        equiposModel.idTorneo = parametros.idTorneo;
        equiposModel.idUsuario = req.user.sub;

    if(req.user.rol == "ROL_USUARIO"){
         Equipos.find({nombreEquipo: parametros.nombreEquipo, idTorneo: parametros.idTorneo, idUsuario: req.user.sub}, 
            (err, equipoGuardado)=>{
                Equipos.find({idTorneo:parametros.idTorneo},(err,equipoGuardadoCantidad)=>{
                if(equipoGuardadoCantidad.length >= 10){
                    return res.status(500).send({mensaje:'No es posible agregar mas de diez partidos en el torneo'})
                }else{
                if(equipoGuardado.length == 0){
                    equiposModel.save((err, equipoGuardado)=>{
                        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!equipoGuardado) return res.status(404).send({mensaje: 'El equipo no se agrego'});
                        return res.status(201).send({equipos: equipoGuardado});
                     })                    
                } else {
                    return res.status(500).send({ message: 'Este equipo ya existe' });
                }
            }
        })
            })
        } else {
            return res.status(500).send({mensaje: 'Solamente un usuario puede completar esta accion'});
        }
    }else{
        return res.status(500).send({ mensaje: "Error en la accion de agregar Equipo, verifica la informacion" });
     }
}

//EDITAR EQUIPOS
function EditarEquipo(req, res) {
    var idEquipo = req.params.idEquipo;
    var parametros = req.body;

    if(req.user.rol == "ROL_USUARIO"){
    Equipos.findOneAndUpdate({_id: idEquipo, idUsuario:req.user.sub}, parametros, {new:true},(err,equipoEditado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de editar equipo'});
        if(!equipoEditado) return res.status(400).send({mensaje: 'No se puede editar el equipo'});
        return res.status(200).send({equipos: equipoEditado});
        })
    } else {
        return res.status(500).send({mensaje: 'Solamente un usuario puede completar esta accion'});
    }
}

//ELIMINAR EQUIPOS
function EliminarEquipo(req, res) {
    var idEquipo = req.params.idEquipo;

    if(req.user.rol == "ROL_USUARIO"){
    Equipos.findOneAndDelete({_id: idEquipo, idUsuario:req.user.sub},(err,equipoEliminado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de eliminar equipo'});
        if(!equipoEliminado) return res.status(400).send({mensaje: 'No se puede eliminar el equipo'});
        return res.status(200).send({equipos: equipoEliminado});
        })
    } else {
        return res.status(500).send({mensaje: 'Solamente un usuario puede completar esta accion'});
    }
}

//BUSCAR EQUIPOS POR TORNEO
function ObtenerEquiposTorneo(req, res){
    var nombre = req.params.nombre;

    if(req.user.rol == "ROL_USUARIO"){
        Torneos.findOne({nombre: {$regex:nombre,$options:'i'}},(err, torneoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
            if(!torneoEncontrado) return res.status(404).send({mensaje : "Error, no se encuentran categorias con ese nombre"});

            Equipos.find({idTorneo: torneoEncontrado._id, idUsuario:req.user.sub}, (err, equiposTornoe)=>{
                if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
                if(!equiposTornoe) return res.status(404).send({mensaje : "Error, no se encuentran productos en dicha categoria"});

                return res.status(200).send({torneos : equiposTornoe});
            }).populate('idTorneo', 'nombre')
        })
    } else {
        return res.status(500).send({mensaje: 'No posee permisos para completar la peticion'});
    }
}

//REPORTE DE LOS EQUIPOS EN LA LIGA
function reporteTorneo(req, res) {
    var nombre = req.params.nombre;

    if(req.user.rol == "ROL_USUARIO"){
    Torneos.findOne({nombre: {$regex:nombre,$options:'i'}},(err, torneoEncontrado)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion de buscar Torneo"});
        if(!torneoEncontrado) return res.status(404).send({mensaje : "Error, no se encuentran torneos con ese nombre"});

        Equipos.find({idTorneo: torneoEncontrado._id, idUsuario:req.user.sub}, (err, equiposTorneo)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion de buscar Equipo"});
            if(!equiposTorneo) return res.status(404).send({mensaje : "Error, no se encuentran equipos en dicho torneo"});

    var fonts = {
        Roboto: {
            normal: './fonts/Roboto/Roboto-Regular.ttf',
            bold: './fonts/Roboto/Roboto-Medium.ttf',
            italics: './fonts/Roboto/Roboto-Italic.ttf',
            bolditalics: './fonts/Roboto/Roboto-MediumItalic.ttf'
        }
    };
    let pdfmake = new Pdfmake(fonts);
    let content = [{
        text: '¡Reporte De Equipos!', alignment:'center', fontSize:20, decoration:'underline', color:'#00305B', bold:true
    }]

    content.push({
        text:' '
    })
    content.push({
        text: 'Ve los Equipos que forman parte del Torneo.', alignment:'center', fontSize:15, color:'#00305B',
    })

    for (let i=0; i < equiposTorneo.length ; i++) {
        content.push({
            text:' '
        })
        content.push({
            text:' '
        })
        content.push({
            text:'Forman parte del Torneo '+  equiposTorneo[i].idTorneo.nombre, bold:true
        })
        content.push({
            text:' '
        })
        content.push({
            text:'Nombre del Equipo: '+  equiposTorneo[i].nombreEquipo
        })
        content.push({
            text:'Descripción: '+  equiposTorneo[i].descripcionEquipos
        })
        content.push({
            text:' '
        })
    }

    let docDefinition = {
        content: content,
        background: function(){
            return {canvas: [{type:'rect', x: 500, y: 32, w:170, h: 765, color: '#00305B'}]
            }
        }	
    }

    let documentPDF = pdfmake.createPdfKitDocument(docDefinition, {});
    documentPDF.pipe(fs.createWriteStream('equiposReporte.pdf'));
    documentPDF.end();
    return res.status(200).send({mensaje:'El reporte de equipos ya fue creado'});
    }).populate('idTorneo', 'nombre')
})
} else {
    return res.status(500).send({mensaje: 'No posee permisos para completar la peticion'});
}
}



module.exports = {
    ObtenerEquipos,
    RegistrarEquipo,
    EditarEquipo,
    EliminarEquipo,
    ObtenerEquiposTorneo,
    reporteTorneo
}