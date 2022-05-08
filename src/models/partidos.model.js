const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PartidosSchema = Schema ({
    descripcionPartido: String,
    golesLocal: Number,
    golesVisita: Number,
    jornadaJugada: Number,
    EquipoLocal:{type: Schema.Types.ObjectId, ref: 'equipos'},
    EquipoVisita: {type: Schema.Types.ObjectId, ref: 'equipos'} 
});

module.exports = mongoose.model('partidos', PartidosSchema);