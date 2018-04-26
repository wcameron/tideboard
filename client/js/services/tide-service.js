'use strict';
module.exports = TideService

TideService.$inject = ['$q', 'd3']
function TideService($q, d3) {
    const apiURL = '/api'
    return {
        getData: function (station, startTime, endTime) {
            var deferred = $q.defer()
            function formatInputDate(date){
                var formatTime = d3.time.format.utc('%Y%m%d %H:%M')
                return formatTime(date).toString()
            }
            startTime = formatInputDate(startTime)
            endTime = formatInputDate(endTime)
            var requestRoot = `${apiURL}/tides?`
            var params = encodeURI('station=' +
                                    station.id +
                                    '&begin_date=' +
                                    startTime +
                                    '&end_date=' +
                                    endTime +
                                    '&product=' +
                                    'predictions' +
                                    '&datum=MLLW&unit=1&timeZone=0&dataInterval=6')
            var url = requestRoot + params

            $.ajax({url: url }).done(function(response){
                deferred.resolve(JSON.parse(response))
            })
            return deferred.promise;
        },
        getHighLows: function (station, startTime, endTime) {
            var deferred = $q.defer()
            function formatInputDate(date){
                var formatTime = d3.time.format.utc('%Y%m%d %H:%M')
                return formatTime(date).toString()
            }
            startTime = formatInputDate(startTime)
            endTime = formatInputDate(endTime)
            var requestRoot = `${apiURL}/highlow?`
            var params = encodeURI('station=' +
                                    station.id +
                                    '&begin_date=' +
                                    startTime +
                                    '&end_date=' +
                                    endTime +
                                    '&product=' +
                                    'predictions' +
                                    '&datum=MLLW&unit=1&timeZone=0&dataInterval=hilo')
            var url = requestRoot + params

            $.ajax({url: url }).done(function(response){
                deferred.resolve(JSON.parse(response))
            })
            return deferred.promise;
        }
    }
};
