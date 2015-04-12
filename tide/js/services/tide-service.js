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
        },
        getHighLows: function (station, startTime, endTime) {
            var deferred = $q.defer()
            function formatInputDate(date){
                var formatTime = d3.time.format.utc('%Y%m%d %H:%M')
                return formatTime(date).toString()
            }
            startTime = formatInputDate(startTime)
            endTime = formatInputDate(endTime)
            var requestRoot = 'http://wcameron-test.apigee.net/highlowtidepred/highlowtidepredictions?'
            var params = encodeURI('stationId=' + 
                                    station.id +
                                    '&beginDate=' +
                                    startTime +
                                    '&endDate=' + 
                                    endTime + 
                                    '&datum=MLLW&unit=0&timeZone=1')
            var url = requestRoot + params

            $.ajax({url: url }).done(function(response){
                var tideData = response.Envelope.Body.HighLowValues.HighLowValues.item
                deferred.resolve(tideData)
            })
            return deferred.promise;
        }
    }
};