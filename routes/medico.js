var express = require('express');

var jwt = require('jsonwebtoken');

var mdAutentication = require('../middlewares/autenticacion');

var app = express();

var Medico = require('../models/medico');

//==========================================================
// Obtener medico
//==========================================================
app.get('/', (req, res, next) => {
  
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({}, 'nombre')
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec((err, medicos) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando medicos',
          errors: err
        });
      }
      Medico.count({}, (err, conteo) => {
        res.status(200).json({ ok: true, medicos: medicos, total: conteo });
      });
    });
});

//==========================================================
// Actualizar un medico
//==========================================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el medico',
        errors: err
      });
    }

    if (!medico) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe el medico' + id,
        errors: { message: 'No existe un medico con ese ID' }
      });
    }

    medico.nombre = body.nombre;
    medico.usuario = req.usuario._id;
    medico.hospital = body.hospital;

    medico.save((err, medicoGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el medico',
          errors: err
        });
      }
      res.status(200).json({ ok: true, medico: medicoGuardado });
    });
  });
});

//==========================================================
// Crear un medico
//==========================================================

app.post('/', mdAutentication.verificaToken, (req, res) => {
  var body = req.body;

  var medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error creando el medico',
        errors: err
      });
    }
    res.status(201).json({ ok: true, medico: medicoGuardado });
  });
});

//==========================================================
// Borrar un medico
//==========================================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
  var id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el medico',
        errors: err
      });
    }

    if (!medicoBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encuentra el medico',
        errors: err
      });
    }
    res.status(200).json({ ok: true, medico: medicoBorrado });
  });
});
module.exports = app;
