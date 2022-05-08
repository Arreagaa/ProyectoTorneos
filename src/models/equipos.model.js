const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EquiposSchema = Schema ({
    nombreEquipo: String,
    descripcionEquipos: String,
    golesAnotados: Number,
    golesRecibidos: Number,
    diferenciaGoles: Number,
    puntosTorneo: Number,
    partidos: Number,
    idTorneo:{type: Schema.Types.ObjectId, ref: 'torneos'},
    idUsuario: {type: Schema.Types.ObjectId, ref: 'usuarios'} 
});

module.exports = mongoose.model('equipos', EquiposSchema);