UsuarioController = require('./src/controllers/usuario.controller');
const mongoose = require('mongoose');
const app = require('./app');

mongoose.Promise = global.Promise;                                                                
mongoose.connect('mongodb://localhost:27017/ProyectoLigas', { useNewUrlParser: true, useUnifiedTopology: true }).then(()=>{
    console.log("Se encuentra conectado a la base de datos.");

    app.listen(3000, function () {
    })
    
    UsuarioController.RegistrarAdmin();

}).catch(error => console.log(error));