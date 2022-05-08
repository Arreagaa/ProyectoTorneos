const Usuarios = require('../models/usuario.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');

//LOGIN
function login(req,res){
    var paramentros = req.body;

    Usuarios.findOne({nombre: paramentros.nombre},(err,usuarioGuardado)=>{
        if(err) return res.status(500).send({mensaje:'Error en la peticion'})
        if(usuarioGuardado){
            bcrypt.compare(paramentros.password,usuarioGuardado.password,(err,verificacionPassword)=>{
                if(verificacionPassword){
                    if(paramentros.obtenerToken === 'true'){
                        return res.status(200).send({
                            token: jwt.crearToken(usuarioGuardado)
                        })
                    }else{
                        usuarioGuardado.password = undefined;
                        return res.status(200).send({usuario: usuarioGuardado})
                    }
                }else{
                    return res.status(500).send({mensaje:'La contrasena no coincide'})
                }
            })
        }else{
            return res.status(500).send({mensaje: 'El usuario no se encuentra o no se identifica'})
        }
    })
}

//OBTENER USUARIOS
function ObtenerUsuarios (req, res) {

    if(req.user.rol == "ROL_ADMINISTRADOR"){
    Usuarios.find((err, empresasObtenidas) => {
        
        if (err) return res.send({ mensaje: "Error: " + err })

        return res.send({ usuarios: empresasObtenidas })
    })
    } else{
        return res.status(500).send({ mensaje: 'No posee permisos para visualizar a los usuarios'});
    }  
}

//AGREGAR ADMIN -- AL INSTANTE
function RegistrarAdmin(req, res){
    var usuariosModel = new Usuarios();   
    usuariosModel.nombre = 'ADMIN';
    usuariosModel.email = 'Admin@gmail.com';
    usuariosModel.rol = 'ROL_ADMINISTRADOR';

    Usuarios.find({ nombre: 'ADMIN', email: 'Admin@gmail.com'}, (err, usuarioEncontrato) => {
        if (usuarioEncontrato.length == 0) {
            bcrypt.hash("deportes123",null, null, (err, passswordEncypt) => { 
                usuariosModel.password = passswordEncypt
                usuariosModel.save((err, usuarioGuardado) => {
                console.log(err)
                })
            })
        } else {
            console.log('Este usuario con el puesto de Administrador ya esta creado')
        }
    })
}

//ADMIN AGREGAR USUARIO/ADMIN
function RegistrarUsuario(req, res){
    var paramentros = req.body;
    var usuariosModel = new Usuarios();
     
    if(paramentros.nombre, paramentros.email, paramentros.password){
        usuariosModel.nombre = paramentros.nombre;
        usuariosModel.email =  paramentros.email;
        usuariosModel.password = paramentros.password;
        usuariosModel.rol = paramentros.rol;
            
        if(req.user.rol == "ROL_ADMINISTRADOR"){
            Usuarios.find({nombre: paramentros.nombre, email: paramentros.email, password: paramentros.password, rol: paramentros.rol}, (err, usuarioGuardado)=>{
                if(usuarioGuardado.length == 0){
                    bcrypt.hash(paramentros.password, null,null, (err, passwordEncriptada)=>{
                        usuariosModel.password = passwordEncriptada;
                        usuariosModel.save((err, usuarioGuardado) => {
                            if(err) return res.status(500).send({mensaje: 'No se realizo la accion'});
                            if(!usuarioGuardado) return res.status(404).send({mensaje: 'No se ha agregado al usuario'});
            
                            return res.status(201).send({usuarios: usuarioGuardado});
                         })
                    })
                }else{
                    return res.status(500).send({ mensaje: 'Error en la peticion de Agregar Usuario' });
                }
            })
        }else{
            return res.status(500).send({ mensaje: 'Solo el Administrador puede completar esta accion' });
        } 
    }    
}

//EDITAR USUARIO
function EditarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    var paramentros = req.body;

    if (req.user.rol == 'ROL_ADMINISTRADOR') {
        Usuarios.findById(idUsuario, (err, usuarioRol) => {
            if (usuarioRol.rol == "ROL_USUARIO") {
                Usuarios.findByIdAndUpdate({ _id: idUsuario }, paramentros, {new:true}, (err, usuarioEditado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de editar usuario' });
                    if (!usuarioEditado) return res.status(400).send({ mensaje: 'No se pudo editar al usuario' });
                    return res.status(200).send({usuarios: usuarioEditado });
                })
            } else{
                return res.status(500).send({ mensaje: 'No posee permisos para editar al usuario'});
            }  
        })
    }
}

