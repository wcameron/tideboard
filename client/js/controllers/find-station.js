'use strict';
module.exports = FindStation

FindStation.$inject = ['$scope', '$location', 'stationsService']
function FindStation($scope, $location, stationsService) {
    $scope.currentStation = {}
    $scope.stationList = stationsService.allStations

    $scope.setStation = function(){
        $location.path($scope.currentStation.lat + ',' + $scope.currentStation.lon)
    }

    function foundStation(station){
        $scope.currentStation = station
        $location.path(station.lat + ',' + station.lon)
        $location.replace()
    }

    var fetchStation = stationsService.findLocation()
    fetchStation.then(foundStation)
}
