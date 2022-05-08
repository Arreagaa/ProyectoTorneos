//IMPORTACIONES
const express = require('express');
const usuarioController = require('../controllers/usuario.controller');
const md_autentificacion = require('../middlewares/autentificacion');

//RUTAS
var api = express.Router();

//LOGIN
api.post('/login', usuarioController.login);

api.post('/registrarUsuario', md_autentificacion.Auth,usuarioController.RegistrarUsuario);
api.get('/obtenerUsuarios',md_autentificacion.Auth,usuarioController.ObtenerUsuarios);
api.put('/editarUsuario/:idUsuario', md_autentificacion.Auth,usuarioController.EditarUsuario);
api.delete('/eliminarUsuario/:idUsuario', md_autentificacion.Auth,usuarioController.EliminarUsuario);

//PERFIL USUARIO
api.post('/AgregarUsuarioPerfil', md_autentificacion.Auth,usuarioController.AgregarUsuarioPerfil);
api.put('/editarUsuarioPerfil/:idUsuario', md_autentificacion.Auth,usuarioController.EditarUsuarioPerfil);
api.delete('/eliminarUsuarioPerfil/:idUsuario', md_autentificacion.Auth,usuarioController.EliminarUsuarioPerfil);

module.exports = api;