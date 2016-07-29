var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../models/users');
var authConfig = require('./auth');

module.exports = function (passport) {
    //passport serializeUser
    passport.serializeUser(function (user, done) {
        done(null, user.email);
    });

    //passport deserializeUser
    passport.deserializeUser(function (email, done) {
        User.findOne({ email: email }, function (err, user) {
            var person = { name: user.name, email: user.email, loginType: user.loginType };
            done(err, person);
        });
    });
    passport.use(new FacebookStrategy({
        clientID: authConfig.facebookAuth.clientID,
        clientSecret: authConfig.facebookAuth.clientSecret,
        callbackURL: "http://localhost:80/auth/facebook/callback",
        profileFields: ['id', 'email', 'gender', 'name']
    },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({
                email: profile.emails[0].value,
            }, function (err, user) {
                if (err) {
                    throw err;
                } else {
                    if (user) {
                        done(null, user);
                    } else {
                        var newUser = new User({
                            name: profile.name.givenName + " " + profile.name.familyName,
                            email: profile.emails[0].value,
                            loginTye: "facebook"
                        });
                        User.createUser(newUser, function (err) { if (err) { throw err } });
                        done(null, newUser);
                    }
                }
            });
        }
    ));
};