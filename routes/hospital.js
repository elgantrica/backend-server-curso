var express = require('express');
var app = express();
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutentificacion = require('../middlewares/autentificacion');

var Hospital = require('../models/hospital');

// =====================================
// Obtener todos los hospitales
// =====================================

app.get('/', (req, resp, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return resp.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err

                    });
                }
                Hospital.count({}, (err, conteo) => {
                    resp.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });

                });


            });

});


// =====================================
// Actualizar hospital
// =====================================

app.put('/:id', mdAutentificacion.verificaToken, (req, resp) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {
        if (!hospital) {
            return resp.status(400).json({
                ok: false,
                mensaje: `El hospital con el id: ${id} no existe`,
                errors: { mensaje: 'No existe un hospital con ese ID' }

            });
        }
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err

            });
        }


        hospital.nombre = body.nombre;
        // hospital.img = body.img;
        hospital.usuario = req.usuario._id;
        // hospital.usuario = '5ed15aa6a86e7538a4492b5d'

        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Error al crear hospital',
                    errors: err

                });
            }
            resp.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

})

// =====================================
// Crear un nuevo hospital
// =====================================

app.post('/', mdAutentificacion.verificaToken, (req, resp) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
            // usuario: '5ed15aa6a86e7538a4492b5d'

    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err

            });
        }
        resp.status(200).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });

});

// =====================================
// Borrar un hospital por el id
// =====================================
app.delete('/:id', mdAutentificacion.verificaToken, (req, resp) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                message: 'Error al borrar hospital',
                error: err
            });
        }
        if (!hospitalBorrado) {
            return resp.status(400).json({
                ok: false,
                message: `No existe un hospital con el id: ${id}`,
                error: { message: 'No existe un hospital con el id especificado' }
            });

        }
        resp.status(200).json({
            ok: true,
            usuario: hospitalBorrado,
            usuarioToken: req.usuario
        });


    });

});

module.exports = app;