'use strict';

module.exports = function($scope, $location, $window, $routeParams, solarService, stationsService, tideService, tideData) {
    $scope.currentStation = stationsService.findStation($routeParams.lat, $routeParams.lon)
    $scope.stationList = stationsService.allStations
    $window.document.title = $scope.currentStation.name + ' Tides'

    $scope.setStation = function(){
        $location.path($scope.currentStation.lat + ',' + $scope.currentStation.lon)
    }

    function setTimes(time){
        var current = new Date(time),
            start = new Date(time),
            end = new Date(time),
            timezone = new Date().toString().match(/\(([A-Za-z\s].*)\)/)[1];
        start.setHours(0, 0, 0, 0)
        end.setHours(24, 0, 0, 0)
        return {
            current: current
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
            highLows.forEach(function(day){
                var responseFormat = d3.time.format.utc('%m/%d/%Y%H:%M')
                var displayFormat = d3.time.format('%I:%M %p')
                day.data.forEach(function(tide){
                    var time = responseFormat.parse(day.date + tide.time)
                    var processedTide = {
                        date: responseFormat.parse(day.date + tide.time),
                        time: displayFormat(time),
                        pred: tide.pred,
                        type: tide.type
                    }

                    if (processedTide.date.getDate() === date.getDate()){
                        dailyHighLows.push(processedTide)
                    }
                })
            })
            $scope.highLows = dailyHighLows
            $scope.nearTide = tideData.getNearHighLow($scope.highLows, $scope.times.current);
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