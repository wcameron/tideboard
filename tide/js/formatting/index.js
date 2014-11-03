'use strict';
var app = angular.module('tideApp');

app.filter('dateFormat', require('./date-format'));
app.filter('moon', require('./moon'));