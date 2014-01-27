'use strict';

var services = angular.module('tideApp.services', [])

services.factory('solarService', function() {
    function solar(times, location) {
        if (!times || !location) {
            return {}
        }
        var oneDay = 24*60*60*1000
        var diffDays = Math.round(Math.abs((times.start.getTime() - times.end.getTime())/(oneDay)))
        var days = [{
            date: times.start
        }]

        for (var i = 1; i <= diffDays; i++){
            var nextDate = new Date(times.start.getTime())
            nextDate.setTime((nextDate.getTime() + oneDay * i))
            days.push({date: nextDate})
        }

        _.each(days, function(day){
            var solarTimes = SunCalc.getTimes(day.date, location.lat, location.lon)
            day.sunrise = solarTimes.sunrise
            day.sunset = solarTimes.sunset
            day.dusk = solarTimes.dusk
            day.dawn = solarTimes.dawn
            day.nauticalDusk = solarTimes.nauticalDusk
            day.nauticalDawn = solarTimes.nauticalDawn
        })
        console.log(location.lat)
        return days
    }
    return solar;
});

services.factory('tideService', function($q) {
    return {
        getData: function (station, startTime, endTime) {
            var deferred = $q.defer()
            function formatInputDate(date){
                var formatTime = d3.time.format.utc('%Y%m%d %H:%M')
                return formatTime(date).toString()
            }
            startTime = formatInputDate(startTime)
            endTime = formatInputDate(endTime)
            var requestRoot = 'http://wcameron-test.apigee.net/v1/tide-predictions/predictions?'
            var params = encodeURI('stationId=' + 
                                    station.id +
                                    '&beginDate=' +
                                    startTime +
                                    '&endDate=' + 
                                    endTime + 
                                    '&datum=MLLW&unit=1&timeZone=0&dataInterval=6')
            var url = requestRoot + params

            $.ajax({url: url }).done(function(response){
                var tideData = response.soapenv_Envelope.soapenv_Body.PredictionsValues.data.item
                deferred.resolve(tideData)
            })
            return deferred.promise;
        }
    }
});

services.factory('stationsService', function($q, $routeParams) {
    return {
        allStations: STATIONS_LIST
        ,findStation: function(userLat, userLon) {
            var self = this
            function distance(lat1, lon1, lat2, lon2){
                 var R = 6371; // km
                 var dLat = (lat2-lat1) * Math.PI / 180;
                 var dLon = (lon2-lon1) * Math.PI / 180;
                 var lat1 = lat1 * Math.PI / 180;
                 var lat2 = lat2 * Math.PI / 180;

                 var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                         Math.sin(dLon/2) * Math.sin(dLon/2) * 
                         Math.cos(lat1) * Math.cos(lat2); 

                 var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

                 return R * c;
            }
            function findClosest(userLat, userLon){
                var candidateStations = []

                for (var i = 0; self.allStations.length > i; i++){
                    var station = self.allStations[i]
                    var d = distance(userLat, userLon, station.lat, station.lon)
                    if (d < 500){
                        station.distance = d
                        candidateStations.push(station)
                    }
                }

                return _.min(candidateStations, function(stat){ 
                    return stat.distance 
                })
            }
            return findClosest(userLat, userLon)
        }
        ,findLocation: function() {
            var self = this
            var deferred = $q.defer()
            function geoSucceed(position){
                var station = self.findStation(position.coords.latitude, position.coords.longitude)
                if (station) {
                    deferred.resolve(station)
                } else {
                    deferred.reject(alert('Sorry, there was an error setting your location'));
                }
            }
            function geoFail(){
                // TODO
            }

            navigator.geolocation.getCurrentPosition(geoSucceed, geoFail, {enableHighAccuracy: true});

            return deferred.promise;
        }
    }
    stations.$inject = [
        '$q'
        ,'$routeParams'
    ]

    return stations;
});