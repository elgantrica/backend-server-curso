var express = require('express');

var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, resp, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;
    // tipos de coleccion

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no valido',
            errors: { message: 'Tipo de coleccion no valido' }
        })

    }


    if (!req.files) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        })
    }
    // Obtener nombre de archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];
    // Solo estas extensiones acepta

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extensionesValidas.indexOf(extensionArchivo.toLowerCase()) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        })

    }
    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    //Mover archvio del temporal a un path en especifico
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, err => {
        if (err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });

        }
        subirPorTipo(tipo, id, nombreArchivo, resp);


    });

});

function subirPorTipo(tipo, id, nombreArchivo, resp) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuario) => {
                if (!usuario) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'Usuario no existe' }

                    });

                }
                var pathViejo = './uploads/usuarios/' + usuario.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (err) => {
                        if (err) {
                            return resp.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar archivo existente',
                                errors: err


                            });
                        }


                    });
                }
                usuario.img = nombreArchivo;
                usuario.save((err, usuarioActualizado) => {
                    usuarioActualizado.password = ':)';

                    return resp.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioActualizado
                    });
                });
            });


            break;
        case 'medicos':
            Medico.findById(id, (err, medico) => {
                if (!medico) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Medico no existe',
                        errors: { message: 'Medico no existe' }

                    });

                }
                var pathViejo = './uploads/medicos/' + medico.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (err) => {
                        if (err) {
                            return resp.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar archivo existente',
                                errors: err


                            });
                        }


                    });
                }
                medico.img = nombreArchivo;
                medico.save((err, medicoActualizado) => {
                    return resp.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoActualizado
                    });
                });
            });

            break;
        case 'hospitales':
            Hospital.findById(id, (err, hospital) => {
                if (!hospital) {
                    return resp.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no existe',
                        errors: { message: 'Hospital no existe' }

                    });

                }

                var pathViejo = './uploads/hospitales/' + hospital.img;
                // Si existe, elimina la imagen anterior
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo, (err) => {
                        if (err) {
                            return resp.status(500).json({
                                ok: false,
                                mensaje: 'Error al eliminar archivo existente',
                                errors: err


                            });
                        }


                    });
                }
                hospital.img = nombreArchivo;
                hospital.save((err, hospitalActualizado) => {
                    return resp.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        hospital: hospitalActualizado
                    });
                });
            });

            break;

        default:
            break;
    }

}

module.exports = app;