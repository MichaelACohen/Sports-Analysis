var eventIdentifier = require('../analysis/eventIdentifier.js')

var isPositive, isNegative;

var POSITIVE_CUTOFF = 3;
var NEGATIVE_CUTOFF = -3;

module.exports = function(rows, names, isPlayers, posEvents, negEvents) {

	//isPositive and isNegative are functions that take an event
	//and return whether that event is positive or negative respectively
	isPositive = eventIdentifier.classifyPositive(posEvents);
	isNegative = eventIdentifier.classifyNegative(negEvents);

	//format is obj[team/pname] = [[events for game1], [events for game2], ... ]
	var obj = formatRows(rows, names, isPlayers);
	var data = [];
	for (var name in obj) {
		if (obj.hasOwnProperty(name)) {
			var games = obj[name];
			data.push({ name: name, data: getConditionalPercentages(games) });
		}
	}
	return data;
}

var getConditionalPercentages = function(games) {
	var percentages = calculatePercentages(games);
	return percentages;
}

var calculatePercentages = function(games) {
	var stats = [];
	for (var i = 0; i < 7; i++) {
		stats[i] = { makes: 0, misses: 0 };
	}
	for (var i = 0; i < games.length; i++) {
		var posEvents = 0;
		var negEvents = 0;
		for (var j = 0; j < games[i].length; j++) {
			var evt = games[i][j];
			if (evt['type'] == 'shot') {
				if (posEvents) {
					var index = posEvents > 3 ? 6 : posEvents+3;
					if (evt.is_made) {
						stats[index].makes++;
						if (index != 3) stats[3].makes++;
					} else {
						stats[index].misses++;
						if (index != 3) stats[3].misses++;
					}
				} else {
					var index = negEvents > 3 ? 0 : -1*negEvents+3;
					if (evt.is_made) {
						stats[index].makes++;
						if (index != 3) stats[3].makes++;
					} else  {
						stats[index].misses++;
						if (index != 3) stats[3].misses++;
					}
				}
			}

			if (isPositive(evt)) {
				posEvents++;
				negEvents = 0;
			} else if (isNegative(evt)) {
				posEvents = 0;
				negEvents++;
			}
		}
	}
	for (var i = 0; i < stats.length; i++) {
		stats[i].percent = stats[i].makes/(stats[i].makes+stats[i].misses);
		stats[i].total = stats[i].makes+stats[i].misses;
	}
	return stats;
}

var calculateWithIndex = function(games, i) {
	var numEvents = Math.abs(i);
	var positive = i >= 0 ? true : false;

	var statsAfterEvents = function() {
		var makes = 0, misses = 0;
		for (var j = 0; j < games.length; j++) {
			for (var k = numEvents; k < games[j].length; k++) {
				var isValidShot = function() {
					if (positive) {
						for (var l = k-numEvents; l < k; l++) {
							var evt = games[j][l];
							if (isNegative(evt)) {
								return false;
							}
						}
					} else {
						for (var l = k-numEvents; l < k; l++) {
							var evt = games[j][l];
							if (isPositive(evt)) {
								return false;
							}
						}
					}
					return true;
				}
				if (games[j][k]['type'] == 'shot' && isValidShot()) {
					if (games[j][k].is_made) makes++;
					else misses++;
				}
			}
		}
		return { makes: makes, misses: misses, percent: makes/(makes+misses), total: makes+misses };
	}

	var stats = statsAfterEvents();
	return stats;
}

var formatRows = function(rows, names, isPlayers) {
	var obj = {};
	for (var i = 0; i < names.length; i++) {
		var playerArr = [];
		var events = rows.filter(function(row) {
			return isPlayers ? row.pname == names[i] : row.team == names[i];
		});
		var game = [], curGame;
		for (var j = 0; j < events.length; j++) {
			if (j == 0) curGame = events[j].gid;
			if (curGame != events[j].gid) {
				playerArr.push(game);
				curGame = events[j].gid;
				game = [];
			}
			game.push(events[j]);
		}
		playerArr.push(game);
		obj[names[i]] = playerArr;
	}
	return obj;
}