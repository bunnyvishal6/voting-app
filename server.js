var path = require('path');
var express = require('express');
var mongo = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('client-sessions');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var expressValidator = require('express-validator');
var csrf = require('csurf');

//Get required modules if any otherthan routes
var auth = require('./config/auth');
var User = require('./models/users');

//
mongoose.Promise = global.Promise;
//Database connect
mongoose.connect('mongodb://localhost:27017/polling');
var db = mongoose.connection;

//Routes
var routes = require('./routes/index');
var pollsRouter = require('./routes/pollsRouter');
var api = require('./routes/api');

//Init
var app = express();



//View Engine
app.set('views', path.join(__dirname + '/views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// BodyParser and cookieParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//statis files serve 
app.use("/public", express.static(path.join(__dirname, 'public')));


// Client Session
app.use(session({
  cookieName: 'session',
  secret: 'sdhfjhjH64HJHs5uiauijh67DSHg',
  duration: 60 * 60 * 1000,
  activeDuration: 10 * 60 * 1000,
  cookie: {
    httpOnly: true,
    ephemeral: true
  }
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Connect Flash
app.use(flash());

// Global Vars for flash messages
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

//setting routes
app.use('/', routes);
app.use('/polls', pollsRouter);
app.use('/api', api);

//app listen
app.listen(process.env.PORT || 80);
