'use strict';
import './../styles/app.css';

var angular = require('angular');

require('angular-route');

var app = angular.module('tideApp', ['ngRoute']);

require('./services');
require('./formatting');
require('./controllers');
require('./directives');
require('./chart');

var d3 = require('d3'); // Load d3 standalone
d3 = require('d3-chronological')(d3); // attach standalone

app.constant('SunCalc', require('suncalc'));
app.constant('d3', d3);
app.constant('moment', require('moment-timezone'));

app.config(require('./routes'));
