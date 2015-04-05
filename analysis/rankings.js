var async = require('async')

var analyze = require('../analysis/analyze.js')
var db = require('../database/db.js')
var query = require('../queries/queries.js')

var EVENT_COMBOS = [
{ comboID: 0, positive: ['made shot'], negative: ['missed shot'] },
{ comboID: 1, positive: ['made 3pt shot'], negative: ['missed shot'] },
{ comboID: 2, positive: ['made 3pt shot'], negative: ['missed 3pt shot'] },
{ comboID: 3, positive: ['made shot', 'assist'], negative: ['missed shot', 'turnover'] },
{ comboID: 4, positive: ['made shot', 'steal'], negative: ['missed shot', 'turnover'] },
{ comboID: 5, positive: ['made 3pt shot', 'assist'], negative: ['missed shot', 'turnover'] },
{ comboID: 6, positive: ['made 3pt shot', 'steal'], negative: ['missed shot', 'turnover'] },
{ comboID: 7, positive: ['made shot', 'block'], negative: ['missed shot', 'turnover'] }
];

module.exports.eventCombos = EVENT_COMBOS;

var standingsInfo = [
	{tid:1, wins: 38, losses: 44},
	{tid:2, wins: 25, losses: 57},
	{tid:3, wins: 44, losses: 38},
	{tid:4, wins: 43, losses: 39},
	{tid:5, wins: 48, losses: 34},
	{tid:6, wins: 33, losses: 49},
	{tid:7, wins: 49, losses: 33},
	{tid:8, wins: 36, losses: 46},
	{tid:9, wins: 29, losses: 53},
	{tid:10, wins: 51, losses: 31},
	{tid:11, wins: 54, losses: 28},
	{tid:12, wins: 56, losses: 26},
	{tid:13, wins: 57, losses: 25},
	{tid:14, wins: 27, losses: 55},
	{tid:15, wins: 50, losses: 32},
	{tid:16, wins: 54, losses: 28},
	{tid:17, wins: 15, losses: 67},
	{tid:18, wins: 40, losses: 42},
	{tid:19, wins: 34, losses: 48},
	{tid:20, wins: 37, losses: 45},
	{tid:21, wins: 59, losses: 23},
	{tid:22, wins: 23, losses: 59},
	{tid:23, wins: 19, losses: 63},
	{tid:24, wins: 48, losses: 34},
	{tid:25, wins: 54, losses: 28},
	{tid:26, wins: 28, losses: 54},
	{tid:27, wins: 62, losses: 20},
	{tid:28, wins: 48, losses: 34},
	{tid:29, wins: 25, losses: 57},
	{tid:30, wins: 44, losses: 38}
];

var teamStandings = function() {
	async.each(standingsInfo, function(team, callback) {
		console.log("starting team " + team.tid);
		var queryString = "INSERT INTO standings (tid, wins, losses) VALUES ($1, $2, $3)";
		var values = [team.tid, team.wins, team.losses];
		var cb = function(err, results) {
			if (err) console.log(err);
			callback(err);
		}
		db.query(queryString, values, cb);
	}, function(err, results) {
		if (err) console.log(err);
		console.log("done");
	});
}

module.exports.teamStandings = teamStandings;

var graphs = function(req, res) {
	async.parallel([
		function(callback) {
			var queryString = "SELECT players.full_name, players.team, players.pid, player_stats.percent[7] AS positivepercent, player_stats.percent[7]-player_stats.percent[4] AS positive, ppg.ppg FROM players, player_stats, ppg WHERE player_stats.cid=0 AND players.pid=player_stats.id AND players.pid=ppg.pid AND player_stats.total[4] >= 250 AND player_stats.total[7] >= 25 ORDER BY ppg.ppg";
			var values = [];
			var cb = function(err, result) {
				if (err) console.log(err);
				callback(err, result.rows);
			}
			db.query(queryString, values, cb);
		},
		function(callback) {
			var queryString = "SELECT players.full_name, players.team, players.pid, player_stats.percent[1] AS negativepercent, player_stats.percent[1]-player_stats.percent[4] AS negative, ppg.ppg FROM players, player_stats, ppg WHERE player_stats.cid=0 AND players.pid=player_stats.id AND players.pid=ppg.pid AND player_stats.total[4] >= 250 AND player_stats.total[1] >= 25 ORDER BY ppg.ppg";
			var values = [];
			var cb = function(err, result) {
				if (err) console.log(err);
				callback(err, result.rows);
			}
			db.query(queryString, values, cb);	
		},
		function(callback) {
			var queryString = "SELECT teams.name, teams.tid, team_stats.percent[7] AS positivepercent, team_stats.percent[7]-team_stats.percent[4] AS positive, standings.wins, standings.losses FROM teams, team_stats, standings WHERE teams.tid=standings.tid AND teams.tid=team_stats.id AND team_stats.cid=0 ORDER BY standings.wins";
			var values = [];
			var cb = function(err, result) {
				if (err) console.log(err);
				callback(err, result.rows);
			}
			db.query(queryString, values, cb);
		},
		function(callback) {
			var queryString = "SELECT teams.name, teams.tid, team_stats.percent[1] AS negativepercent, team_stats.percent[1]-team_stats.percent[4] AS negative, standings.wins, standings.losses FROM teams, team_stats, standings WHERE teams.tid=standings.tid AND teams.tid=team_stats.id AND team_stats.cid=0 ORDER BY standings.wins";
			var values = [];
			var cb = function(err, result) {
				if (err) console.log(err);
				callback(err, result.rows);
			}
			db.query(queryString, values, cb);
		}
	], function(err, results) {
		if (err) console.log(err);
		res.render('graphs', {title: 'Analysis',positive: results[0], negative: results[1], teamPos: results[2], teamNeg: results[3]});
	});
}

