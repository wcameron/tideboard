'use strict';
module.exports = DrawChart

DrawChart.$inject = ['$interval', '_', 'd3']
function DrawChart($interval, _, d3) {
    function renderChart(chartData, el){
        el.empty()
        angular.element('#grid').remove()
        var gridEl = angular.element('<div id="grid">')
        el.after(gridEl)

        var self = this
        this.data = []
        this.times = chartData.times
        this.solar = chartData.solar
        this.yData = []
        this.xData = []
        this.updateInterval = 1000 // ms
        this.timeLabelFormat = function(time){
            var hour = time.getHours(),
                format
            if (hour === 0){
                format = d3.time.format('%b %e')
                return format(time)
            } else if (hour === 12){
                return 'Noon'
            } else {
                format = d3.time.format('%I %p')
                return format(time)
              }
        }

        _.each(chartData.data.tideLines, function(hour){
            var responseFormat = d3.time.format.utc('%Y-%m-%d %H:%M')
            hour.x = responseFormat.parse(hour.t)
            hour.y = parseFloat(hour.v)

            self.data.push({ value: hour.y, date: hour.x })

            self.yData.push(hour.y)
            self.xData.push(hour.x)
        })

        var dataLength = self.data.length - 1
        var tideDiff = d3.max(self.yData) - d3.min(self.yData)

        var width = el.width() * (self.times.dayCount)
        var height = window.innerHeight * .77
        if (window.innerHeight * .77 > width * .77){
            height = width * .77
        }

        var y = d3.scale.linear()
                .domain([(d3.min(self.yData) - tideDiff * .25),
                        (d3.max(self.yData) + tideDiff * .25)])
                .range([height, 0])
        var x = d3.time.scale()
                .domain([self.xData[0], self.xData[dataLength]])
                .range([0, width])

        el.css({height: height})

        var svg = d3.select(el[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height)

        var gridAxis = y.copy()
                      .domain([(d3.min(self.yData) - tideDiff * .15),
                             (d3.max(self.yData) + tideDiff * .15)])
        var gridWidth = gridEl.width()
        var grid = d3.select(gridEl[0])
                     .append('svg')
                     .attr('width', gridWidth)
                     .attr('height', height)
                     .append('g').attr('class','height-grid')

        var inspector
        var bisect = d3.bisector(function(d) { return d.date }).left

        this.updateTime = function() {
            self.times.current = new Date()
            drawCurrentMarker(self.times, self.updateInterval)
        }

        this.drawChart = function() {
            drawBackground()
            drawLine()
            drawCurrentMarker(self.times, self.updateInterval)
            inspector = drawInspector(self.times.current)
            drawGrid()

            $interval(function(){
                //self.updateTime()
            }, self.updateInterval)
        }

        this.drawChart()

        function drawBackground() {
            var area = d3.svg.area()
                         .interpolate('cardinal')
                         .tension(0.8)
                         .x(function(d,i) { return x(self.xData[i])})
                         .y(height)
                         .y1(function(d) { return y(d) })

            svg.append('path')
               .datum(self.yData)
               .attr('class', 'area')
               .attr('d', area)

            var daylightMargin = -95;
            var daylight = svg.selectAll('.day')
                            .data(self.solar)
                            .enter()
                            .append('g').attr('class', 'daylight')
                            .attr('transform', 'translate(0, 49)')


            function validStartTime(time, day){
                return isFinite(time) ? time : day.date;
            }

            function validEndTime(time, day){
                return isFinite(time) ? time : day.end;
            }

            daylight.append('rect')
                .attr('class', 'day-naut-dawn')
                .attr('x', function(d){
                    return x(validStartTime(d.nauticalDawn, d)) })
                .attr('width', function(d){
                    return x(validEndTime(d.nauticalDusk, d)) - x(validStartTime(d.nauticalDawn, d)) })
                .attr('height', height + daylightMargin)

            daylight.append('rect')
                .attr('class', 'day-dawn')
                .attr('x', function(d){ return x(validStartTime(d.dawn, d)) })
                .attr('width', function(d){
                    return x(validEndTime(d.dusk, d)) - x(validStartTime(d.dawn, d)) })
                .attr('height', height + daylightMargin)

            daylight.append('rect')
                .attr('class', 'day-sun')
                .attr('x', function(d){
                    return x(validStartTime(d.sunrise, d)) })
                .attr('width', function(d){
                    return x(validEndTime(d.sunset, d)) - x(validStartTime(d.sunrise, d)) })
                .attr('height', height + daylightMargin)

            var timeAxis = x.copy().domain([self.xData[16], self.xData[dataLength - 8]])

            var ticks = svg.append('g')
                           .attr('class', 'time-axis')
                           .attr('transform', 'translate(0,'+ (height - 3) +')')


            ticks.selectAll('.time-tick')
                .data(function(){
                    var axis = x.copy().domain([self.xData[0], self.xData[dataLength]])
                    return axis.ticks(24 * self.times.dayCount)
                })
                .enter().append('line')
                .attr('class', 'time-tick')
                .attr('x1', function(d){ return x(d) })
                .attr('x2', function(d){ return x(d) })
                .attr('y1', -28)
                .attr('y2', -23)

/*
            ticks.selectAll('.time-circle')
                .data(timeAxis.ticks( 7 * self.times.dayCount ))
                .enter().append('circle')
                .attr('class', 'time-circle')
                .attr('r', 3)
                .attr('cx', function(d){ return x(d) })
                .attr('cy', -26)
*/

            ticks.selectAll('.thick-time-tick')
                .data(timeAxis.ticks( 7 * self.times.dayCount ))
                .enter().append('line')
                .attr('class', 'thick-time-tick')
                .attr('x1', function(d){ return x(d) })
                .attr('x2', function(d){ return x(d) })
                .attr('y1', -28)
                .attr('y2', -23)

            ticks.selectAll('.time-label')
                .data(timeAxis.ticks(6 * self.times.dayCount))
                .enter().append('text')
                .attr('class', function(d){
                    if (!(d.getHours() % 12)){
                        return 'time-label special'
                    }
                    return 'time-label'
                })
                .text(function(d){ return self.timeLabelFormat(d).replace(/^0+/, '') })
                .attr('x', function(d){ return x(d) })
                .attr('y', 0)
        }

        function drawLine(){
            var line = d3.svg.line()
                        .interpolate('cardinal')
                        .tension(0.8)
                        .x(function(d,i){ return x(self.xData[i]) })
                        .y(function(d){ return y(d) })

            svg.append('path')
                .attr('d', line(self.yData))
                .attr('class', 'color')
        }

        function drawGrid() {
            grid.selectAll('.height-label')
                .data(gridAxis.ticks(5))
                .enter().append('text')
                .attr('class', 'height-label')
                .text(String)
                .attr('x', 35)
                .attr('y', function(d){ return y(d) })

            grid.selectAll('.right-height-label')
                .data(gridAxis.ticks(5))
                .enter().append('text')
                .attr('class', 'right-height-label')
                .text(String)
                .attr('x', gridWidth - 37)
                .attr('y', function(d){ return y(d) })

            grid.selectAll('.vertical-marker')
                .data([bisect(self.data, self.times.current)])
                .enter().append('line')
                .attr('class', 'vertical-marker')
                .attr('x1', 48)
                .attr('y2', function(d){
                    return y(self.data[d].value) })
                .attr('x2', 58)
                .attr('y1', function(d){ return y(self.data[d].value)})
        }

        function drawInspector(time){
            var inspector = svg.append('g').attr('class', 'inspector')

            inspector.selectAll('.inspected-tide-value')
                .data([bisect(self.data, time)])
                .enter().append('text')
                .attr('class', 'inspected-tide-value')
                .text(function(d){ return self.yData[d].toFixed(1) + ' ft' })
                .attr('x', x(time) - 5)
                .attr('y', height - 65)

            inspector.selectAll('.current-point')
                .data([bisect(self.data, time)])
                .enter().append('circle')
                .attr('class', 'current-point')
                .attr('r', 5)
                .attr('cx', x(time))
                .attr('cy', function(d){ return y(self.data[d].value) })

            inspector.selectAll('.horizontal-marker')
                .data( function(){ return [bisect(self.data, time)] })
                .enter().append('line')
                .attr('class', 'horizontal-marker')
                .attr('x1', x(time))
                .attr('y2', height - 45)
                .attr('x2', x(time))
                .attr('y1', height - 55)

            svg.append('g').append('rect')
                .attr('class', 'overlay')
                .attr('width', width)
                .attr('height', height)
                .on('mousemove', redrawInspector)

            return inspector
        }

        function redrawInspector(){
            var d = d3.mouse(this),
                time = x.invert(d[0]),
                point = bisect(self.data, time),
                vertical = y(self.yData[point]),
                horizontal = x(time)

            inspector.select('.current-point')
                .attr('cx', horizontal)
                .attr('cy', vertical)
            grid.select('.vertical-marker')
                .attr('y1', vertical)
                .attr('y2', vertical)
            inspector.select('.horizontal-marker')
                .attr('x1', horizontal)
                .attr('x2', horizontal)

            inspector.selectAll('.inspected-tide-value')
                .text(self.yData[point].toFixed(1) + ' ft')
                .attr('x', horizontal - 2)
        }

        function drawCurrentMarker(times, speed) {
          var currentMarker = svg.append('g').attr('class', 'current-marker-group')

          if (!times.isCurrent){
              return false
          }

          currentMarker.attr('transform', function(d){ return 'translate(' + x(times.current) + ', 0)'})
          currentMarker.append('line')
              .attr('class', 'current-marker')
              .attr('x1', 0)
              .attr('y2', height - 45)
              .attr('x2', 0)
              .attr('y1', 51)
        }
    }
    return renderChart
};
