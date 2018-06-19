'use strict';
module.exports = TideService

TideService.$inject = ['$q', 'd3']
function TideService($q, d3) {
    const apiURL = '/api'
    function formatInputDate(date){
        var formatTime = d3.time.format.utc('%Y%m%d %H:%M')
        return formatTime(date).toString()
    }
    return {
        getData: function (station, startTime, endTime) {
            var requestRoot = `${apiURL}/tides?`
            var params = encodeURI('station=' +
                                    station.id +
                                    '&begin_date=' +
                                    formatInputDate(startTime) +
                                    '&end_date=' +
                                    formatInputDate(endTime) +
                                    '&product=' + 'predictions')
            return fetch(requestRoot + params, { method: 'GET'})
                .then(resp => resp.json())
        },
        getHighLows: function (station, startTime, endTime) {
            var requestRoot = `${apiURL}/highlow?`
            var params = encodeURI('station=' +
                                    station.id +
                                    '&begin_date=' +
                                    formatInputDate(startTime) +
                                    '&end_date=' +
                                    formatInputDate(endTime) +
                                    '&product=' + 'predictions')
            return fetch(requestRoot + params, { method: 'GET'})
                    .then(resp => resp.json())
        }
    }
};
