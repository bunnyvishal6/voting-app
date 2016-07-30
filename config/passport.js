var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User = require('../models/users');
var authConfig = require('./auth');

//function for finding a user or creaing new user
function findOrCreate(profile, loginType, done) {
    User.findOne({
        email: profile.emails[0].value,
    }, function (err, user) {
        if (err) {
            throw err;
        } else {
            if (user) {
                done(null, user);
            } else {
                var fn = profile.name.givenName;
                var ln = profile.name.familyName;
                var name = fn.substring(0, 1).toUpperCase() + fn.substring(1, fn.length).toLowerCase() + " " + ln.substring(0, 1).toUpperCase() + ln.substring(1, ln.length).toLowerCase();
                var newUser = new User({
                    name: name,
                    email: profile.emails[0].value.toLowerCase(),
                    loginType: loginType
                });
                User.createUser(newUser, function (err) { if (err) { throw err } });
                done(null, newUser);
            }
        }
    });
}

module.exports = function (passport) {
    //passport serializeUser
    passport.serializeUser(function (user, done) {
        done(null, user.email);
    });

    //passport deserializeUser
    passport.deserializeUser(function (email, done) {
        User.findOne({ email: email }, function (err, user) {
            if (err) {
                throw err;
            } else if (user == null) {
                done(err, false);
            } else {
                var person = { name: user.name, email: user.email, loginType: user.loginType };
                done(err, person);
            }
        });
    });

    //creating and using facebook strategy
    passport.use(new FacebookStrategy({
        clientID: authConfig.facebookAuth.clientID,
        clientSecret: authConfig.facebookAuth.clientSecret,
        callbackURL: authConfig.facebookAuth.callbackURL,
        profileFields: ['id', 'email', 'gender', 'name']
    },
        function (accessToken, refreshToken, profile, done) {
            findOrCreate(profile, "facebook", done);
        }
    ));

    //creating and using google strategy
    passport.use(new GoogleStrategy({
        clientID: authConfig.googleAuth.clientID,
        clientSecret: authConfig.googleAuth.clientSecret,
        callbackURL: authConfig.googleAuth.callbackURL
    },
        function (accessToken, refreshToken, profile, done) {
            findOrCreate(profile, "google", done);
        }
    ));
};