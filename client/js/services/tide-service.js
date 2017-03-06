'use strict';
module.exports = TideService

TideService.$inject = ['$q']
function TideService($q) {
    return {
        getData: function (station, startTime, endTime) {
            var deferred = $q.defer()
            function formatInputDate(date){
                var formatTime = d3.time.format.utc('%Y%m%d %H:%M')
                return formatTime(date).toString()
            }
            startTime = formatInputDate(startTime)
            endTime = formatInputDate(endTime)
            var requestRoot = '/api/tides?'
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
            var requestRoot = '/api/highlow?'
            var params = encodeURI('station=' +
                                    station.id +
                                    '&begin_date=' +
                                    startTime +
                                    '&end_date=' +
                                    endTime +
                                    '&product=' +
                                    'high_low' +
                                    '&datum=MLLW&unit=0&timeZone=1')
            var url = requestRoot + params

            $.ajax({url: url }).done(function(response){
                deferred.resolve(JSON.parse(response))
            })
            return deferred.promise;
        }
    }
};
