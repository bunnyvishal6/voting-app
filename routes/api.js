var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Poll = require('../models/polls');
//post /api/about test
router.post('/polls/post', function (req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (err) {
                req.flash('error_msg', "Oops something bad has happened. Please clear your cookies and login again")
                req.session.reset();
                res.redirect('/login');
                throw err;
            } else {
                if (user) {
                    if (user.numberOfPolls < 5) {
                        Poll.createNewPoll(req.body, user, function (err) {
                            if (err) {
                                req.flash('error_msg', 'Something bad happened, please try again later after sometime');
                                res.redirect('/dashboard');
                                throw err;
                            } else {
                                req.flash('success_msg', 'Your post was successfull');
                                res.redirect('/dashboard');
                            }
                        });
                    } else {
                        req.flash('error_msg', 'You cannot create more than 5 polls. If you want to create aother please delete any of your previous polls');
                        res.redirect('/dashboard');
                    }
                } else {
                    req.flash('error_msg', "Oops something bad has happened. Please clear your cookies and login again")
                    req.session.reset();
                    res.redirect('/login');
                }
            }
        });
    }
});

router.post('/polls/delete', function (req, res) {
    if (req.session && req.session.user) {
        User.findOne({ email: req.session.user.email }, function (err, user) {
            if (err) {
                req.flash('error_msg', 'Something bad happened, please try again later after sometime');
                req.session.reset();
                res.redirect('/login');
                throw err;
            } else {
                if (user) {
                    Poll.deletePoll(req.body, user, function (err) {
                        if (err) {
                            req.flash('error_msg', 'Something bad happened, please try again later after sometime');
                            res.redirect('/dashboard');
                        } else {
                            req.flash('success_msg', 'You have successfully deleted your post');
                            res.redirect('/dashboard');
                        }
                    })

                } else {
                    req.flash('error_msg', "Oops something bad has happened. Please clear your cookies and login again")
                    req.session.reset();
                    res.redirect('/login');
                }
            }
        })
    }
});

module.exports = router;