var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

// ================================================================================
// Verificar token: MilddlerWare
// ================================================================================
// Exportar para poder usar las funciones del Middelware
exports.verificationToken = (req, res, next) => {
    // Se coloca aquí debido a que todos los métodos que están después lo van a utilizar,
    // Por lo que tienen  que pasar antes por el milderware, es decir cualquier ruta
    // que se encuentre debajo de esta paso antes por aqui ( esto era si se realizaba en el user.js)
    // app.use('/', (req, res, next) => {
    // recibiendo el token
    var token = req.query.token; // recibiendo el token por el url de la petición
    // Comprobación del token
    jwt.verify(token, SEED, (err, decoded) => { // decoded es la información del usuario (payload)
        if (err) {
            return res.status(401).json({
                ok: false,
                menssage: 'Token incorrecto',
                errors: err

            });
        }

        // Para tener la información del usuario siempre disponible en el request
        req.user = decoded.user;
        next();
        // Esto está en el decoded
        /*res.status(200).json({
            ok: true,
            decoded: decoded
        });*/

    });

}

// ================================================================================
// Verificar Admin
// ================================================================================

exports.vericationAdmin = (req, res, next) => {
    // Obteniendo las propiedades del objeto user
    var user = req.user;
    // Si el rol del usuario es administrador se debe ejecutar los demás procesos
    if (user.rol === 'ADMIN_ROL') {
        next();
        return;
    } else {
        return res.status(401).json({
            ok: false,
            menssage: 'Token incorrecto - No es usuario administrador',
            errors: { menssage: 'No es administrador' }

        });
    }

}