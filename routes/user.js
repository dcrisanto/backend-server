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
// Verificar token: MilderWare
// ================================================================================
// Se coloca aquí debido a que todos los métodos que están después lo van a utilizar,
// Por lo que tienen  que pasar antes por el milderware, es decir cualquier ruta
// que se encuentre debajo de esta paso antes por aqui
// si queremos recibir el token por el url '/:token'
app.use('/', (req, res, next) => {
    // recibiendo el token
    var token = req.query.token;

})


// ================================================================================
// Actualizar usuario :id indico que es un recurso necesario que debe enviar
// ================================================================================

app.put('/:id', (req, res) => {
    var id = req.params.id;
    var body = req.body;

    User.findById(id, (err, user) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuario',
                errors: err
            })
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                message: 'Error al no encontrar usuario con el id ' + id,
                errors: err
            });
        }

        user.name = body.name;
        user.email = body.email;
        user.rol = body.rol;

        // Grabar el usuario actualizado

        user.save((err, updatedUser) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    message: 'Error al actualizar usuario con el id ' + id,
                    errors: err
                });
            }

            updatedUser.password = ':)';

            res.status(200).json({
                ok: true,
                updatedUser
            });

        });
    });

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

// ================================================================================
// Borrar un usuario por el id
// ================================================================================

app.delete('/:id', (req, res) => {
    var id = req.params.id;
    User.findByIdAndRemove(id, (err, userDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                menssage: 'Error al remover user',
                errors: err
            });
        }

        if (!userDelete) {
            return res.status(400).json({
                ok: false,
                menssage: 'No existe un usuario con el ' + id,
                errors: { menssage: 'No existe un usuario con el ' + id }
            })
        }

        res.status(200).json({
            ok: true,
            message: 'Usuario removido',
            userDelete
        });
    });
});

// Usar fuera
module.exports = app;