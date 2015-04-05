var pg      = require('pg');
var db      = require('../database/db.js');

module.exports = {
	ft: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		var isMade = arr[2] == 'makes';
		
		var queryString = 'INSERT INTO fts (type, gid, pname, team, quarter, time_remaining, is_made) VALUES ($1, $2, $3, $4, $5, $6, $7)';
		var values = ['ft', gid, pname, team, quarter, timeRemaining, isMade];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("ft from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},
	shot: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		var isMade = arr[2] == 'makes';
		var isThree = arr[3] == '3';

		var queryString = 'INSERT INTO shots (type, gid, pname, team, quarter, time_remaining, is_made, is_three) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
		var values = ['shot', gid, pname, team, quarter, timeRemaining, isMade, isThree];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("shot from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},
	rebound: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[2];
		var isDefensive = arr[1] == 'Defensive';

		var queryString = 'INSERT INTO rebounds (type, gid, pname, team, quarter, time_remaining, is_defensive) VALUES ($1, $2, $3, $4, $5, $6, $7)';
		var values = ['rebound', gid, pname, team, quarter, timeRemaining, isDefensive];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("rebound from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},
	turnover: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		
		var queryString = 'INSERT INTO turnovers (type, gid, pname, team, quarter, time_remaining) VALUES ($1, $2, $3, $4, $5, $6)';
		var values = ['turnover', gid, pname, team, quarter, timeRemaining];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("turnover from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},	
	assist: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		
		var queryString = 'INSERT INTO assists (type, gid, pname, team, quarter, time_remaining) VALUES ($1, $2, $3, $4, $5, $6)';
		var values = ['assist', gid, pname, team, quarter, timeRemaining];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("assist from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},
	steal: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		
		var queryString = 'INSERT INTO steals (type, gid, pname, team, quarter, time_remaining) VALUES ($1, $2, $3, $4, $5, $6)';
		var values = ['steal', gid, pname, team, quarter, timeRemaining];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("steal from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},
	block: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		
		var queryString = 'INSERT INTO blocks (type, gid, pname, team, quarter, time_remaining) VALUES ($1, $2, $3, $4, $5, $6)';
		var values = ['block', gid, pname, team, quarter, timeRemaining];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("block from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},
	shootingFoul: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		
		var queryString = 'INSERT INTO fouls (type, gid, pname, team, quarter, time_remaining) VALUES ($1, $2, $3, $4, $5, $6)';
		var values = ['foul', gid, pname, team, quarter, timeRemaining];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("foul from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	},
	foul: function(arr, gid, team, quarter, timeRemaining, callback) {
		var type = arr[0];
		var pname = arr[1];
		
		var queryString = 'INSERT INTO fouls (type, gid, pname, team, quarter, time_remaining) VALUES ($1, $2, $3, $4, $5, $6)';
		var values = ['foul', gid, pname, team, quarter, timeRemaining];
		var cb = function(err, result) {
			if (err) console.log(err);
			console.log("foul from game " + gid);
			callback(err);
		}
		db.query(queryString, values, cb);
	}
}