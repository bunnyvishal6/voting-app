var express = require('express');
var router = express.Router();
var Poll = require('../models/polls');

//get data related to provided url of a particular poll
router.get('/data/:url', function (req, res) {
    Poll.findOne({ url: req.params.url }, function (err, data) {
        if (err) {
            res.send({ err: "sorry" });
        } else {
            if (data) {
                var options = [];
                data.options.forEach(function (element) {
                    options.push([element.option.toString(), element.votes]);
                });
                res.send({options: options});
            } else {
                res.send({ err: "no data found" });
            }
        }
    });
});

module.exports = router;