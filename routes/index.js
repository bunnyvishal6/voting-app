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
        res.redirect('/');
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

//get signup
router.get('/signup', function (req, res) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user;
        res.redirect('/dashboard');
    } else {
        res.render('signup', { csrfToken: req.csrfToken() });
    }
});


//post login
router.post('/login', function (req, res) {
    var email = req.body.username;
    var password = req.body.password;
    email = email.toLowerCase();
    User.findOne({ email: email }, function (err, user) {
        if (!user) {
            res.render('login', { error: 'Invalid username or password', csrfToken: req.csrfToken() });
        } else {
            if (bcrypt.compareSync(password, user.password)) {
                req.session.user = { name: user.name, email: user.email, id: user.id };
                res.redirect('/dashboard');
            } else {
                var token = req.csrfToken();
                res.render('login', { error: 'Invalid username or password', csrfToken: req.csrfToken() });
            }
        }
    });
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
                    loginType: "manual"
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

//get logout
router.get('/logout', function (req, res) {
    req.session.reset();
    req.flash("success_msg", "You are successfully logged out!");
    res.redirect('/');
});

//module exports
module.exports = router;