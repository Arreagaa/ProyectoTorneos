const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var torneosSchema = Schema ({
    nombre: String,
    descripcion: String,
    idUsuario: {type: Schema.Types.ObjectId, ref: 'usuarios'} 
});

module.exports = mongoose.model('torneos', torneosSchema);