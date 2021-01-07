var express = require('express');
var indexRouter = require('../controller/index');
var usersRouter = require('../controller/users');

var app = express();

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;