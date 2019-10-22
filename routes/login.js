var express = require('express');
// Para hacer maps de la contraseña que se ingresa con la que se encuentra en la base de datos
var bcrypt = require('bcryptjs');
// Importando la librería del jwt
var jwt = require('jsonwebtoken')
    // Para usar la variable creada con el cit
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/user');
// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

// ================================================================================
// Authentication google
// ================================================================================
// async indica que retorna una promesa
async function verify(token) {
    // await espera a que esto(verifyIdToken) resuelva y cuando lo haga lo graba en ticket
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    // payload: esta toda la información del usuario
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    // Se retorna solo lo necesario
    return {
        name: payload.name,
        email: payload.email,
        img: payload.picture,
        googleUser: true,
        payload
    }
}

// coloco async para poder utilizar el await
app.post('/google', async(req, res) => {
    const token = req.body.token;
    const googleUser = await verify(token)
        // Si no es válido el token disparará un catch
        .catch(e => {
            return res.status(403).json({
                ok: false,
                message: 'Token no válido'
            })
        })
    return res.status(200).json({
        ok: true,
        message: 'Authentication with google',
        googleUser
    });
});



// ================================================================================
// Authentication normal
// ================================================================================
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
        var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 10800 })
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