'use strict';

module.exports = TideData
TideData.$inject = ['moment', '_']
function TideData(moment, _) {
    var data = [],
        yData = [],
        xData = [],
        bisect = d3.bisector(function(d) { return d.date }).left

    function getTide(inputData, time){
        var tide,
            timePoint,
            responseFormat = d3.time.format.utc('%Y-%m-%d %H:%M')

        _.each(inputData.data.tideLines, function(hour){
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
            tide.diff = tide.date.getTime() - current
            if (!nearestTide || Math.abs(nearestTide.diff) > Math.abs(tide.diff)){
                nearestTide = tide
            }
        })

        var when = moment(nearestTide.date)
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
