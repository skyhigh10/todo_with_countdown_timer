var express = require('express');
var router = express.Router();

/* GET simple_timer page. */
router.get('/', function(req, res, next) {
  res.render('simple_timer');
});

module.exports = router;
