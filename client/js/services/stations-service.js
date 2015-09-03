'use strict';
var stations = require('./stations-list')

module.exports = StationsService
StationsService.$inject = ['$q', '$routeParams', '_']
function StationsService($q, $routeParams, _) {
    this.allStations =  stations();
    this.findStation = function(userLat, userLon) {
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
            var closestStation

            for (var i = 0; self.allStations.length > i; i++){
                var station = self.allStations[i]
                var d = distance(userLat, userLon, station.lat, station.lon)
                if (d < 500){
                    station.distance = d
                    candidateStations.push(station)
                }
            }
            closestStation = _.min(candidateStations, function(stat){
                return stat.distance
            })
            return isFinite(closestStation.distance) ? closestStation : false
        }
        return findClosest(userLat, userLon)
    }
    this.findLocation = function() {
        var self = this
        var deferred = $q.defer()
        function geoSucceed(position){
            var station = self.findStation(position.coords.latitude, position.coords.longitude)
            if (station) {
                deferred.resolve(station)
            } else {
                deferred.reject(alert('Unable to find a nearby tide station'))
            }
        }
        function geoFail(){
            // TODO: better error handling/status display for user
            alert('Unable to find location')
        }

        navigator.geolocation.getCurrentPosition(geoSucceed, geoFail, {enableHighAccuracy: true})

        return deferred.promise;
    }
};
