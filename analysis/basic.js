module.exports.analyzePlayers = function(rows, names) {
	//format is obj[pName] = [[shots for game1], [shots for game2], ... ]
	var obj = formatRows(rows, names);
	var percentages = [];
	for (var player in obj) {
		if (obj.hasOwnProperty(player)) {
			var games = obj[player];
			percentages.push({'name': player, 'data': getConditionalPercentages(games)});
		}
	}
	return percentages;
}

var getConditionalPercentages = function(games) {
	var percentages = [];
	for (var i = -3; i <= 3; i++) {
		percentages.push(calculatePercentage(games, i));
	}
	return percentages;
}

var calculatePercentage = function(games, i) {
	if (i < 0) return calculatePctAfterShots(games, i*-1, false);
	return calculatePctAfterShots(games, i, true);
}

var calculatePctAfterShots = function(games, numShots, make) {
	var makes = 0, misses = 0;
	for (var j = 0; j < games.length; j++) {
		for (var k = numShots; k < games[j].length; k++) {
			var isValidShot = function(make) {
				if (make) {
					for (var l = k-numShots; l < k; l++) {
						if (!(games[j][l].is_made)) return false;
					}
				} else {
					for (var l = k-numShots; l < k; l++) {
						if (games[j][l].is_made) return false;
					}
				}
				return true;
			}
			if (isValidShot(make)) {
				if (games[j][k].is_made) makes++;
				else misses++;
			}
		}
	}
	return {"percent": makes/(makes+misses), "number": makes+misses};
}

var formatRows = function(rows, names) {
	var obj = {};
	for (var i = 0; i < names.length; i++) {
		var playerArr = [];
		var shots = rows.filter(function(row) {
			return row.pname == names[i];
		});
		var game = [], curGame;
		for (var j = 0; j < shots.length; j++) {
			if (j == 0) curGame = shots[j].gid;
			if (curGame != shots[j].gid) {
				playerArr.push(game);
				curGame = shots[j].gid;
				game = [];
			}
			game.push(shots[j]);
		}
		playerArr.push(game);
		obj[names[i]] = playerArr;
	}
	return obj;
}