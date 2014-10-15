var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var MessageSchema   = new Schema({
	id_fb_send: String,
	id_fb_rec: String,
	mess: String,
	datetime: { type : Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);