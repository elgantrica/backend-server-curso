var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutentificacion = require('../middlewares/autentificacion');

var Medico = require('../models/medico');

// =====================================
// Obtener todos los medicos
// =====================================

app.get('/', (req, resp, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre')
        .exec(
            (err, medicos) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        message: 'Error cargando medicos',
                        errors: err
                    });
                }
                Medico.count({}, (err, conteo) => {
                    resp.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                });


            }

        );
});

// =====================================
// Actualizar medico por Id
// =====================================

app.put('/:id', mdAutentificacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                message: 'Error al buscar medico',
                errors: err
            });

        }
        if (!medico) {
            return resp.status(400).json({
                ok: false,
                message: `No existe un medico con el id ${id}`,
                errors: { message: 'No existe medico para el id especificado' }
            });
        }
        medico.nombre = body.nombre;
        medico.img = body.img;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, medicoActualizado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    message: 'Error al actualizar medico',
                    errors: err
                });

            }
            resp.status(200).json({
                ok: true,
                medico: medicoActualizado
            });
        });

    });
});

// =====================================
// Agregar medicos
// =====================================

app.post('/', mdAutentificacion.verificaToken, (req, resp) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                message: 'Error al guardar medico',
                errors: err
            });

        }
        resp.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });
});
// =====================================
// Eliminar medico por id
// =====================================

app.delete('/:id', mdAutentificacion.verificaToken, (req, resp) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrar) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al eliminar medico',
                errors: err
            });

        }
        if (!medicoBorrar) {
            return resp.status(400).json({
                ok: false,
                message: 'No existe un medico con el id especificado',
                errors: { message: 'No existe medico con el id especificado' }
            });
        }
        resp.status(200).json({
            ok: true,
            medico: medicoBorrar
        });
    });
});


module.exports = app;