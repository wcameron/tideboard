'use strict';

module.exports = function($interval, drawChart) {
    return function(scope, el, attrs) {
        scope.$watch('chartData', function(newVal){
            if (typeof newVal === 'undefined'){
                return
            }
            new drawChart(newVal, el)
        })
    }
};