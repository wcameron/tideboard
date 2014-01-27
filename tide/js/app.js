'use strict';

angular.module('tideApp', [
    'ngRoute'
    ,'tideApp.services'
    ,'tideApp.directives'
    ,'tideApp.controllers'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true)

    $routeProvider.when('/tide/', {
        templateUrl: 'partials/find-station.html', 
        controller: 'findStation'
    })

    $routeProvider.when('/tide/:lat,:lon', {
        templateUrl: 'partials/tide-view.html',
        controller: 'station'
    })

}]);
