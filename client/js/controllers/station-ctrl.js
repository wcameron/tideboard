'use strict';
module.exports = StationCtrl;

StationCtrl.$inject = ['$scope', '$location', '$window', '$routeParams', 'solarService', 'stationsService', 'tideService', 'tideData', 'd3', 'moment']
function StationCtrl($scope, $location, $window, $routeParams, solarService, stationsService, tideService, tideData, d3, moment) {
    $scope.currentStation = stationsService.findStation($routeParams.lat, $routeParams.lon)
    $scope.stationList = stationsService.allStations
    $window.document.title = $scope.currentStation.name + ' Tides'

    $scope.setStation = function(){
        $location.path($scope.currentStation.lat + ',' + $scope.currentStation.lon)
    }

    function setTimes(time){
        var current = new Date(time),
            day = new Date(time).setUTCHours(0, 0, 0, 0),
            currentDay = new Date().setUTCHours(0, 0, 0, 0),
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
                ,station: station
            }
            $scope.currentTide = {
                tide: tideData.getTide($scope.chartData, $scope.chartData.times.current),
                date: $scope.chartData.times.current
            }
            $scope.$apply()
        })
        highLowData.then(function(highLows){
            var dailyHighLows = []
            highLows.forEach(function(tideValues){
                var tideTime = moment.utc(tideValues.t).tz(station.tz)
                var displayTime = tideTime.format('hh:mm A')
                var processedTide = {
                    date: tideTime,
                    time: tideTime.format('hh:mm A'),
                    pred: tideValues.v,
                    type: tideValues.type
                }
                if (processedTide.date.get('date') === date.getDate()){
                    dailyHighLows.push(processedTide)
                }
            })
            $scope.highLows = dailyHighLows
            $scope.nearTide = tideData.getNearHighLow($scope.highLows, $scope.times.current)
            $scope.$apply()
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
