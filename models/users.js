var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

//Schema for user store in database
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var User = mongoose.model('User', new Schema({
    id: ObjectId,
    name: String,
    email: { type: String, unique: true },
    password: String,
    loginType: String
}));

//export User model and a create User function to hash the password
module.exports = User;
module.exports.createUser = function (newUser, callback) {
    if (newUser.password) {
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(newUser.password, salt, function (err, hash) {
                newUser.password = hash;
                newUser.save(callback);
            });
        });
    } else {
        newUser.save(callback);
    }
};