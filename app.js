var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var index = require('./routes/index');
var login = require('./routes/login');
var register = require('./routes/register');
var logout = require('./routes/logout');
var profile = require('./routes/profile');
var games = require('./routes/games');
var play = require('./routes/play');
var record = require('./routes/record');
var rules = require('./routes/rules');
var invite = require('./routes/invite');
var warmUp = require('./routes/warm-up');
var charge = require('./routes/charge');    
var user = require('./routes/user');
var test = require('./routes/test');
var winners = require('./routes/winners');
var admin = require('./routes/admin');



var app = express();


var _ = require('./helpers/_');
app.use(function (req, res, next) {
    res.locals._ = _;
    next()
});

//mongoose.connect('mongodb://127.0.0.1/online_games');
mongoose.connect('mongodb://superSuperAdmin:zv39-)0^E_RW(F-4fo@127.0.0.1:27017/online_games', {auth: {authdb: "admin"}});
mongoose.Promise = global.Promise;


// attach req
app.use(function (req, res, next) {
    res.locals.req = req;
    next();
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', index);
app.use('/register', register);
app.use('/login', login);
app.use('/logout', logout);
app.use('/profile', profile);
app.use('/games', games);
app.use('/play', play);
app.use('/record', record);
app.use('/rules', rules);
app.use('/invite', invite);
app.use('/warm-up', warmUp);
app.use('/charge', charge);
app.use('/user', user);
app.use('/test',test);
app.use('/winners',winners);
app.use('/moliran-admin',admin); 

//app.use('/documentation/api/rest', express.static(path.join(__dirname,'documentation/restApi')));
//app.use('/documentation/api/socket', express.static(path.join(__dirname,'documentation/socketApi')));
app.get('/documentation/api/rest',function (req, res) {
    
    res.redirect('http://moliran.com:4000/rest');

});

app.get('/documentation/api/socket',function (req, res) {
    
    res.redirect('http://moliran.com:4000/socket');

});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;
