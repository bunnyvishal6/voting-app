var express = require('express');
var router = express.Router();


//app get /api/about test
router.get('/about', function (req, res) {
    res.render('index', {errors: "The api is not yet build!"});
});

module.exports = router;