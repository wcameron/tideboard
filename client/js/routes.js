'use strict';
module.exports = Routes

Routes.$inject = ['$routeProvider', '$locationProvider']
function Routes($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
      templateUrl: '/partials/find-station.html'
      ,controller: 'findStation'
    })
    $routeProvider.when('/:lat,:lon/', {
      templateUrl: '/partials/tide-view.html'
      ,controller: 'station'
    })
    $routeProvider.when('/:lat,:lon/:year-:month-:day/', {
      templateUrl: '/partials/tide-view.html'
      ,controller: 'station'
    })
};
