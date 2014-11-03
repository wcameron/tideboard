'use strict';

var angular = require('angular');

require('angular-route');

var app = angular.module('tideApp', ['ngRoute']);

require('./services');
require('./formatting');
require('./controllers');
require('./directives');
require('./chart');

app.constant('_', require('lodash'));
app.constant('SunCalc', require('suncalc'));
app.constant('d3', require('d3'));
app.constant('moment', require('moment'));

app.config(require('./routes'));