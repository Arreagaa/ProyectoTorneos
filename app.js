// IMPORTACIONES
const express = require('express');
const cors = require('cors');
var app = express();

// IMPORTACIONES RUTAS
const UsuarioRutas = require('./src/routes/usuario.routes');
const TorneoRutas = require('./src/routes/torneo.routes');
const EquiposRutas = require('./src/routes/equipos.routes');
const PartidoRutas = require('./src/routes/partido.routes');

// MIDDLEWARES -> INTERMEDIARIOS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// CABECERAS
app.use(cors());

// CARGA DE RUTAS localhost:3000/api/obtenerProductos
app.use('/api', UsuarioRutas, TorneoRutas, EquiposRutas, PartidoRutas);

module.exports = app;