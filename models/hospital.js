var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var hospitalSchema = new Schema({
    name: { type: String, required: [true, 'El nombre es necesario'] },
    img: { type: String, required: false },
    // Schema.Types.ObjectId,	esto	es	utilizado	para	indicarle	a	Mongoose,	que	ese	campo	es	una	
    // relación	con	otra	colección,	y	la	referencia	es	Usuario. Al	final	este	campo	nos	dirá	qué
    // usuario	creó	el	registro.
    user: { type: Schema.Types.ObjectId, ref: 'User' }
    // evitar	que	Mongoose	coloque	el	nombre	a	la	colección, coloco hospitals.
}, { collection: 'hospitals' });

module.exports = mongoose.model('Hospital', hospitalSchema);