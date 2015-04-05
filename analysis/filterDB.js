var async = require('async');
var db = require('../database/db.js')

var EVENT_CUTOFF = 200;

//removes all players from players table in db that have less than
//EVENT_CUTOFF events (currently there are no players with less than 200)
var removeExtraneous = function() {
	var queryString = "SELECT * FROM players";
	var values = [];
	var cb = function(err, result) {
		if (err) console.log(err);
		console.log(result.rows.length);
		async.each(result.rows, function(player, callback) {
			var query = 'SELECT * FROM events WHERE pname=$1';
			var vals = [player.short_name];
			var playerCB = function(err, result) {
				if (err) callback(err);
				if (result.rows.length < EVENT_CUTOFF) {
					var q = "DELETE FROM players WHERE full_name=$1";
					var v = [player.full_name];
					var c = function(err, result) {
						callback(err);
					}
					db.query(q, v, c);
				} else {
					callback(null);
				}
			}
			db.query(query, vals, playerCB);
		}, function(err) {
			if (err) console.log(err);
		});
	}
	db.query(queryString, values, cb);
}

module.exports = removeExtraneous;