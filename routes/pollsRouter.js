var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Poll = require('../models/polls');
var shortid = require('shortid');
var csrf = require('csurf');

//CSRF(Cross site request forgery) protection
router.use(csrf());

//post post a poll
router.post('/post', function (req, res) {
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
                        Poll.createNewPoll(req.body, user, function (err, url) {
                            if (err) {
                                req.flash('error_msg', 'Something bad happened, please try again later after sometime');
                                res.redirect('/dashboard');
                                throw err;
                            } else {
                                req.flash('success_msg', 'Your post was successfully and here is the url of your poll:' + ' https://bunny-votingappherokuapp.com/polls/' + url);
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

//To delete a poll
router.post('/delete', function (req, res) {
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

//post a vote
router.post('/vote', function (req, res) {
    if (req.session && req.session.user) {
        Poll.vote(req.body, req.session.user.email, function (num) {
            switch (num) {
                case 1:
                    req.flash('error_msg', 'Something bad happened please try again later!');
                    res.redirect('/dashboard');
                    break;
                case 2:
                    req.flash('error_msg', 'You cannot vote twice on a poll');
                    res.redirect(req.body.url);
                    break;
                case 3:
                    req.flash('success_msg', 'You vote was successfully registered.');
                    res.redirect(req.body.url);
                    break;
            };
        });
    } else {
        req.flash('error_msg', 'You must be logged in to vote');
        res.redirect(req.body.url);
    }
});

//Get particular poll with its url
router.get('/:url', function (req, res) {
    if (req.session && req.session.user) {
        res.locals.user = req.session.user
    }
    if (shortid.isValid(req.params.url)) {
        Poll.findOne({ url: req.params.url }, function (err, data) {
            if (err) {
                req.flash('error_msg', 'Oops the poll you are looking for is deleted or never existed');
                res.redirect('/');
            } else {
                if (data) {
                    res.locals.poll = { _id: data._id, question: data.question, options: data.options, url: data.url, votes: data.voters.length };
                    res.render('singlePoll', { csrfToken: req.csrfToken() });
                } else {
                    req.flash('error_msg', 'Oops the poll you are looking for is deleted or never existed');
                    res.redirect('/');
                }
            }
        });
    } else {
        req.flash('error_msg', 'Oops the poll you are looking for is deleted or never existed');
        res.redirect('/')
    }
});


module.exports = router;