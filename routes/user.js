var express = require('express');
// uso de la librería bcrypt para encriptar la contraseña
var bcrypt = require('bcryptjs');

var app = express();

// Importar nuestro modelo de usuario
var User = require('../models/user')

// ================================================================================
// Obtener todos los usuarios
// ================================================================================
// Rutas
app.get('/', (req, res, next) => {

    //find es gracias a mongo, donde defino el query que quiero usar para la búsqueda
    // {}: quiero que busque todo
    // () => {}: resultado de la búsqueda, viene como un callback
    User.find({}, 'name email img roles')
        .exec(
            (err, users) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error de Base de datos',
                        errors: err
                    });
                }
                // Si no ocurre ningún error
                res.status(200).json({
                    ok: true,
                    message: 'Get de usuarios!',
                    // Regreso el arreglo de todos los usuarios: users: users o simplemente users
                    users
                });
            })

});

// ================================================================================
// Crear un nuevo usuario
// ================================================================================

app.post('/', (req, res) => {
    // Extraemos body: En la parte del post recibiré la información que la persona envíe mediante un post:
    var body = req.body; // sólo funcionará si se tiene el parser

    // Creando un nuevo usuario, es decir una referencia (modelo de datos creado) 
    // bajo una variable tipo usuario
    var user = new User({
        name: body.name,
        email: body.email,
        // encriptando clave
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        rol: body.rol

    });

    // Grabación usando mongoose, recibo un callback que regresa cuando se graba un usuario
    user.save((err, userSave) => {
        // Si ocurre un error 
        if (err) {
            return res.status(500).json({
                ok: false,
                menssage: 'Error al crear un usuario',
                errors: err
            });
        }
        // Si está todo ok, envío respuesta 201: Recurso creado
        res.status(201).json({
            ok: true,
            message: 'Usuario creado',
            user: userSave // user: nombre de la propiedad que retorno y userSave: base de datos
        });

    });

});

// Usar fuera
module.exports = app;