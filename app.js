// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Inicializar variables
var app = express();

// Body parser

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


// Conexión a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', ( err, res ) => {
    if (err) {
        throw err;
    } else {
        console.log('Base de datos \x1b[32m%s\x1b[0m', 'ONLINE');
    }
});

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Running server at port: \x1b[32m%s\x1b[0m', '3000');
});