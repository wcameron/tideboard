function drawCurrentMarker(time, speed) {
          var displayTime = new Date(time).setHours(0, 0, 0, 0);
          var current = new Date().setHours(0, 0, 0, 0);

          if (displayTime !== current){
              return false
          }

          currentMarker.attr('transform', function(d){ return 'translate(' + x(time) + ', 70)'})
          currentMarker.append('line')
              .attr('class', 'current-marker')
              .attr('x1', 0)
              .attr('y2', height)
              .attr('x2', 0)
              .attr('y1', 40)

          currentMarker.selectAll('.current-tide-value')
              .data( function(){ return [bisect(self.data, time)] })
              .enter().append('text')
              .attr('class', 'current-tide-value')
              .text(function(d){ return self.yData[d].toFixed(1) })
              .attr('x', -5)
              .attr('y', 0)
              .append('tspan').text(' ft');

          currentMarker.selectAll('.current-time')
              .data( function(){ return [bisect(self.data, time)] })
              .enter().append('text')
              .attr('class', 'current-time')
              .text(function(d){
                  var formattedTime =  self.timeFormat(time)
                                          .replace(/^0+/, '') + ' ' + self.times.displayTimezone
                  return formattedTime
              })
              .attr('x', -3)
              .attr('y', 5)

          currentMarker.selectAll('.current-tide-value')
              .data(function(){ return [bisect(self.data, time)]})
              .text(function(d){ 
              return self.yData[d].toFixed(1) })
              .append('tspan').text(' ft')

          currentMarker.selectAll('.current-time')
              .text(function(d){
                  return self.timeFormat(time).replace(/^0+/, '') + ' ' + self.times.displayTimezone
              })
      }