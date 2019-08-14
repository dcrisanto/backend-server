var express = require('express');
// Para hacer maps de la contraseña que se ingresa con la que se encuentra en la base de datos
var bcrypt = require('bcryptjs');
// Para crear un token
var jwt = require('jsonwebtoken')

var app = express();

var Usuario = require('../models/user');

app.post('/', (req, res) => {
    var body = req.body;
    // Verificando que exista un usuario con el correo electrónico
    // la condición de búsqueda: mientras que el email sea = a body.email
    Usuario.findOne({ email: body.email }, (err, userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuarios',
                errors: err
            })
        }
        // Evaluar si existe un usuario en la base de datos (userDB) con el email indicado
        if (!userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email', // - email: es para saber en que punto está fallando
                errors: err
            });
        }

        // Para verificar la contraseña: nos permite tomar un string que queremos validar con otro string
        // body.password: lo que está escribiendo el usuario y lo comparo con el
        // userDB de la base de datos y regresa un valor booleano
        if (!bcrypt.compareSync(body.password, userDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Crear un token, ya estamos en el caso que el correo y contraseña son válidos
        // Definimos el token, sign(data que quiero colocar en el token: payload): firmar
        userDB.password = ':)'; // Para no mostrar el password
        var token = jwt.sign({ user: userDB }, '@este es un token único@', { expiresIn: 10800 })
        res.status(200).json({
            ok: true,
            message: 'Login',
            user: userDB,
            token: token,
            id: userDB._id
        });
    });


});

module.exports = app;