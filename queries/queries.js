var eventIdentifier = require('../analysis/eventIdentifier.js')
var db = require('../database/db.js');

module.exports.players = function(pnames, cb) {
	var queryNames = '';
	for (var i = 0; i < pnames.length-1; i++) {
		queryNames += 'pname=$' + parseInt(i+1) + ' OR ';
	}
	queryNames += 'pname=$' + parseInt(pnames.length);

	var queryString = 'SELECT * FROM shots WHERE ' + queryNames + ' ORDER BY pname, gid, quarter, time_remaining DESC';
	var values = pnames;
	db.query(queryString, values, cb);
}

module.exports.teams = function(teamNames) {
	var queryNames = '';
	for (var i = 0; i < teamNames.length-1; i++) {
		queryNames += 'team=$' + parseInt(i+1) + ' OR ';
	}

	queryNames+= 'team=$' + teamNames.length;

	var queryString = 'SELECT * FROM steals WHERE ' + queryNames + ' ORDER BY team, gid, quarter, time_remaining DESC';
	var values = teamNames;
	var cb = function(err, result) {
		if (err) console.log(err);
	}
	db.query(queryString, values, cb);
}

module.exports.getQuery = function(isPlayers, names, posEvents, negEvents) {
	//deal with players or teams
	var entity = isPlayers ? "pname" : "team";
	var events = posEvents.concat(negEvents);
	events = events.map(function(evt) {
		return eventIdentifier.identifyType[evt]();
	});
	
	var uniq = function(arr) {
		var seen = {};
		return arr.filter(function(evt) {
			return seen.hasOwnProperty(evt) ? false : (seen[evt] = true);
		});
	};

	events = uniq(events);

	if (events.indexOf('shot') == -1) events.push('shot');
	var queryInfo = queryGenerator(entity, names, events);
	return queryInfo;
}

var queryGenerator = function(entity, names, events) {
	var queryWriter = {
		shot: function() {
			queryString = 'SELECT type, gid, pname, team, quarter, time_remaining, is_made, is_three, false AS is_defensive FROM shots WHERE (';
			for (var i = 0; i < names.length-1; i++) {
				queryString += entity + '=$' + parseInt(i+1) + ' OR ';
			}
			queryString += entity + '=$' + parseInt(names.length) + ')';
			return queryString;
		},
		ft: function() {
			queryString = 'SELECT type, gid, pname, team, quarter, time_remaining, is_made, false AS is_three, false AS is_defensive FROM fts WHERE (';
			for (var i = 0; i < names.length-1; i++) {
				queryString += entity + '=$' + parseInt(i+1) + ' OR ';
			}
			queryString += entity + '=$' + parseInt(names.length) + ')';
			return queryString;	
		},
		rebound: function() {
			queryString = 'SELECT type, gid, pname, team, quarter, time_remaining, false AS is_made, false AS is_three, is_defensive FROM rebounds WHERE (';
			for (var i = 0; i < names.length-1; i++) {
				queryString += entity + '=$' + parseInt(i+1) + ' OR ';
			}
			queryString += entity + '=$' + parseInt(names.length) + ')';
			return queryString;
		},
		turnover: function() {
			queryString = 'SELECT *, false AS is_made, false AS is_three, false AS is_defensive FROM turnovers WHERE (';
			for (var i = 0; i < names.length-1; i++) {
				queryString += entity + '=$' + parseInt(i+1) + ' OR ';
			}
			queryString += entity + '=$' + parseInt(names.length) + ')';
			return queryString;
		},
		assist: function() {
			queryString = 'SELECT *, false AS is_made, false AS is_three, false AS is_defensive FROM assists WHERE (';
			for (var i = 0; i < names.length-1; i++) {
				queryString += entity + '=$' + parseInt(i+1) + ' OR ';
			}
			queryString += entity + '=$' + parseInt(names.length) + ')';
			return queryString;
		},
		steal: function() {
			queryString = 'SELECT *, false AS is_made, false AS is_three, false AS is_defensive FROM steals WHERE (';
			for (var i = 0; i < names.length-1; i++) {
				queryString += entity + '=$' + parseInt(i+1) + ' OR ';
			}
			queryString += entity + '=$' + parseInt(names.length) + ')';
			return queryString;
		},
		block: function() {
			queryString = 'SELECT type, gid, pname, team, quarter, time_remaining, false AS is_made, false AS is_three, false AS is_defensive FROM blocks WHERE (';
			for (var i = 0; i < names.length-1; i++) {
				queryString += entity + '=$' + parseInt(i+1) + ' OR ';
			}
			queryString += entity + '=$' + parseInt(names.length) + ')';
			return queryString;
		}
	};
	var query = "";
	for (var j = 0; j < events.length-1; j++) {
		query += queryWriter[events[j]]() + " UNION ALL "
	}
	query += queryWriter[events[events.length-1]]();
	query += ' ORDER BY ' + entity + ', gid, quarter, time_remaining DESC ';
	return { query: query, values: names };
}