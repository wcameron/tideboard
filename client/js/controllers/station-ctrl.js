'use strict';
module.exports = StationCtrl;

StationCtrl.$inject = ['$scope', '$location', '$window', '$routeParams', 'solarService', 'stationsService', 'tideService', 'tideData', 'd3']
function StationCtrl($scope, $location, $window, $routeParams, solarService, stationsService, tideService, tideData, d3) {
    $scope.currentStation = stationsService.findStation($routeParams.lat, $routeParams.lon)
    $scope.stationList = stationsService.allStations
    $window.document.title = $scope.currentStation.name + ' Tides'

    $scope.setStation = function(){
        $location.path($scope.currentStation.lat + ',' + $scope.currentStation.lon)
    }

    function setTimes(time){
        var current = new Date(time),
            day = new Date(time).setHours(0, 0, 0, 0),
            currentDay = new Date().setHours(0, 0, 0, 0),
            start = new Date(time),
            end = new Date(time),
            timezone = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];

        start.setHours(0, 0, 0, 0)
        end.setHours(24, 0, 0, 0)

        return {
            current: current
            ,isCurrent:  day === currentDay
            ,start: start
            ,end: end
            ,displayTimezone: timezone
            ,dayCount: 1
        }
    }

    function showChart(date){
        $scope.times = setTimes(date)
        var station = $scope.currentStation
        var getTideData = tideService.getData(station, $scope.times.start, $scope.times.end)
        var highLowData = tideService.getHighLows(station, $scope.times.start, $scope.times.end)
        getTideData.then(function(tides){
            $scope.chartData = {
                data: {
                    tideLines: tides
                    ,currentDate: $scope.times.current
                }
                ,solar: solarService($scope.times, station)
                ,times: $scope.times
            }
            $scope.currentTide = {
                tide: tideData.getTide($scope.chartData, $scope.chartData.times.current),
                date: $scope.chartData.times.current
            }
        })
        highLowData.then(function(highLows){
            var dailyHighLows = []
            highLows.forEach(function(tideValues){
                var responseFormat = d3.time.format.utc('%Y-%m-%d %H:%M')
                var displayFormat = d3.time.format('%I:%M %p')
                var time = responseFormat.parse(tideValues.t)
                var processedTide = {
                    date: responseFormat.parse(tideValues.t),
                    time: displayFormat(time),
                    pred: tideValues.v,
                    type: tideValues.type
                }
                if (processedTide.date.getDate() === date.getDate()){
                    dailyHighLows.push(processedTide)
                }
            })
            $scope.highLows = dailyHighLows
            $scope.nearTide = tideData.getNearHighLow($scope.highLows, $scope.times.current)
        })

    }

    $scope.previousDay = function(){
        var initialDate = $scope.times.start
        initialDate = initialDate.setDate(initialDate.getDate() - 1);
        return showChart(initialDate);
    }

    $scope.nextDay = function(){
        var initialDate = $scope.times.start
        initialDate = initialDate.setDate(initialDate.getDate() + 1);
        return showChart(initialDate);
    }

    var targetDate = new Date()
    if ($routeParams.year){
        targetDate.setFullYear($routeParams.year,($routeParams.month -1),$routeParams.day)
    }
    showChart(targetDate)
};
