var express = require('express');
var app = express();
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =====================================
// Busqueda de todo
// =====================================

app.get('/todo/:busqueda', (req, resp) => {
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([
            busquedaHospitales(busqueda, regex),
            busquedaMedicos(busqueda, regex),
            busquedaUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            resp.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });

        })
});
// =====================================
// Busqueda especifica
// =====================================

app.get('/coleccion/:tabla/:busqueda', (req, resp) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'usuarios':
            promesa = busquedaUsuarios(busqueda, regex);
            break;
        case 'hospitales':
            promesa = busquedaHospitales(busqueda, regex);
            break;
        case 'medicos':
            promesa = busquedaMedicos(busqueda, regex);
            break;

        default:
            return resp.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son usuarios, medicos y hospitales',
                error: { messsage: 'Tipo de coleccion / tabla no valida' }
            });

    }
    promesa.then(data => {
        resp.status(200).json({
            ok: true,
            [tabla]: data


        });

    });


});

function busquedaHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);

                } else {
                    resolve(hospitales);

                }
            });
    });
}

function busquedaMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital', 'nombre')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar medicos', err);

                } else {
                    resolve(hospitales);

                }
            });
    });
}

function busquedaUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;