var express = require('express');
var bcrypt = require('bcryptjs');

var jwt = require('jsonwebtoken');

var mdAutentication = require('../middlewares/autenticacion');

var app = express();

var Usuario = require('../models/usuario');

//==========================================================
// Obtener usuarios
//==========================================================
app.get('/', (req, res, next) => {
  Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error cargando usuarios',
        errors: err
      });
    }
    res.status(200).json({ ok: true, usuarios: usuarios });
  });
});



//==========================================================
// Actualizar un usuario
//==========================================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el usuario',
        errors: err
      });
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe el usuario' + id,
        errors: { message: 'No existe un usuario con ese ID' }
      });
    }

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;

    usuario.save((err, usuarioGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el usuario',
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        usuario: usuarioGuardado
      });

      usuarioGuardado.password = ':)';
    });
  });
});

//==========================================================
// Crear un usuario
//==========================================================

app.post('/', mdAutentication.verificaToken, (req, res) => {
  var body = req.body;

  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error creando el usuario',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuarioToken: req.usuario
    });
  });
});

//==========================================================
// Borrar un usuario
//==========================================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
  var id = req.params.id;

  Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el usuario',
        errors: err
      });
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encuentra el usuario',
        errors: err
      });
    }
    res.status(200).json({ ok: true, usuario: usuarioBorrado });
  });
});

module.exports = app;