module.exports.graphs = graphs;

var eventComboIndexOf = function(positive, negative) {
	for (var i = 0; i < EVENT_COMBOS.length; i++) {
		if (isACombo(i, positive, negative)) return EVENT_COMBOS[i].comboID;
	}
	return -1;
}

var isACombo = function(index, positive, negative) {
	var eventCombo = EVENT_COMBOS[index];
	for (var i = 0; i < positive.length; i++) {
		if (eventCombo.positive.indexOf(positive[i]) == -1) return false;
	}
	for (var i = 0; i < negative.length; i++) {
		if (eventCombo.negative.indexOf(negative[i]) == -1) return false;
	}
	return eventCombo.positive.length == positive.length && eventCombo.negative.length == negative.length;
}

module.exports.eventComboIndexOf = eventComboIndexOf;
module.exports.isACombo = isACombo;

var getRankings = function(callback) {
	var queryString = "SELECT DISTINCT(players.full_name), players.team, player_stats.percent[4] AS fgpercent, player_stats.percent[7]-player_stats.percent[4] AS positive, player_stats.makes[7] AS positiveMakes, player_stats.total[7] AS positiveTotal, player_stats.percent[1]-player_stats.percent[4] AS negative, player_stats.makes[1] AS negativemakes, player_stats.total[1] AS negativetotal FROM players, player_stats WHERE player_stats.total[1] >= 50 AND player_stats.total[7] >= 50 AND player_stats.total[4] >= 500 AND player_stats.cid=0 AND player_stats.id=players.pid";
	var values = [];
	var cb = function(err, result) {
		for (var i = 0; i < result.rows.length; i++) {
			var name = result.rows[i].full_name;
			for (var j = 0; j < result.rows.length; j++) {
				if (i!=j && result.rows[j].full_name == name) {
					result.rows.splice(j, 1);
				}
			}
		}
		callback(err, result);
	}
	db.query(queryString, values, cb);
}

module.exports.getRankings = getRankings;

var getTeamRankings = function(callback) {
	var queryString = "SELECT teams.name, team_stats.percent[4] AS fgpercent, team_stats.percent[7]-team_stats.percent[4] AS positive, team_stats.makes[7] AS positivemakes, team_stats.total[7] AS positivetotal, team_stats.percent[1]-team_stats.percent[4] AS negative, team_stats.makes[1] AS negativemakes, team_stats.total[1] AS negativetotal FROM teams, team_stats WHERE teams.tid=team_stats.id";
	var values = [];
	var cb = callback;
	db.query(queryString, values, cb);
}

module.exports.getTeamRankings = getTeamRankings;

var getCorrelation = function(callback) {
	var queryString = "SELECT DISTINCT(players.full_name), player_stats.percent[7]-player_stats.percent[4] AS positive, player_stats.percent[1]-player_stats.percent[4] AS negative FROM players, player_stats WHERE player_stats.total[1] >= 50 AND player_stats.total[7] >= 50 AND player_stats.total[4] >= 500 AND player_stats.cid=0 AND player_stats.id=players.pid";
	var values = [];
	var cb = function(err, result) {
		for (var i = 0; i < result.rows.length; i++) {
			var name = result.rows[i].full_name;
			for (var j = 0; j < result.rows.length; j++) {
				if (i!=j && result.rows[j].full_name == name) {
					result.rows.splice(j, 1);
				}
			}
		}
		//get ppg and player rankings and compare
		callback(err, result);
	}
}

