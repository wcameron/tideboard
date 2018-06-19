'use strict';

module.exports = TideData
TideData.$inject = ['moment', 'd3']
function TideData(moment, d3) {
    var data = [],
        yData = [],
        xData = [],
        bisect = d3.bisector(function(d) { return d.date }).left

    function getTide(inputData, time){
        var tide,
            timePoint,
            responseFormat = d3.time.format.utc('%Y-%m-%d %H:%M')

        inputData.data.tideLines.forEach(function(hour){
            hour.x = responseFormat.parse(hour.t)
            hour.y = parseFloat(hour.v)

            data.push({ value: hour.y, date: hour.x })

            yData.push(hour.y)
            xData.push(hour.x)
        })

        timePoint = bisect(data, time);
        tide = yData[timePoint]
        return tide
    }
    function getNearHighLow(inputHighLowData, time){
        var current = time.getTime()
        var nearestTide
        inputHighLowData.forEach(function(tide){
            tide.diff = tide.date.valueOf() - current
            if (!nearestTide || Math.abs(nearestTide.diff) > Math.abs(tide.diff)){
                nearestTide = tide
            }
        })
        var when = moment(nearestTide.date).tz('UTC')
        var now = moment(time)
        var type = nearestTide.type === 'H' ? 'High tide' : 'Low tide'
        var time = nearestTide.diff > 0 ? 'is ' + when.from(now) : 'was ' + when.from(now)
        return type + ' ' + time + '.';
    }
    return {
        data: [],
        yData: [],
        xData: [],
        getTide: getTide,
        getNearHighLow: getNearHighLow
        }
};
