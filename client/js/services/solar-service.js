'use strict';
module.exports = SolarService
SolarService.$inject = ['SunCalc', 'moment']
function SolarService(SunCalc, moment) {
    function solar(times, station) {
        if (!times || !station) {
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

        function setTimezone(input){
            return moment(input).tz(station.tz)
        }

        function buildSolarObject(day){
            var solarTimes = SunCalc.getTimes(day.date, station.lat, station.lon)
            var moonPhase = SunCalc.getMoonIllumination(day.date)
            var endDate = new Date(day.date.getTime())
            endDate.setTime((endDate.getTime() + oneDay))
            day.end = endDate
            day.sunrise = setTimezone(solarTimes.sunrise)
            day.sunset = setTimezone(solarTimes.sunset)
            day.dusk = setTimezone(solarTimes.dusk)
            day.dawn = setTimezone(solarTimes.dawn)
            day.nauticalDusk = setTimezone(solarTimes.nauticalDusk)
            day.nauticalDawn = setTimezone(solarTimes.nauticalDawn)
            day.moon = moonPhase
            return day
        }

        return days.map(buildSolarObject)
    }
    return solar;
};
