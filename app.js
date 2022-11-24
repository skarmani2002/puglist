'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

//express instance
const app = express();
app.use(bodyParser.json({limit:'10mb'}));
app.use(bodyParser.urlencoded({limit:'50mb', extended: false}));
app.use(express.json());




//base route
app.get('/', (req, res) => {
    console.log("Welcome to home");
    res.json({code:200,msg:'Welcome to puglist'})
});




// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(errors.getError('ESS40401'));
});

//catch any other expection or error response
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    const errorStructure = {
        status: err.status || 500,
        error_code: err.error_code || `ESS50001`,
        error_summary: err.error_summary || `Internal Server Error`,
        error_message: err.error_message || err.message
    };
    if ({}.hasOwnProperty.call(err, 'source') === true) {
        errorStructure.source = err.source;
    }
    if (req.get('SSDEBUG') === 'puglistdev' && {}.hasOwnProperty.call(err, 'stack') === true) {
        errorStructure.stack = err.stack.split('\n');
    }
    res.json(errorStructure);
});
process.on('warning', e => console.warn(e.stack));
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason)

  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
})

process.on('uncaughtException', function(err) {
  console.log("UNCAUGHT ERROR",err);
});



module.exports = app;