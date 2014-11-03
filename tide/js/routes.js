'use strict';

module.exports = function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true)
    $routeProvider.when('/', {
      templateUrl: 'partials/find-station.html'
      ,controller: 'findStation'
    })
    $routeProvider.when('/:lat,:lon/', {
      templateUrl: 'partials/tide-view.html'
      ,controller: 'station'
    })
    $routeProvider.when('/:lat,:lon/:year-:month-:day/', {
      templateUrl: 'partials/tide-view.html'
      ,controller: 'station'
    })
};