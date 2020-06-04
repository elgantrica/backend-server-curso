var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();
var Usuario = require('../models/usuario');

// Google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// =====================================
// Autenticacion Google
// =====================================
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, resp) => {
    var token = req.body.token;
    var googleUser = await verify(token)
        .catch(err => {
            return resp.status(400).json({
                ok: false,
                mensaje: 'token no valido'
            });
        });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err

            });
        }
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return resp.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal',
                    errors: err

                });
            } else {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //14 horas

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });

            }
        } else {
            // el usuario no existe
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)'

            usuario.save((err, usuarioDB) => {
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //14 horas

                resp.status(200).json({
                    ok: true,
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB.id
                });

            });
        }
    });
    // return resp.status(200).json({
    //     ok: true,
    //     googleUser: googleUser

    // });

});

// =====================================
// Autenticacion normal
// =====================================

app.post('/', (req, resp) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuarios',
                errors: err

            });
        }
        if (!usuarioDB) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err

            });

        }
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err

            });

        }
        // Crear un token !!!
        usuarioDB.password = ':)'
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); //14 horas

        resp.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB.id
        });

    });

});

module.exports = app;