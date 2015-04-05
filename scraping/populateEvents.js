var async = require('async')

var db = require('../database/db.js')

var POS_EVENTS = ['made shot', 'made 2pt shot', 'made 3pt shot', 'made ft', 'rebound', 'offensive rebound', 'defensive rebound', 'assist', 'block', 'steal'];
var NEG_EVENTS = ['missed shot', 'missed 2pt shot', 'missed 3pt shot', 'missed ft', 'turnover'];

var insertEvents = function() {
	async.parallel([
		insertPosEvents,
		insertNegEvents
	], function(err, results) {
		if (err) console.log(err);
		console.log("done with events");
	})
}

var insertPosEvents = function(cb) {
	async.each(POS_EVENTS, function(evt, callback) {
		var queryString = 'INSERT INTO positive (event) VALUES ($1)';
		var values = [evt]
		var dbCB = function(err, result) {
			if (err) console.log(err);
			callback(err);
		}
		db.query(queryString, values, dbCB);
	}, function(err) {
		if (err) console.log(err);
		console.log("done with positive events");
		cb(err);
	});
}

var insertNegEvents = function(cb) {
	async.each(NEG_EVENTS, function(evt, callback) {
		var queryString = 'INSERT INTO negative (event) VALUES ($1)';
		var values = [evt]
		var dbCB = function(err, result) {
			if (err) console.log(err);
			callback(err);
		}
		db.query(queryString, values, dbCB);
	}, function(err) {
		if (err) console.log(err);
		console.log("done with negative events");
		cb(err);
	});	
}

module.exports = insertEvents;