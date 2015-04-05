var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');
var moment  = require('moment');

var db      = require('../database/db.js');
var parser  = require('../scraping/parser.js');
var events  = require('../scraping/events.js');

var BASE_URL = "http://www.basketball-reference.com";

var getTeams = function() {
	request(BASE_URL + '/teams/', function(err, res, body) {
		if (err) throw err;
		$ = cheerio.load(body);
		var eles = $('table#active tbody tr td:first-child');
		async.each(eles, function(ele, callback) {
			if (ele.children[0].name == 'a') {
				var teamName = ele.children[0].children[0].data;
				var queryString = 'INSERT INTO teams (name) VALUES ($1)';
				var values = [teamName];
				var cb = function(err, result) {
					if (err) console.log(err);
					callback(err);
				}
				db.query(queryString, values, cb);
			} else {
				callback(null);
			}
		}, function(err) {
			if (err) console.log(err);
			console.log("finished with teams");
		});
	});
}

var getPlayers = function() {
	request(BASE_URL + '/teams/', function(err, res, body) {
		if (err) throw err;
		$ = cheerio.load(body);
		var eles = $('table#active tbody tr td:first-child');
		async.eachSeries(eles, function(ele, callback) {
			if (ele.children[0].name == 'a') {
				var teamName = ele.children[0].children[0].data;
				var rosterLink = ele.children[0].attribs['href'];

				if (teamName == 'Brooklyn Nets') {
					rosterLink = '/teams/BRK/';
				} else if (teamName == 'New Orleans Pelicans') {
					rosterLink = '/teams/NOP/';
				}
				request(BASE_URL + rosterLink + '2014.html', function(err, res, body) {
					if (err) throw err;
					$ = cheerio.load(body);
					var playerEles = $('table#roster tbody tr td:first-child').next().children();
					async.each(playerEles, function(playerEle, playerCB) {
						var playerName = playerEle.children[0].data;
						var formatName = function(name) {
							var names = name.split(' ');
							var first = names[0].substring(0, 1) + '.';
							var last = "";
							for (var i = 1; i < names.length-1; i++) {
								last += names[i] + " ";
							}
							last += names[names.length-1];
							return first + ' ' + last;
						}
						var shortPlayerName = formatName(playerName);
						//enter into db: playerName, shortPlayerName, teamName
						console.log(playerName, shortPlayerName, teamName);
						var queryString = 'INSERT INTO players (full_name, short_name, team) VALUES ($1, $2, $3)';
						var values = [playerName, shortPlayerName, teamName];
						var cb = function(err, result) {
							if (err) console.log(err);
							playerCB(err);
						}
						db.query(queryString, values, cb);
					}, function(err) {
						if (err) console.log(err);
						console.log("done processing players of: " + rosterLink);
						callback(err);
					});
				});
			} else {
				callback(null);
			}
		}, function(err) {
			if (err) console.log(err);
			console.log("finished with rosters");
		});
	});
}

module.exports = getTeams;