'use strict';
module.exports = DateFormat;

DateFormat.$inject = ['moment']
function DateFormat(moment) {
	return function(input, tz) {
		if (input && tz){
			return moment(input).tz(tz).format('MMMM D, YYYY z')
		}
		return input
	};
};
