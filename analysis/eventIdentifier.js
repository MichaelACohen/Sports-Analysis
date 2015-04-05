var classifyEvent = {
	'made shot': function(evt) {
		return evt.is_made && evt['type'] == 'shot';
	},
	'missed shot': function(evt) {
		return !evt.is_made && evt['type'] == 'shot';
	},
	'made 2pt shot': function(evt) {
		return evt.is_made && !evt.is_three && evt['type'] == 'shot';
	},
	'missed 2pt shot': function(evt) {
		return !evt.is_made && !evt.is_three && evt['type'] == 'shot';
	},
	'made 3pt shot': function(evt) {
		return evt.is_made && evt.is_three && evt['type'] == 'shot';
	},
	'missed 3pt shot': function(evt) {
		return !evt.is_made && evt.is_three && evt['type'] == 'shot';
	},
	'made ft': function(evt) {
		return evt.is_made && evt['type'] == 'ft';
	},
	'missed ft': function(evt) {
		return !evt.is_made && evt['type'] == 'ft';
	},
	'rebound': function(evt) {
		return evt['type'] == 'rebound';
	},
	'offensive rebound': function(evt) {
		return !evt.is_defensive && evt['type'] == 'rebound';
	},
	'defensive rebound': function(evt) {
		return evt.is_defensive && evt['type'] == 'rebound';
	},
	'assist': function(evt) {
		return evt['type'] == 'assist';
	},
	'block': function(evt) {
		return evt['type'] == 'block';
	},
	'steal': function(evt) {
		return evt['type'] == 'steal';
	},
	'turnover': function(evt) {
		return evt['type'] == 'turnover';
	}
};

var identifyType = {
	'made shot': function() {
		return 'shot';
	},
	'missed shot': function() {
		return 'shot';
	},
	'made 2pt shot': function() {
		return 'shot';
	},
	'missed 2pt shot': function() {
		return 'shot';
	},
	'made 3pt shot': function() {
		return 'shot';
	},
	'missed 3pt shot': function() {
		return 'shot';
	},
	'made ft': function() {
		return 'ft';
	},
	'missed ft': function() {
		return 'ft';
	},
	'rebound': function() {
		return 'rebound';
	},
	'offensive rebound': function() {
		return 'rebound';
	},
	'defensive rebound': function() {
		return 'rebound';
	},
	'assist': function() {
		return 'assist';
	},
	'block': function() {
		return 'block';
	},
	'steal': function() {
		return 'steal';
	},
	'turnover': function() {
		return 'turnover';
	}
}

module.exports.classifyEvent = classifyEvent;
module.exports.identifyType = identifyType

module.exports.classifyPositive = function(posEvents) {
	return function(evt) {
		for (var i = 0; i < posEvents.length; i++) {
			if (classifyEvent[posEvents[i]](evt)) return true;
		}
		return false;
	}
}

module.exports.classifyNegative = function(negEvents) {
	return function(evt) {
		for (var i = 0; i < negEvents.length; i++) {
			if (classifyEvent[negEvents[i]](evt)) return true;
		}
		return false;
	}
}