//ELIMINAR USUARIO 
function EliminarUsuario(req, res) {
    var idUsuario = req.params.idUsuario;
    var paramentros = req.body;

    if (req.user.rol == 'ROL_ADMINISTRADOR') {
        Usuarios.findById(idUsuario, (err, usuarioRol) => {
            if (usuarioRol.rol == "ROL_USUARIO") {
                Usuarios.findByIdAndDelete({ _id: idUsuario }, paramentros, (err, usuarioEliminado) => {
                    if (err) return res.status(500).send({ mensaje: 'Error en la peticion de eliminar usuario' });
                    if (!usuarioEliminado) return res.status(400).send({ mensaje: 'No se pudo eliminar al usuario cliente' });
                    return res.status(200).send({usuarios: usuarioEliminado });
                })
            } else{
                return res.status(500).send({ mensaje: 'No posee permisos para eliminar al usuario'});
            }  
        })
    }
}

//PERFIL DEL USUARIO
//USUARIO AGREGAR UN NUEVO USUARIO
function AgregarUsuarioPerfil(req, res){
    var paramentros = req.body;
    var usuariosModel = new Usuarios();
     
    if(paramentros.nombre, paramentros.email, paramentros.password){
        usuariosModel.nombre = paramentros.nombre;
        usuariosModel.email =  paramentros.email;
        usuariosModel.password = paramentros.password;
        usuariosModel.rol = 'ROL_USUARIO';
            
        if(req.user.rol == "ROL_USUARIO"){
            Usuarios.find({nombre: paramentros.nombre, email: paramentros.email, password: paramentros.password}, (err, clienteGuardado)=>{
                if(clienteGuardado.length == 0){
                    bcrypt.hash(paramentros.password, null,null, (err, passwordEncriptada)=>{
                        usuariosModel.password = passwordEncriptada;
                        usuariosModel.save((err, clienteGuardado) => {
                            if(err) return res.status(500).send({mensaje: 'No se realizo la accion'});
                            if(!clienteGuardado) return res.status(404).send({mensaje: 'No se ha agregado al usuario'});
            
                            return res.status(201).send({usuarios: clienteGuardado});
                         })
                    })
                }else{
                    return res.status(500).send({ mensaje: 'Error en la peticion' });
                }
            })
        }else{
            return res.status(500).send({ mensaje: 'No posee permisos para completar esta accion' });
        } 
    }    
}

//EDITAR PERFIL DEL USUARIO
function EditarUsuarioPerfil(req, res){
    var idUsuario = req.params.idUsuario;
    var paramentros = req.body;

    if(idUsuario == req.user.sub){

    if(req.user.rol == "ROL_USUARIO"){
        Usuarios.findByIdAndUpdate({_id: idUsuario}, paramentros,{new:true},(err, clientePerfilEditado)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!clientePerfilEditado) return res.status(400).send({mensaje: 'No se puedo editar el perfil de usuario'});
                
                return res.status(200).send({usuarios: clientePerfilEditado});
            })
    } else {
        return res.status(500).send({mensaje: 'No posee permisos para completar la peticion'});
    }
    }else{
        return res.status(500).send({mensaje: 'Solo debe editar su propio perfil'});
    }
}

//ELIMINAR PERFIL DEL USUARIO
function EliminarUsuarioPerfil(req, res){
    var idUsuario = req.params.idUsuario;

    if(idUsuario == req.user.sub){

    if(req.user.rol == "ROL_USUARIO"){
        Usuarios.findByIdAndDelete({_id: idUsuario},(err, clientePerfilEliminado)=>{
            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!clientePerfilEliminado) return res.status(400).send({mensaje: 'No se puedo eliminar el perfil de usuario'});
                
                return res.status(200).send({usuarios: clientePerfilEliminado});
            })
    } else {
        return res.status(500).send({mensaje: 'No posee permisos para completar la peticion'});
    }
    }else{
        return res.status(500).send({mensaje: 'Solo debe eliminar su propio perfil'});
    }
}

module.exports = {
    login,
    RegistrarAdmin,
    ObtenerUsuarios,
    RegistrarUsuario,
    EditarUsuario,
    EliminarUsuario,
    AgregarUsuarioPerfil,
    EditarUsuarioPerfil,
    EliminarUsuarioPerfil
}