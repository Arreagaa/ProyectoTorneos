//IMPORTACIONES
const express = require('express');
const equipoController = require('../controllers/equipo.controller');
const md_autentificacion = require('../middlewares/autentificacion');

//RUTAS
var api = express.Router();

api.post('/registrarEquipo', md_autentificacion.Auth,equipoController.RegistrarEquipo);
api.get('/obtenerEquipos',md_autentificacion.Auth,equipoController.ObtenerEquipos);
api.put('/editarEquipo/:idEquipo', md_autentificacion.Auth,equipoController.EditarEquipo);
api.delete('/eliminarEquipo/:idEquipo', md_autentificacion.Auth,equipoController.EliminarEquipo);
api.get('/obtenerEquiposTorneo/:nombre',md_autentificacion.Auth,equipoController.ObtenerEquiposTorneo);

//PDF
api.get('/reporteTorneo/:nombre',md_autentificacion.Auth, equipoController.reporteTorneo);

module.exports = api;