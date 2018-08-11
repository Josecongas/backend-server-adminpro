var express = require('express');

var jwt = require('jsonwebtoken');

var mdAutentication = require('../middlewares/autenticacion');

var app = express();

var Hospital = require('../models/hospital');

//==========================================================
// Obtener hospitales
//==========================================================
app.get('/', (req, res, next) => {
  
  var desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate('usuario', 'nombre email')
    .exec((err, hospitales) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'Error cargando hospitales',
          errors: err
        });
      }

      Hospital.count({}, (err, conteo) => {
        res
          .status(200)
          .json({ ok: true, hospitales: hospitales, total: conteo });
      });
    });
});

//==========================================================
// Actualizar un hospital
//==========================================================

app.put('/:id', mdAutentication.verificaToken, (req, res) => {
  var id = req.params.id;
  var body = req.body;

  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al buscar el hospital',
        errors: err
      });
    }

    if (!hospital) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No existe el hospital' + id,
        errors: { message: 'No existe un hospital con ese ID' }
      });
    }

    hospital.nombre = body.nombre;

    hospital.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Error al actualizar el hospital',
          errors: err
        });
      }
      res.status(200).json({ ok: true, hospital: hospitalGuardado });
    });
  });
});

//==========================================================
// Crear un hospital
//==========================================================

app.post('/', mdAutentication.verificaToken, (req, res) => {
  var body = req.body;

  var hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Error creando el hospital',
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado
    });
  });
});

//==========================================================
// Borrar un hospital
//==========================================================

app.delete('/:id', mdAutentication.verificaToken, (req, res) => {
  var id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al borrar el hospital',
        errors: err
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se encuentra el hospital',
        errors: err
      });
    }
    res.status(200).json({ ok: true, hospital: hospitalBorrado });
  });
});
module.exports = app;
