var parseMessage = require('./parseMessage');
var parseTimestamp = require('./parseTimestamp');
var parseValue = require('./parseValue');

module.exports = function() {
	'use strict';

	return {
		parseMessage: parseMessage,
		parseTimestamp: parseTimestamp,
		parseValue: parseValue,

		Parse: parseMessage,
		ParseTimestamp: parseTimestamp,
		ParseValue: parseValue
	};
}();