var express = require('express');
var router = express.Router();
var googleAuth = require('../google-api/bunny-voting-app-08cfbc565af7')

//app get /api/about test
router.get('/googleJson', function (req, res) {
    res.send(googleAuth);
});

module.exports = router;