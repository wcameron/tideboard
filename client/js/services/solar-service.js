'use strict';
//var stations = require('./stations-list');
module.exports = SolarService
SolarService.$inject = ['SunCalc', '_']
function SolarService(SunCalc, _) {
    function solar(times, location) {
        if (!times || !location) {
            return {}
        }
        var oneDay = 24*60*60*1000
        var days = getDays(times.start, times.end)
        function getDays(startTime, endTime){
            var diffDays = Math.round(Math.abs((startTime.getTime() - endTime.getTime())/(oneDay)))
            var days = [{
                date: times.start
            }]

            for (var i = 1; i <= diffDays; i++){
                var nextDate = new Date(times.start.getTime())
                nextDate.setTime((nextDate.getTime() + oneDay * i))
                days.push({date: nextDate})
            }
            return days;
        }

        function buildSolarObject(day){
            var solarTimes = SunCalc.getTimes(day.date, location.lat, location.lon)
            debugger
            var moonPhase = SunCalc.getMoonIllumination(day.date)
            var endDate = new Date(day.date.getTime())
            endDate.setTime((endDate.getTime() + oneDay))
            day.end = endDate
            day.sunrise = solarTimes.sunrise
            day.sunset = solarTimes.sunset
            day.dusk = solarTimes.dusk
            day.dawn = solarTimes.dawn
            day.nauticalDusk = solarTimes.nauticalDusk
            day.nauticalDawn = solarTimes.nauticalDawn
            day.moon = moonPhase
            return day
        }

        return _.each(days, buildSolarObject)

        return days
    }
    return solar;
};
