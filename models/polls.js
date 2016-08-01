var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Poll = mongoose.model('Poll', new Schema({
    id: ObjectId,
    question: String,
    options: Array,
    voters: Array,
    createdBy: String,
    createdOn: Date
}));

//exporting Poll model
module.exports = Poll;

//exporting createNewPoll function to create new poll
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
        createdOn: Date.now()
    });
    newPoll.save(function (err) {
        if (err) {
            done(err);
            throw err;
        } else {
            user.numberOfPolls += 1;
            user.save(function (err) {
                if (err) {
                    done(err)
                    throw err;
                } else {
                    done(null);
                }
            });

        }
    });
};

//exporting deletePoll function to delete poll
module.exports.deletePoll = function (body, user, done) {
    Poll.findOneAndRemove({_id:body.id, createdBy: user.email}, function (err) {
        if (err) {
            done(err);
        } else {
            user.numberOfPolls -= 1;
            user.save(function(err){
                if(err){
                    done(err);
                } else {
                    done(null);
                }
            });
        }
    });
};