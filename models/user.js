var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
// Definir esquemas
var Schema = mongoose.Schema;
// Creo un objeto para validar que roles voy a permitir
var rolesValidators = {
    values: ['ADMIN_ROL', 'USER_ROL'],
    // Si ocurre un error con eso lo muestro
    message: '{VALUE} no es un rol válido'
};
// Definirlo con el nombre de la colección + Schema
// Una función que recibe un objeto de js
var userSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    // Para que aplique el validator de los roles
    rol: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidators }
});

// Para indicar que en el esquema estará el uniqueValidator:
// Al colocar PATH: Lee la propiedad que tenga unique
userSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });

// Exportamos para poder usar este esquema fuera de este archivo ('nombre que quiero que tenga el esquema', 
// 'objeto que quiero que relacione')
module.exports = mongoose.model('User', userSchema);