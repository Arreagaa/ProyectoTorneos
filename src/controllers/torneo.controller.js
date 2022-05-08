const Torneos = require('../models/torneos.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

//OBTENER TORNEOS
function ObtenerTorneos (req, res) {

    Torneos.find({idUsuario:req.user.sub},(err, torneosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err })
        return res.send({ torneos: torneosObtenidos })
    })
}

//AGREGA TORNEOS
function RegistrarTorneo(req, res){
    var parametros = req.body;
    var torneosModel = new Torneos();
     
    if (parametros.nombre && parametros.descripcion) {
        torneosModel.nombre = parametros.nombre;
        torneosModel.descripcion = parametros.descripcion;
        torneosModel.idUsuario = req.user.sub;

    Torneos.find({ nombre: parametros.nombre, descripcion:parametros.descripcion, idUsuario:req.user.sub},(err, torneoGuardado) => {
        if (torneoGuardado.length==0) {
            torneosModel.save((err, torneoGuardado) => {
                console.log(err)
                if (err) return res.status(500).send({ message: "error en la peticion de agregar torneo" });
                if (!torneoGuardado) return res.status(404).send({ message: "No se puede agregar un torneo" });
                return res.status(200).send({ torneos: torneoGuardado  });
            })  
        } else {
            return res.status(500).send({ message: 'Este torneo ya existe' });
        }
    })
    }else {
        return res.status(500).send({ message: "Ocurrio un error al agregar el torneo" })
    }
}

//EDITA TORNEOS
function EditarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;
    var parametros = req.body;

    Torneos.findOneAndUpdate({_id: idTorneo, idUsuario:req.user.sub}, parametros, {new:true},(err,torneoEditado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de editar torneo'});
        if(!torneoEditado) return res.status(400).send({mensaje: 'No se puede editar el torneo'});
        return res.status(200).send({torneos: torneoEditado});
        })
}

//ELIMINA TORNEOS 
function EliminarTorneo(req, res) {
    var idTorneo = req.params.idTorneo;

    Torneos.findOneAndDelete({_id : idTorneo, idUsuario:req.user.sub},(err,torneoEliminado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
        if(!torneoEliminado) return res.status(400).send({mensaje: 'No se puede eliminar la sucursal'});
        return res.status(200).send({torneos: torneoEliminado});
        })
}


//FUNCIONES ADMINISTRATIVAS SOBRE TORNEOS
//OBTENER TODOS LOS TORNEOS
function ObtenerTorneosAdmin (req, res) {

    if(req.user.rol == "ROL_ADMINISTRADOR"){
    Torneos.find((err, torneosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err })
        return res.send({ torneos: torneosObtenidos })
    })
        } else{
            return res.status(500).send({ mensaje: 'No posee permisos para visualizar todos los torneos'});
        }  
    }

//ADMIN EDITA CUALQUIER TORNEO
function EditarTorneoAdmin(req, res) {
    var idTorneo = req.params.idTorneo;
    var parametros = req.body;

    if(req.user.rol == "ROL_ADMINISTRADOR"){
    Torneos.findOneAndUpdate({_id: idTorneo}, parametros, {new:true},(err,torneoEditado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de editar torneo'});
        if(!torneoEditado) return res.status(400).send({mensaje: 'No se puede editar el torneo'});
        return res.status(200).send({torneos: torneoEditado});
        })
    } else{
        return res.status(500).send({ mensaje: 'No posee permisos para editar cualquier torneo'});
    }  
}

//ADMIN ELIMINA CUALQUIER TORNEO
function EliminarTorneoAdmin(req, res) {
    var idTorneo = req.params.idTorneo;

    if(req.user.rol == "ROL_ADMINISTRADOR"){
    Torneos.findOneAndDelete({_id: idTorneo},(err,torneoEliminado)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de eliminar torneo'});
        if(!torneoEliminado) return res.status(400).send({mensaje: 'No se puede eliminar el torneo'});
        return res.status(200).send({torneos: torneoEliminado});
        })
    } else{
        return res.status(500).send({ mensaje: 'No posee permisos para eliminar cualquier torneo'});
    }  
}

module.exports = {
    ObtenerTorneos,
    RegistrarTorneo,
    EditarTorneo,
    EliminarTorneo,
    ObtenerTorneosAdmin,
    EditarTorneoAdmin,
    EliminarTorneoAdmin
}