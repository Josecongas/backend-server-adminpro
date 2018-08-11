var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
  var tipo = req.params.tipo;
  var id = req.params.id;

  // Tipos de colección
  var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Colección no válida',
      errors: {
        message:
          'Debe seleccionar un tipo de los siguientes: ' +
          tiposValidos.join(' ,')
      }
    });
  }

  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: 'No se ha subido ningún archivo',
      errors: { message: 'Debe seleccionar una imagen' }
    });
  }

  // Obtener nombre del archivo
  var archivo = req.files.imagen;
  var nombreCortado = archivo.name.split('.');
  var extension = nombreCortado[nombreCortado.length - 1];

  // Solo aceptamos estas extensiones
  var extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];

  if (extensionesValidas.indexOf(extension) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Extensión no válida',
      errors: {
        message:
          'Debe seleccionar una imagen con una de las siguientes extensiones ' +
          extensionesValidas.join(' ,')
      }
    });
  }

  // Nombre de archivo personalizado
  var nombreArchivo = `${id}.${extension}`;

  // Mover el archivo del temporal a un path
  var path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al mover el archivo',
        errors: err
      });
    }

    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {


  if (tipo === 'usuarios') {

    Usuario.findById(id, (err, usuario) => {
      
      
      if (!usuario){
        return res
          .status(400)
          .json({
            ok: false,
            mensaje: 'El usuario no existe',
            errors: {message: 'El usuario no existe'}
          });
      }


      var pathViejo = './uploads/usuarios/' + usuario.img;

      // Si existe elimina la imagen anterior
      if (fs.existsSync(pathViejo)) {
        fs.unlink(pathViejo);
      }

      usuario.img = nombreArchivo;

      usuario.save((err, usuarioActualizado) => {

        usuarioActualizado.password = ':)';

        return res.status(200).json({
          ok: true,
          mensaje: 'Imagen de usuario actualizada',
          usuario: usuarioActualizado
        });
      })
    });
  }

  if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

             if (!medico) {
               return res
                 .status(400)
                 .json({
                   ok: false,
                   mensaje: 'El médico no existe',
                   errors: { message: 'El médico no existe' }
                 });
             }

          var pathViejo = './uploads/medicos/' + medico.img;

          // Si existe elimina la imagen anterior
          if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
          }

          medico.img = nombreArchivo;

          medico.save((err, medicoActualizado) => {
            return res
              .status(200)
              .json({
                ok: true,
                mensaje: 'Imagen de medico actualizada',
                medico: medicoActualizado
              });
          });
        });
  }

  if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

             if (!hospital) {
               return res
                 .status(400)
                 .json({
                   ok: false,
                   mensaje: 'El hospital no existe',
                   errors: { message: 'El hospital no existe' }
                 });
             }

          var pathViejo = './uploads/hospitales/' + hospital.img;

          // Si existe elimina la imagen anterior
          if (fs.existsSync(pathViejo)) {
            fs.unlink(pathViejo);
          }

          hospital.img = nombreArchivo;

          hospital.save((err, hospitalActualizado) => {
            return res
              .status(200)
              .json({
                ok: true,
                mensaje: 'Imagen de hospital actualizada',
                hospital: hospitalActualizado
              });
          });
        });
  }
}

module.exports = app;
