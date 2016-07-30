var express = require('express');
var router = express.Router();
var session = require('client-sessions');
var bcrypt = require('bcryptjs');
var csrf = require('csurf');
var passport = require('passport');
var facebookLogin = require('../config/passport');



//import Users model
var User = require('../models/users');

//CSRF(Cross site request forgery) protection
router.use(csrf());

//facebook login strategy call
facebookLogin(passport);

// Get Homepage
router.get('/', function (req, res) {
    if (req.session && req.session.user) { //check if had sessoion if so redirect to dashboard else render index
        res.redirect('/dashboard');
    } else {
        res.render('index');
    }
});

//get polls
router.get('/polls', function (req, res) {
    if (req.session && req.session.user) { //check if had sessoion if so render with session else render polls without session
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (!user) {
                req.session.reset();
                res.render('polls');
            } else {
                res.locals.user = user;
                res.render('polls');
            }
        });
    } else {
        res.render('polls');
    }
});

//get login
router.get('/login', function (req, res) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        res.redirect('/dashboard');
    } else {
        res.render('login', { csrfToken: req.csrfToken() });
    }
});

//post login
router.post('/login', function (req, res) {
    var email = req.body.username;
    var password = req.body.password;
    email = email.toLowerCase();
    User.findOne({ email: email, loginType: 'manual' }, function (err, user) {
        if (!user) {
            res.render('login', { error: 'Incorrect username or password', csrfToken: req.csrfToken() });
        } else {
            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = { name: user.name, email: user.email, id: user.id };
                res.redirect('/dashboard');
            } else {
                var token = req.csrfToken();
                res.render('login', { error: 'Incorrect username or password', csrfToken: req.csrfToken() });
            }
        }
    });
});

//get signup
router.get('/signup', function (req, res) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        res.redirect('/dashboard');
    } else {
        res.render('signup', { csrfToken: req.csrfToken() });
    }
});


//post signup
router.post('/signup', function (req, res) {
    var name = req.body.name;
    var email = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    name = name.substring(0, 1).toUpperCase() + name.substring(1, name.length).toLowerCase();
    email = email.toLowerCase();
    var errors;
    User.findOne({ email: email }, function (err, user) { // check if the user with same email already exists if not register else prompt error
        if (user) {
            errors = "The email with which you are trying to signup is already registered try with another email";
            res.render('signup', { error: errors, csrfToken: req.csrfToken() });
        } else {
            if (password === password2) {
                var newUser = new User({
                    name: name,
                    email: email,
                    password: password,
                    loginType: "manual",
                });
                User.createUser(newUser, function (err) {
                    if (err) {
                        throw err;
                    }
                });
                req.flash('success_msg', "Your signup is successfull, now you can login");
                res.redirect('/login');
            } else {
                req.flash('error_msg', "Your passwords do not match");
                res.redirect('/login');
            }
        }
    });
});

//get /auth/facebook
router.get('/auth/facebook',
    passport.authenticate('facebook', { scope: 'email' }));

//get /auth/facebook/callback
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login' }),
    function (req, res) {
        req.session.user = { email: req.session.passport.user };
        res.redirect('/dashboard');
    }
);

//get /auth/google
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

//get /auth/google/callback
router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function (req, res) {
        req.session.user = { email: req.session.passport.user };
        res.redirect('/dashboard');
    }
);

//get dashboard
router.get('/dashboard', function (req, res) {
    if (req.session && req.session.user) { //checking for session if had session then serve dashboard else redirect to home page
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (!user) {
                req.session.reset();
                res.redirect('/');
            } else {
                res.locals.user = { name: user.name, email: user.email, loginType: user.loginType };
                res.render('dashboard', { csrfToken: req.csrfToken() });
            }
        });
    } else {
        req.flash('error_msg', "You should be logged in for your dashboard");
        res.redirect('/login');
    }
});

//get /settings
router.get('/settings', function (req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) { //If error or no user found reset the session else add res.locals.user with required data for messages on settings page.
            if (err) {
                req.session.reset();
                req.flash('error_msg', "Oops something bad happened! please clear your cookies and then login.");
                res.redirect('/');
            } else {
                if (!user) {
                    req.session.reset();
                    req.flash('error_msg', "Oops something bad happened! please clear your cookies and then login.");
                    res.redirect('/');
                } else {
                    res.locals.user = {
                        name: user.name,
                        email: user.email,
                        loginType: user.loginType,
                        canLoginManual: user.canLoginManual
                    };
                    switch (res.locals.user.loginType) {
                        case "manual":
                            res.locals.user.canLoginManual = true;
                            break;
                        case "facebook":
                            res.locals.user.canLoginWithFacebook = true;
                            break;
                        case "google":
                            res.locals.user.canLoginWithGoogle = true;
                    }
                    res.render('settings', { csrfToken: req.csrfToken() });
                }
            }
        })
    } else {
        req.flash('error_msg', "You should be logged in to get access to your settings");
        res.redirect('/login');
    }
});

// post /settings/changePassword
router.post('/settings/changePassword', function (req, res) {
    var password = req.body.password;
    var password1 = req.body.password1;
    var password2 = req.body.password2;
    if (password1 === password2) {
        if (req.session && req.session.user) {
            User.setUserPassword(req.session.user, password, password1, function (num) {
                switch (num) {
                    case 1:
                        req.session.reset();
                        req.flash("error_msg", "something bad happened, please clear your cookies and login again");
                        res.redirect('/login');
                        break;
                    case 2:
                        req.flash("error_msg", "Your current password is incorrect, please try with correct password");
                        res.redirect('/dashboard');
                        break;
                    case 3:
                        req.flash("success_msg", "Your password is successfully reseted");
                        res.redirect('/dashboard');
                        break;
                    case 4:
                        req.flash("success_msg", "Your password successfully added. Now you can login with password and your social account(s)!");
                        res.redirect('/dashboard');
                }
            });
        }
    } else {
        res.render("settings", { "error_msg": "your passwords do not match, please try again" });
    }
});

//get logout
router.get('/logout', function (req, res) {
    req.session.reset();
    req.flash("success_msg", "You are successfully logged out!");
    res.redirect('/');
});

//module exports
module.exports = router;