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
    loginType: String,
    canLoginManual: Boolean,
    numberOfPolls: Number
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

//export setUserPassword to set new password or update old password
module.exports.setUserPassword = function (currUser, oldPass, newPass, callback) {
    User.findOne({ email: currUser.email }, function (err, user) {
        if (err) {
            callback(1);
            throw err;
        } else {
            if (!user) {
                callback(1);
                return;
            } else {
                if (user.password) {
                    if (bcrypt.compareSync(oldPass, user.password)) {
                        bcrypt.genSalt(10, function (err, salt) {
                            bcrypt.hash(newPass, salt, function (err, hash) {
                                user.password = hash;
                                user.save(function (err) {
                                    if (err) { callback(1) }
                                });
                                callback(3)
                                return;
                            });
                        });
                    } else {
                        callback(2);
                        return;
                    }
                } else {
                    bcrypt.genSalt(10, function (err, salt) {
                        bcrypt.hash(newPass, salt, function (err, hash) {
                            user.password = hash;
                            user.canLoginManual = true;
                            user.save(function (err) {
                                if (err) { callback(1) }
                            });
                            callback(4)
                        });
                    });
                    return;
                }
            }
        }
    });
}