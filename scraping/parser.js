var parser = require('./regexMagic.js')

var parseLine = function(eventString) {
	var type = getType(eventString);
	if (type) {
		var arr = parser(type, eventString);
		return arr;
	} else {
		//console.log("Failed to parse event string: " + eventString);
		return null;
	}
}

var getType = function(eventString) {
	if (isFreeThrow(eventString)) {
		return 'ft';
	} else if (isShot(eventString)) {
		return 'shot';
	} else if (isRebound(eventString)) {
		return 'rebound';
	} else if (isTurnover(eventString)) {
		return 'turnover';
	} else if (isShootingFoul(eventString)) {
		return 'shootingFoul';
	} else if (isFoul(eventString)) {
		return 'foul';
	} else if (isStartOfQuarter(eventString)) {
		return 'quarter';
	}
	return null;
}

var isFreeThrow = function(eventString) {
	return eventString.indexOf("free throw") != -1;
}

var isShot = function(eventString) {
	return eventString.indexOf(" makes ") != -1 || eventString.indexOf(" misses ") != -1;
}

var isRebound = function(eventString) {
	return eventString.indexOf(" rebound ") != -1;
}

var isTurnover = function(eventString) {
	return eventString.indexOf("Turnover") != -1;
}

var isShootingFoul = function(eventString) {
	return eventString.indexOf("Shooting foul") != -1;
}

var isFoul = function(eventString) {
	return eventString.indexOf("foul by") != -1;
}

var isStartOfQuarter = function(eventString) {
	return eventString.indexOf("Start of") != -1;
}

module.exports = parseLine;