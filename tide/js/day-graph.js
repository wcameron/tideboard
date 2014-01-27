'use strict';
angular.module('tideApp.directives').directive('dayGraph',

    function DayGraph($interval){

        return function(scope, elem, attrs) {

        scope.$watch('chartData', function(newVal, oldVal, scope){
            if (typeof newVal === 'undefined'){
                return
            }
            new renderChart(newVal)
        })

        function renderChart(chartData){
            var self = this
            this.data = []
            this.times = chartData.times
            this.solar = chartData.solar
            this.yData = []
            this.xData = []
            this.updateInterval = 5000 // ms
            this.helpers = {
                timeFormat: d3.time.format('%I:%M %p')
                ,timeLabelFormat: function(time){
                    var hour = time.getHours()
                    if (hour === 0){
                        format = d3.time.format('%b %e')
                        return format(time)
                    } else if (hour === 12){
                        return 'Noon'
                    } else {
                        var format = d3.time.format('%I %p')
                        return format(time)
                    }
                }
                ,displayDateFormat: function(time){
                    var format = d3.time.format('%b %e')
                    return format(time)
                }
            }
            this.workspaceHeight = elem.outerHeight()

            var margin = {
                    top: 0
                    ,right: 0
                    ,bottom: 0
                    ,left: 0
                }

            _.each(chartData.data.tideLines, function(hour){
                var responseFormat = d3.time.format.utc('%m/%d/%Y %H:%M')
                hour.x = responseFormat.parse(hour.timeStamp)
                hour.y = parseFloat(hour.pred)

                self.data.push({
                    value: hour.y,
                    date: hour.x
                })

                self.yData.push(hour.y)
                self.xData.push(hour.x)
            })

            var dataLength = self.data.length - 1

            var w = elem.width() * (self.times.dayCount * .75)
            var h = this.workspaceHeight - (margin.top + margin.bottom)

            if (this.workspaceHeight > elem.width()) {
                self.times.dayCount = self.times.dayCount / 2
            }

            var tideDiff = d3.max(self.yData) - d3.min(self.yData)
            var y = d3.scale.linear()
                      .domain([(d3.min(self.yData) - tideDiff * .25)
                              ,(d3.max(self.yData) + tideDiff * .25)])
                      .range([h + margin.top, margin.top])
            var x = d3.time.scale()
                      .domain([self.xData[0], self.xData[dataLength]])
                      .range([0, w])

            $interval(function(){
                self.updateTime()
            }, self.updateInterval)

            elem.empty()
            angular.element('#grid').remove()

            var vis = d3.select(elem[0])
                .append('svg:svg')
                .attr('width', w)
                .attr('height', h + margin.top + margin.bottom)

            var g = vis.append('svg:g')


            var gridElem = angular.element('<div id="grid">')
            elem.after(gridElem)
            var heightLabelAxis = y.copy()
                                   .domain([(d3.min(self.yData) - tideDiff * .15)
                                           ,(d3.max(self.yData) + tideDiff * .15)])
            var grid = d3.select(gridElem[0])
                    .append('svg:svg')
                    .attr('width', w)
                    .attr('height', h + margin.top + margin.bottom)
            var l = grid.append('svg:g').attr('class','height-grid');

            this.updateTime = function() {
                /*
                self.times.current = new Date(self.times.current)
                self.times.current = self.times.current.setHours(self.times.current.getHours() + 1)
                self.times.current = new Date(self.times.current)
                */
                self.times.current = new Date()
                redrawCurrentLabelsAndMarker(self.updateInterval)
            }

            this.drawChart = function() {
                drawCurrentMarker()
                drawTideArea()
                drawDaylightMarkers()
                drawTicksAndLabels()
                drawLine()
                drawCurrentLabels()
                drawHeightGrid()
            }

            this.drawChart()

            function drawCurrentMarker(){
                g.selectAll('.current-marker')
                    .data( function(){
                        var bisect = d3.bisector(function(d){ 
                            return d.date
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:line')
                    .attr('class', 'current-marker')
                    .attr('x1', function(d){ 
                        return x(self.times.current) 
                    })
                    .attr('y2', function(d, i){ 
                        return self.workspaceHeight
                    })
                    .attr('x2', function(d){ 
                        return x(self.times.current) 
                    })
                    .attr('y1', function(d, i){ 
                        return  110
                    })
            }

            function drawTideArea(){

                var area = d3.svg.area()
                    .interpolate('cardinal')
                    .tension(0.8)
                    .x(function(d,i) { 
                        return x(self.xData[i])
                    })
                    .y(h + margin.bottom + margin.top)
                    .y1(function(d) { return y(d); })


                g.append('path')
                    .datum(self.yData)
                    .attr('class', 'area')
                    .attr('d', area)
                    .style('fill', '#3A80A7')

            }

            function drawDaylightMarkers(){

                var daylight = g.selectAll('.day')
                                .data(self.solar)
                                .enter().append('g')

                daylight.append('rect')
                    .attr('class', 'day')
                    .attr('x', function(d){
                        return x(d.sunrise)
                    })
                    .attr('y', function(d){
                        return 0
                    })
                    .attr('width', function(d){
                        return x(d.sunset) - x(d.sunrise)
                    })
                    .attr('height', function(d){
                        return self.workspaceHeight
                    })

                daylight.append('rect')
                    .attr('class', 'day')
                    .attr('x', function(d){
                        return x(d.dawn)
                    })
                    .attr('y', function(d){
                        return 0
                    })
                    .attr('width', function(d){
                        return x(d.dusk) - x(d.dawn)
                    })
                    .attr('height', function(d){
                        return self.workspaceHeight
                    })

                daylight.append('rect')
                    .attr('class', 'day')
                    .attr('x', function(d){
                        return x(d.nauticalDawn)
                    })
                    .attr('y', function(d){
                        return 0
                    })
                    .attr('width', function(d){
                        return x(d.nauticalDusk) - x(d.nauticalDawn)
                    })
                    .attr('height', function(d){
                        return self.workspaceHeight
                    })

            }

            function drawTicksAndLabels(){

                var timeLabelAxis = x.copy()
                                     .domain([self.xData[16], self.xData[dataLength - 8]])
                var tickBaseline = self.workspaceHeight - 3
                var bisect = d3.bisector(function(d){ 
                    return d.date
                }).left

                g.selectAll('.tick-background')
                    .data(function(){
                        return [{test:0}]
                    })
                    .enter().append('rect')
                    .attr('class', 'tick-background')
                    .attr('x', function(d){
                        return 0
                    })
                    .attr('y', function(d){
                        return self.workspaceHeight - 43
                    })
                    .attr('width', function(d){
                        return w
                    })
                    .attr('height', function(d){
                        return self.workspaceHeight
                    })

                g.selectAll('.time-ticks')
                    .data(function(){
                        var axis = x.copy().domain([self.xData[10], self.xData[dataLength - 4]])
                        return axis.ticks(24 * self.times.dayCount)
                    })
                    .enter().append('svg:line')
                    .attr('class', 'time-ticks')
                    .attr('x1', function(d){ 
                        return x(d) })
                    .attr('y2', function(d, i){ 
                        return tickBaseline
                    })
                    .attr('x2', function(d){ 
                        return x(d) })
                    .attr('y1', function(d, i){ 
                        return tickBaseline - 10
                    })
                    /*
                    .attr('y1', function(d, i){ 
                        var point = bisect(self.data, d)
                        return y(self.data[point].value)
                    })
                    */

                g.selectAll('.time-long-ticks')
                    .data(timeLabelAxis.ticks(7 * self.times.dayCount))
                    .enter().append('svg:line')
                    .attr('class', 'time-long-ticks')
                    .attr('x1', function(d){ 
                        return x(d) 
                    })
                    .attr('y2', function(d, i){ 
                        return tickBaseline 
                    })
                    .attr('x2', function(d){ 
                        return x(d) 
                    })
                    .attr('y1', function(d, i){ 
                        return tickBaseline - 20
                    })
                    /*
                    .attr('y1', function(d, i){ 
                        var point = bisect(self.data, d)
                        return y(self.data[point].value)
                    })
                    */

                g.selectAll('.midnight-ticks')
                    .data(timeLabelAxis.ticks(self.times.dayCount))
                    .enter().append('svg:line')
                    .attr('class', 'midnight-ticks')
                    .attr('x1', function(d){ 
                        return x(d) + 1
                    })
                    .attr('y2', function(d, i){ 
                        return tickBaseline 
                    })
                    .attr('x2', function(d){ 
                        return x(d) + 1
                    })
                    .attr('y1', function(d, i){ 
                        return tickBaseline - 20
                    })

                g.selectAll('.time-label')
                    .data(timeLabelAxis.ticks(3 * self.times.dayCount))
                    .enter().append('svg:text')
                    .attr('class', function(d){
                        var hour = d.getHours()
                        if (!(hour % 12)){
                            return 'time-label special'
                        }
                        return 'time-label'
                    })
                    .text(function(d){
                        return self.helpers.timeLabelFormat(d).replace(/^0+/, '')
                    })
                    .attr('x', function(d){ 
                        return x(d) - 2
                    })
                    .attr('y', function(d){
                        return tickBaseline - 30
                    })
                    .attr('text-anchor', 'start')

                g.selectAll('.date-label')
                    .data(self.solar)
                    .enter().append('svg:text')
                    .attr('class', 'date-label')
                    .text(function(d){
                        return
                        var date = new Date(d.date.toDateString())
                        d = new Date(date.setHours(12))
                        return self.helpers.displayDateFormat(d)
                    })
                    .attr('x', function(d){ 
                        var date = new Date(d.date.toDateString())
                        d = new Date(date.setHours(12))
                        if (self.times.current > d) {
                            return x(self.times.current)
                        } if (self.times.end < d) {
                            return w - 80
                        }
                        return x(d)
                    })
                    .attr('y', function(d){
                        return tickBaseline - 55
                    })
                    .attr('text-anchor', 'start')
            }

            function drawLine(){
                var line = d3.svg.line()
                    .interpolate('cardinal')
                    .tension(0.8)
                    .x(function(d,i){ 
                        return x(self.xData[i])
                    })
                    .y(function(d){ 
                        return y(d)
                    })

                var path = g.append('svg:path')
                            .attr('d', line(self.yData))
                            .attr('class', 'color');

                var overlay = g.selectAll('.overlay')
                                .data(self.solar)
                                .enter().append('g')

                overlay.append("rect")
                  .attr("class", "overlay-test")
                  .attr("width", w)
                  .attr("height", h + margin.top + margin.bottom)
                  .on("mousemove", swim);

                function swim(){
                    var d = d3.mouse(this)
                    var time = x.invert(d[0])

                    var bisect = d3.bisector(function(d) { 
                        return d.date; 
                    }).left

                    var point = bisect(self.data, time)
                    var vertical = y(self.yData[point])
                    var horizontal = x(time)

                    g.select('.current-point')
                        .attr('cx', function(d){
                            return horizontal
                        })
                        .attr('cy', function(d){
                            return vertical
                        })
                    l.select('.vertical-marker')
                        .attr('y1', function(d){
                            return vertical
                        })
                        .attr('y2', function(d){
                            return vertical
                        })
                    g.select('.horizontal-marker')
                        .attr('x1', function(d){
                            return horizontal
                        })
                        .attr('x2', function(d){
                            return horizontal
                        })

                    g.selectAll('.inspected-tide-value')
                        .text(function(d){
                            var height = self.yData[point].toFixed(1) + " ft "
                            return height
                        })
                        .attr('x', function(d){ 
                            return horizontal - 2
                        })
                        .attr('text-anchor', 'start')

                }
            }

            function drawCurrentLabels(){
                g.selectAll('.current-tide-value')
                    .data( function(){
                        var bisect = d3.bisector(function(d) { 
                            return d.date; 
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:text')
                    .attr('class', 'current-tide-value')
                    .text(function(d){
                        var height = self.yData[d].toFixed(1)
                        return height + '' 
                    })
                    .attr('x', function(d){ 
                        return x(self.times.current) - 5
                    })
                    .attr('y', function(d){
                        return 65
                    })
                    .attr('text-anchor', 'start')
                    .append("svg:tspan").text(" ft");

                g.selectAll('.current-time')
                    .data( function(){
                        var bisect = d3.bisector(function(d){ 
                            return d.date;
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:text')
                    .attr('class', 'current-time')
                    .text(function(d){
                        return self.helpers.timeFormat(self.times.current).replace(/^0+/, '') + ' ' + self.times.displayTimezone
                    })
                    .attr('x', function(d){ 
                        return x(self.times.current) - 3
                    })
                    .attr('y', function(d){
                        return (20 + 55) 
                    })
                    .attr('text-anchor', 'start')


                /* parts that scroll */

                g.selectAll('.inspected-tide-value')
                    .data( function(){
                        var bisect = d3.bisector(function(d) { 
                            return d.date; 
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:text')
                    .attr('class', 'inspected-tide-value')
                    .text(function(d){
                        var height = self.yData[d].toFixed(1)
                        return height + ' ft' 
                    })
                    .attr('x', function(d){ 
                        return x(self.times.current) - 5 
                    })
                    .attr('y', function(d){
                        return self.workspaceHeight - 65
                    })
                    .attr('text-anchor', 'start')

                g.selectAll('.current-point')
                    .data( function(){
                        var bisect = d3.bisector(function(d) { return d.date; }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })

                    .enter().append('svg:circle')
                    .attr('class', 'current-point')
                    .attr('r', 5)
                    .attr('cx', function(d){
                        return x(self.times.current)
                    })
                    .attr('cy', function(d){
                        return y(self.data[d].value)
                    })
                g.selectAll('.horizontal-marker')
                    .data( function(){
                        var bisect = d3.bisector(function(d) { return d.date; }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:line')
                    .attr('class', 'horizontal-marker')
                    .attr('x1', function(d){ 
                        return x(self.times.current)
                    })
                    .attr('y2', function(d, i){ 
                        return self.workspaceHeight - 3
                    })
                    .attr('x2', function(d){ 
                        return x(self.times.current)
                    })
                    .attr('y1', function(d, i){ 
                        return self.workspaceHeight - 20
                    })
            }

            function redrawCurrentLabelsAndMarker(speed){

                g.selectAll('.current-marker')
                    .data( function(){
                        var bisect = d3.bisector(function(d){ 
                            return d.date
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .transition().duration(speed).ease('linear')
                    .attr('x1', function(d){ 
                        return x(self.times.current) 
                    })
                    .attr('y2', function(d, i){ 
                        return self.workspaceHeight
                    })
                    .attr('x2', function(d){ 
                        return x(self.times.current) 
                    })
                    .attr('y1', function(d, i){ 
                        return  110
                    })

                g.selectAll('.current-tide-value')
                    .data( function(){
                        var bisect = d3.bisector(function(d) { 
                            return d.date; 
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .transition().duration(speed).ease('linear')
                    .text(function(d){
                        var height = self.yData[d].toFixed(1)
                        return height + ' ft' 
                    })
                    .attr('x', function(d){ 
                        return x(self.times.current) - 5 
                    })

                g.selectAll('.current-time')
                    .data( function(){
                        var bisect = d3.bisector(function(d){ 
                            return d.date;
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .transition().duration(5000).ease('linear')
                    .text(function(d){
                        return self.helpers.timeFormat(self.times.current) + ' ' + self.times.displayTimezone
                    })
                    .attr('x', function(d){ 
                        return x(self.times.current)  - 5 
                    })


                g.selectAll('.current-tide-value')
                    .data( function(){
                        var bisect = d3.bisector(function(d) { 
                            return d.date; 
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:text')
                    .attr('class', 'current-tide-value')
                    .text(function(d){
                        var height = self.yData[d].toFixed(1)
                        return height + ' ft' 
                    })
                    .attr('x', function(d){ 
                        return x(self.times.current) - 5 
                    })
                    .attr('y', function(d){
                        return (15) 
                    })
                    .attr('text-anchor', 'start')

                g.selectAll('.current-time')
                    .data( function(){
                        var bisect = d3.bisector(function(d){ 
                            return d.date;
                        }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:text')
                    .attr('class', 'current-time')
                    .text(function(d){
                        return self.helpers.timeFormat(self.times.current) + ' ' + self.times.displayTimezone
                    })
                    .attr('x', function(d){ 
                        return x(self.times.current) - 3
                    })
                    .attr('y', function(d){
                        return (20 + 55) 
                    })
                    .attr('text-anchor', 'start')

            }

            function drawHeightGrid() {

                l.selectAll('.height-label')
                    .data(heightLabelAxis.ticks(6))
                    .enter().append('svg:text')
                    .attr('class', 'height-label')
                    .text(String)
                    .attr('x', 35)
                    .attr('y', function(d){ 
                        return y(d) 
                    })
                    .attr('text-anchor', 'start')

                l.selectAll('.height-ticks')
                    .data(heightLabelAxis.ticks(8))
                    .enter().append('svg:line')
                    .attr('class', 'height-ticks')
                    .attr('x1', function(d){
                        return 45 
                    })
                    .attr('y2', function(d, i){ 
                        return  y(d) 
                    })
                    .attr('x2', function(d){ 
                        return w 
                    })
                    .attr('y1', function(d, i){ 
                        return  y(d) 
                    })
                l.selectAll('.vertical-marker')
                    .data( function(){
                        var bisect = d3.bisector(function(d) { return d.date; }).left
                        var point = bisect(self.data, self.times.current)
                        return [point]
                    })
                    .enter().append('svg:line')
                    .attr('class', 'vertical-marker')
                    .attr('x1', function(d){ 
                        return 45
                    })
                    .attr('y2', function(d, i){ 
                        return y(self.data[d].value)
                    })
                    .attr('x2', function(d){ 
                        return 55
                    })
                    .attr('y1', function(d, i){ 
                        return y(self.data[d].value)
                    })
            }
        }
    }

    DayGraph.$inject = ['$interval'];
    return DayGraph
})