var rank = function() {
	var queryString = "SELECT DISTINCT(players.full_name), player_stats.percent[1]-player_stats.percent[4] AS diff FROM player_stats, players WHERE player_stats.total[4] > 400 AND player_stats.cid=0 AND player_stats.id=players.pid ORDER BY diff DESC";
	var values = [];
	var cb = function(err, result) {
		if (err) console.log(err);
		for (var i = 0; i < result.rows.length; i++) {
			console.log(result.rows[i]);
		}
	}
	db.query(queryString, values, cb);
}

module.exports.rank = rank;

var rankTeams = function() {
	var queryString = "SELECT teams.name, team_stats.percent FROM teams, team_stats WHERE teams.tid = team_stats.id AND team_stats.cid = $1";
	var values = [0];
	var cb = function(err, result) {
		if (err) console.log(err);
		for (var i = 0; i < result.rows.length; i++) {
			console.log(result.rows[i]);
		}
	}
	db.query(queryString, values, cb);
}

module.exports.rankTeams = rankTeams;

module.exports.recover = function() {
	var isPlayers = true;

	var queryString = "SELECT * FROM players";
	var values = [];
	var cb = function(err, result) {
		if (err) console.log(err);
		async.eachSeries(result.rows, function(player, callback) {
			var id = player.pid;
			console.log("starting player " + id);
			async.each(EVENT_COMBOS, function(eventObj, cbk) {
				var names = [player.short_name];
				var posEvents = eventObj.positive;
				var negEvents = eventObj.negative;

				var cid = eventComboIndexOf(posEvents, negEvents);

				var queryInfo = query.getQuery(isPlayers, names, posEvents, negEvents);
				var q = queryInfo.query;
				var vals = queryInfo.values;
				var dbCB = function(err, result) {
					if (cid >= 0) {
						var stats = analyze(result.rows, names, isPlayers, posEvents, negEvents)[0];
						var makes = stats.data.map(function(stat) {
							return stat.makes;
						});
						var misses = stats.data.map(function(stat) {
							return stat.misses;
						});
						var total = stats.data.map(function(stat) {
							return stat.total;
						});
						var percent = stats.data.map(function(stat) {
							return stat.percent;
						});
						var qString = "INSERT INTO player_stats (cid, id, makes, misses, total, percent) VALUES ($1, $2, $3, $4, $5, $6)";
						var v = [cid, id, makes, misses, total, percent];
						var insertCB = function(err, result) {
							cbk(err);
						}
						db.query(qString, v, insertCB);
					} else {
						cbk(null);
					}
				}
				db.query(q, vals, dbCB);
			}, function(err) {
				callback(err);
			});
		}, function(err) {
			console.log("done");
		});
	}
	db.query(queryString, values, cb);
}

module.exports.recoverTeams = function() {
	var isPlayers = false;

	var queryString = "SELECT * FROM teams WHERE name=$1";
	var values = ['Charlotte Hornets'];
	var cb = function(err, result) {
		if (err) console.log(err);
		async.eachSeries(result.rows, function(team, callback) {
			var id = team.tid
			console.log("starting team " + id);

			//var names = [team['name']];
			var names = ['Charlotte Bobcats'];

			var cid = 0;
			var posEvents = EVENT_COMBOS[cid].positive;
			var negEvents = EVENT_COMBOS[cid].negative;

			var queryInfo = query.getQuery(isPlayers, names, posEvents, negEvents);
			var q = queryInfo.query;
			var vals = queryInfo.values;
			var dbCB = function(err, result) {
				var stats = analyze(result.rows, names, isPlayers, posEvents, negEvents)[0];
				var makes = stats.data.map(function(stat) {
					return stat.makes;
				});
				var misses = stats.data.map(function(stat) {
					return stat.misses;
				});
				var total = stats.data.map(function(stat) {
					return stat.total;
				});
				var percent = stats.data.map(function(stat) {
					return stat.percent;
				});
				var qString = "INSERT INTO team_stats (cid, id, makes, misses, total, percent) VALUES ($1, $2, $3, $4, $5, $6)";
				var v = [cid, id, makes, misses, total, percent];
				var insertCB = function(err, result) {
					if (err) console.log(err);
					callback(err);
				}
				db.query(qString, v, insertCB);
			}
			db.query(q, vals, dbCB);
		}, function(err) {
			console.log("done");
		});
	}
	db.query(queryString, values, cb);
}