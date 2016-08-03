var mongoose = require('mongoose');
var shortid = require('shortid');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Poll = mongoose.model('Poll', new Schema({
    id: ObjectId,
    question: String,
    options: Array,
    voters: Array,
    createdBy: String,
    createdOn: Date,
    url: String
}));

module.exports = Poll;

//create a poll
module.exports.createNewPoll = function (body, user, done) {
    var options = [];
    for (var i = 0; i < body.options.length; i++) {
        options.push({ option: body.options[i], votes: 0 });
    }
    var newPoll = new Poll({
        question: body.question,
        options: options,
        voters: [],
        createdBy: user.email,
        createdOn: Date.now(),
        url: shortid.generate()
    });
    newPoll.save(function (err) {
        if (err) {
            done(err, null);
            throw err;
        } else {
            user.numberOfPolls += 1;
            user.save(function (err) {
                if (err) {
                    done(err, null)
                    throw err;
                } else {
                    done(null, newPoll.url);
                }
            });

        }
    });
};

//to delete a poll
module.exports.deletePoll = function (body, user, done) {
    Poll.findOneAndRemove({ _id: body.id, createdBy: user.email }, function (err) {
        if (err) {
            done(err);
        } else {
            user.numberOfPolls -= 1;
            user.save(function (err) {
                if (err) {
                    done(err);
                } else {
                    done(null);
                }
            });
        }
    });
};

//to vote for a poll
module.exports.vote = function (body, voter, done) {
    Poll.findOne({ _id: body.id, question: body.question }, function (err, data) {
        if (err) {
            done(1);
        } else {
            if (data) {
                if (data.voters.indexOf(voter) >= 0) {
                    done(2);
                } else {
                    data.voters.push(voter);
                    for (var i = 0; i < data.options.length; i++) {
                        if(data.options[i].option == body.option.toString()){                           
                            data.options[i].votes += 1;
                            data.markModified('options');
                            data.save(function (err) { if (err) { done(1) } else {done(3)} });
                        }
                    }
                    
                }
            } else {
                done(1);
            }
        }
    });
}