'use strict';
module.exports = Moon

Moon.$inject = ['d3']
function Moon(d3) {
	return function(input) {
		if (input){
			var phases = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', '@', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0']
			var phase = d3.scale.quantize().domain([0, 1]).range(phases);
			input = phase(input)
		}
		return input
	}
};
