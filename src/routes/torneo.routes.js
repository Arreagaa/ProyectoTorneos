//IMPORTACIONES
const express = require('express');
const torneoController = require('../controllers/torneo.controller');
const md_autentificacion = require('../middlewares/autentificacion');

//RUTAS
var api = express.Router();

api.get('/obtenerTorneos',md_autentificacion.Auth,torneoController.ObtenerTorneos);
api.post('/registrarTorneo', md_autentificacion.Auth,torneoController.RegistrarTorneo);
api.put('/editarTorneo/:idTorneo',md_autentificacion.Auth,torneoController.EditarTorneo);
api.delete('/eliminarTorneo/:idTorneo',md_autentificacion.Auth,torneoController.EliminarTorneo);

//FUNCIONES ADMINISTRATIVAS
api.get('/obtenerTorneosAdmin',md_autentificacion.Auth,torneoController.ObtenerTorneosAdmin);
api.put('/editarTorneoAdmin/:idTorneo',md_autentificacion.Auth,torneoController.EditarTorneoAdmin);
api.delete('/eliminarTorneoAdmin/:idTorneo',md_autentificacion.Auth,torneoController.EliminarTorneoAdmin);

module.exports = api;