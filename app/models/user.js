var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
	id_fb: String,
	name: String,
	bio: String,
	email: String,
	first_name: String,
	last_name: String,
	link: String,
	locale: String,
	timezone: String,
	updated_time: String,
	verified: String,
	server_token: String,
	geolocation: String,
	last_access: { type : Date, default: Date.now },
	datetime_last: { type : Date, default: Date.now },
	datetime_update_settings: { type : Date, default: Date.now },
	datetime_update_profil: { type : Date, default: Date.now },
	datetime_create: { type : Date, default: Date.now },
	datetime_last_login: { type : Date, default: Date.now },
	settings: String
});

module.exports = mongoose.model('User', UserSchema);