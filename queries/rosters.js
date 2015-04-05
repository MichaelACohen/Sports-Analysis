var async = require('async')
var db = require('../database/db.js')

module.exports.players = function(cb) {
	async.parallel([
		getPlayers,
		getPosEvents,
		getNegEvents
	], cb);
}

module.exports.teams = function(cb) {
	async.parallel([
		getTeams,
		getPosEvents,
		getNegEvents
	], cb);
}

//functions below just execute db queries

var getPlayers = function(callback) {
	var queryString = 'SELECT * FROM players ORDER BY team';
	var values = [];
	var cb = callback;
	db.query(queryString, values, cb);
}

var getTeams = function(callback) {
	var queryString = 'SELECT * FROM teams';
	var values = [];
	var cb = callback;
	db.query(queryString, values, cb);	
}

var getPosEvents = function(callback) {
	var queryString = 'SELECT * FROM positive ORDER BY eid';
	var values = [];
	var cb = callback;
	db.query(queryString, values, cb);
}

var getNegEvents = function(callback) {
	var queryString = 'SELECT * FROM negative ORDER BY eid';
	var values = [];
	var cb = callback;
	db.query(queryString, values, cb);
}