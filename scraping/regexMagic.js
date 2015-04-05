var parser = function(type, eventString) {
	if (type == 'foul' || type == 'shootingFoul') return handleFoul(eventString, type);
	if (type == 'quarter') return handleQuarter(eventString);
	if (type == 'turnover') return handleTurnover(eventString);

	var regex  = getRegEx(type);
	var fields = regex.exec(eventString);
	if (fields == null) console.log("regex failed on: " + eventString);
	else fields[0] = type;
	return fields;
}

var getRegEx = function(type) {
	switch(type) {
		case 'ft':
			return /(.*)\s(makes|misses).*/;
		case 'shot':
			return /(.*)\s(makes|misses)\s(2|3)[^\(]*(?:\((assist|block)\sby\s(.*)\))*$/;
		case 'rebound':
			return /(Offensive|Defensive).*by\s(.*)/;
	}	
}

var handleTurnover = function(eventString) {
	var regex = /Turnover\sby\s(.*)\s\(.*/;
	var fields = regex.exec(eventString);

	if (fields == null) console.log("regex failed on: " + eventString);
	else {
		fields[0] = 'turnover';
		var index = eventString.indexOf("steal by");
		var stealer = null;
		if (index > -1) {
			var stealRegex = /steal\sby\s(.*)\)$/;
			var stealFields = stealRegex.exec(eventString);
			stealer = stealFields[1];
		}
		fields.push(stealer);
	}
	return fields;
}

var handleFoul = function(eventString, type) {
	//handle special cases
	if (eventString.indexOf("Team") != -1) return ['foul', 'Team'];

	var index = eventString.indexOf('(');
	if (index >= 0) eventString = eventString.substring(0, index-1);

	var regex = /.*foul\sby\s(.*)/;
	var fields = regex.exec(eventString);

	if (fields == null) console.log("regex failed on: " + eventString);
	else {
		fields[0] = type;
	}
	return fields;
}

var handleQuarter = function(eventString) {
	var period = parseInt(eventString.match(/\d/)[0]);
	if (eventString.indexOf("overtime") != -1) period += 4;
	var fields = ['quarter', period];
	return fields;
}

module.exports = parser;