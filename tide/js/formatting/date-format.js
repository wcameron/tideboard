'use strict';

module.exports = function(d3) {
	var format = d3.time.format('%B% %e, %Y');
	return function(input) {
		if (input){
			input = format(input)
		}
		return input
	};
};