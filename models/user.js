var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	passportLocalMongoose = require('passport-local-mongoose');
const User = new Schema({
	username: String,
	email: String,
	password: String,
	admin: Boolean,
	date: Date,
	about: String,
	mm: {
		oauthID: String
	}
},{collection: 'userInfo'});
User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);