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
            var moonPhase = SunCalc.getMoonIllumination(day.date)
            day.sunrise = solarTimes.sunrise
            day.sunset = solarTimes.sunset
            day.dusk = solarTimes.dusk
            day.dawn = solarTimes.dawn
            day.nauticalDusk = solarTimes.nauticalDusk
            day.nauticalDawn = solarTimes.nauticalDawn
            day.moon = moonPhase
        })
        console.log(location.lat)
        return days
    }
    return solar;
};