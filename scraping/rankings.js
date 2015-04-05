var request = require('request')
var cheerio = require('cheerio')
var async   = require('async')

var db      = require('../database/db.js')

var URL     = "http://www.basketball-reference.com/leagues/NBA_2014_per_game.html";

module.exports.getPPGRankings = function() {
	request(URL, function(err, res, body) {
		if (err) console.log(err);
		$ = cheerio.load(body);
		var rows = $('#per_game tr td:nth-child(2)');
		var obj = [];
		for (var i = 1; i < rows.length; i++) {
			var name = rows[i].children[0].children[0].data;
			obj[i-1] = {name: name};
		}
		var rows = $('#per_game tr td:nth-child(29)');
		for (var i = 1; i < rows.length; i++) {
			var ppg = rows[i].children[0].data;
			obj[i-1].ppg = ppg;
		}
		for (var i = 0 ; i < obj.length; i++) {
			var name = obj[i].name;
			for (var j = 0; j < obj.length; j++) {
				if (i!=j && obj[j].name == name) {
					obj.splice(j,1);
				}
			}
		}
		async.each(obj, function(player, callback) {
			queryString = "INSERT INTO ppg (pid, ppg) VALUES ((SELECT pid FROM players WHERE players.full_name=$1), $2)";
			var values = [player.name, parseFloat(player.ppg)];
			var cb = function(err, result) {
				if (err) console.log(err);
				callback(err);
			};
			db.query(queryString, values, cb);
		}, function(err) {
			if (err) console.log(err);
			console.log("done");
		})
	});
}