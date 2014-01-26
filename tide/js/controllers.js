'use strict';

/* Controllers */

angular.module('tideApp.controllers', [])
.controller('findStation', ['$scope', '$location', 'stationsService', 
    function($scope, $location, stations) {

        $scope.currentStation = {}
        $scope.stationList = stations.allStations

        $scope.setStation = function(){
            $location.path('/tide/'+ $scope.currentStation.lat + ',' + $scope.currentStation.lon)
        }

        function foundStation(station){
            $scope.currentStation = station
            $location.path('/tide/' + station.lat + ',' + station.lon)
            $location.replace()
        }

        var fetchStation = stations.findLocation()
        fetchStation.then(foundStation)

}])
.controller('station', ['$scope', '$location', '$window', '$routeParams', 'solarService', 'stationsService', 'tideService', 
    function($scope, $location, $window, $routeParams, solarService, stations, tides) {

        $scope.currentStation = stations.findStation($routeParams.lat, $routeParams.lon)
        $scope.stationList = stations.allStations
        $window.document.title = $scope.currentStation.name + ' Tides'

        $scope.setStation = function(){
            $location.path('/tide/'+ $scope.currentStation.lat + ',' + $scope.currentStation.lon)
        }

        function setTimes(time){
            var current = new Date(time)
            var start = new Date(time)
            var end = new Date(time)
            var timezone = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1]
            var countDays = function() {
                var timeDiff = start.getTime() - end.getTime()
                var daySpan = Math.abs(timeDiff / 86400000)
                return Math.round(daySpan)
            }
            start.setHours(start.getHours() - (2))
            end.setHours(end.getHours() + 70)
            return {
                current: current
                ,start: start
                ,end: end
                ,displayTimezone: timezone
                ,dayCount: countDays()
            }
        }

        function fetchData(station){
            $scope.times = setTimes(new Date())

            var tideData = tides.getData(station, $scope.times.start, $scope.times.end)
            tideData.then(function(tides){
                $scope.chartData = {
                    data: {
                        tideLines: tides
                        ,currentDate: $scope.times.current
                    }
                    ,solar: solarService($scope.times, station)
                    ,times: $scope.times
                }
            })
        }

        fetchData($scope.currentStation)

}]);