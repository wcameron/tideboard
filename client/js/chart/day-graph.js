'use strict';
module.exports = DayGraph

DayGraph.$inject = ['$interval', 'drawChart']
function DayGraph($interval, drawChart) {
    return function(scope, el, attrs) {
        scope.$watch('chartData', function(newVal){
            if (typeof newVal === 'undefined'){
                return
            }
            new drawChart(newVal, el)
        })
    }
};