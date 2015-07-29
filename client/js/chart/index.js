'use strict';
var app = angular.module('tideApp');

app.directive('dayGraph', require('./day-graph'));
app.factory('drawChart', require('./draw-chart'));