//IMPORTACIONES
const express = require('express');
const partidoController = require('../controllers/partido.controller');
const md_autentificacion = require('../middlewares/autentificacion');

//RUTAS
var api = express.Router();

api.post('/partidoJugado', md_autentificacion.Auth,partidoController.partidoJugado);
api.get('/ObtenerTablaTorneo/:nombre', md_autentificacion.Auth,partidoController.ObtenerTablaTorneo);
api.get('/tablaTorneo/:nombre', md_autentificacion.Auth,partidoController.tablaTorneo);

module.exports = api;