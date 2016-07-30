var express = require('express');
var router = express.Router();


//app get /api/about test
router.get('/api/about', function (req, res) {
    res.render('index', {"error_msg": "Api is comming soon"});
});

module.exports = router;