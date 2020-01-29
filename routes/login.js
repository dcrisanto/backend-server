var express = require('express');
// Para hacer maps de la contraseña que se ingresa con la que se encuentra en la base de datos
var bcrypt = require('bcryptjs');
// Importando la librería del jwt
var jwt = require('jsonwebtoken')
    // Para usar la variable creada con el cit
var SEED = require('../config/config').SEED;

var app = express();

var User = require('../models/user');
// Google
// Importando el ClientId
const CLIENT_ID = require('../config/config').CLIENT_ID;
// Extrae el OAuth2Client de la librería
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
        google: true
    }
}

// coloco async para poder utilizar el await
app.post('/google', async(req, res) => {
    let token = req.body.token;
    // El await para indicarle que espere la respuesta de la función verify y envía el token            
    const googleUser = await verify(token)
        // Si no es válido el token disparará un catch
        .catch(e => {
            return res.status(403).json({
                ok: false,
                message: 'Token no válido'
            });
        });
    // Verificar que el usuario ya se encuentre registrado en mi base de datos
    // condición sería el email y recibiría un error o el user
    User.findOne({ email: googleUser.email }, (err, userDB) => {
        // Error de base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al bucar usuario',
                errors: err
            });
        }
        // Usuario existe en la base de datos
        if (userDB) {
            // Si el usuario no fue autenticado por google 
            if (userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    message: 'Debe usar su autenticación normal',
                    userDB
                });
            } else { // Usuario ya fue autenticado con google previamente
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 10800 })
                res.status(200).json({
                    ok: true,
                    message: 'Autenticación de google ok',
                    user: userDB,
                    token: token,
                    id: userDB._id
                });
            }
        }
        if (!userDB) {
            // El usuario no existe ...hay que crearlo
            // Creando una instancia de user
            const user = new User({
                // Estableciendo los valores que tendría el user
                name: googleUser.name,
                email: googleUser.email,
                img: googleUser.img,
                google: googleUser.google,
                password: ':)',

            });


            user.save((err, userDB) => {
                var token = jwt.sign({ user: userDB }, SEED, { expiresIn: 10800 });

                // Si ocurre un error
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al crear usuario de google',
                        errors: err
                    });
                }
                // Si está todo ok, envío respuesta 201: Recurso creado
                res.status(201).json({
                    ok: true,
                    message: 'Usuario creado por google',
                    token: token,
                    user: userDB,
                    id: userDB._id

                });
            });

        }
    });
    /*return res.status(200).json({
        ok: true,
        message: 'Authentication with google',
        googleUser
    });*/
});



// ================================================================================
// Authentication normal
// ================================================================================
app.post('/', (req, res) => {
    var body = req.body;
    // Verificando que exista un usuario con el correo electrónico
    // la condición de búsqueda: mientras que el email sea = a body.email
    User.findOne({ email: body.email }, (err, userDB) => {

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