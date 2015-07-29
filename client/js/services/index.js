'use strict';
var app = angular.module('tideApp');

app.service('stationsService', require('./stations-service'));
app.service('tideService', require('./tide-service'));
app.factory('tideData', require('./tide-data'));
app.factory('solarService', require('./solar-service'));