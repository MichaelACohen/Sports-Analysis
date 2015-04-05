var request = require('request');
var cheerio = require('cheerio');
var async   = require('async');
var moment  = require('moment');

var db      = require('../database/db.js');
var parser  = require('../scraping/parser.js');
var events  = require('../scraping/events.js');

var BASE_URL = 'http://www.basketball-reference.com';

//for 2013-14 but could generalize this for every season
var scrapeSeason = function() {
	var startSeason = moment('2013-10-29');
	var endSeason   = moment('2014-04-17');

	var test = moment('2014-01-15');
	var otherTest = moment('2013-10-31');

	var dates = [];
	for (var date = test; test.isBefore(endSeason); date.add(1, 'days')) {
		var month = date.format('MM');
		var day   = date.format('DD');
		var year  = date.format('YYYY');
		dates.push({'month': month, 'day': day, 'year': year});
	}
	getPBPs(dates);
}

//takes array of dates (obj with keys: month, day, year)
var getPBPs = function(dates) {
	async.map(dates, function(date, callback) {
		var month = date.month;
		var day   = date.day;
		var year  = date.year;
		var boxScoreURL = BASE_URL + '/boxscores/index.cgi?month=' +
						month + '&day=' + day + '&year=' + year;
		request(boxScoreURL, function(err, res, body) {
			if (err) throw err;
			$ = cheerio.load(body);
			var eles = $('a');
			var pbps = []
			for (var i = 0; i < eles.length; i++) {
				var link = eles[i].attribs['href'];
				var isPBP = function(link) { return link.match('/pbp/'); }
				if (isPBP(link)) { pbps.push(BASE_URL + link); }
			}
			callback(null, pbps);
		});
	}, function(err, pbps) {
		if (err) console.log("fail");
		else {
			//merge into single array
			pbps = [].concat.apply([], pbps);
			storeHTML(pbps);
		}
	});
}

//array of pbp links
var storeHTML = function(pbps) {
	async.eachLimit(pbps, 6, function(link, callback) {
		async.waterfall([
			function(cb) {
				request(link, function(err, res, body) {
					if (err) throw err;
					$ = cheerio.load(body);
					var html = $.html();
					cb(null, html);
				});
			},
			function(html, cb) {
				//insert html into database
				var queryString = 'INSERT INTO raw_html (url, html) VALUES ($1, $2)';
				var values = [link, html];
				var dbCB = function(err, results) {
					if (err) console.log(err);
					done();
					console.log('inserting html for page: ' + link);
					cb(null);
				};
				db.query(queryString, values, dbCB);
			}
		], function(err) {
			callback();
		});
	}, function(err) {
		if (err) console.log("Failed to put a game in database");
		else {
			console.log("PBPs successfully inserted into database");
		}
	});
}

var getHTML = function() {
	//eventually make this get all games
	var queryString = 'SELECT * FROM raw_html';
	var values = [];
	var cb = function(err, results) {
		if (err) console.log(err);
		async.eachSeries(results.rows, function(row, callback) {
			handleGame(row.url, row.html, callback);
		}, function(err) {
			if (err) console.log(err);
			console.log("finished with games");
		});
	}
	db.query(queryString, values, cb);
}

var formatDate = function(url) {
	var dateRegex = /pbp.(\d{8}).*/;
	var date = dateRegex.exec(url)[1];
	var dash = "-";
	var indices = [3, 5];
	var date = date.replace(/./g, function(v, i) {
    	return (i === indices[0]) || (i === indices[1]) ? v + dash : v;
	});
	return date;
}

var handleGame = function(url, html, callback) {
	$ = cheerio.load(html);

	var eles = $('span[class="bold_text large_text"]');
	var awayTeam = eles[0].children[0].children[0].data;
	var homeTeam = eles[1].children[0].children[0].data;
	var date = formatDate(url);

	var queryString = 'SELECT * FROM games WHERE (home_team=$1 AND away_team=$2 AND game_day=$3)';
	var values = [homeTeam, awayTeam, date];

	var cb = function(err, result) {
		if (err) console.log(err);

		var gid = result.rows[0].gid;
		
		var evts = $('td[class="align_right"]');
		var eventArr = [];
		for (var i = 0; i < evts.length; i++) {
			var evt_info = handleEvt(evts[i]);
			if (evt_info && evt_info['event']) {
				var arr = parser(evt_info['event']);
				if (arr) {
					evt_info['event'] = arr;
					eventArr.push(evt_info);
					var type = arr[0];
					if (type == 'shot') {
						if (arr[arr.length-2]) {
							var otherPlay = arr[arr.length-2];
							var otherPlayer = arr[arr.length-1];
							var otherArr = [otherPlay, otherPlayer];
							var other_evt_info = JSON.parse(JSON.stringify(evt_info));
							other_evt_info['event'] = otherArr;
							eventArr.push(other_evt_info);
						}
					} else if (type == 'turnover') {
						if (arr[arr.length-1]) {
							var otherPlay = 'steal';
							var otherPlayer = arr[arr.length-1];
							var otherArr = [otherPlay, otherPlayer];
							var other_evt_info = JSON.parse(JSON.stringify(evt_info));
							other_evt_info['event'] = otherArr;
							eventArr.push(other_evt_info);
						}
					}
				}
			}
		}
		var quarter = 1;
		async.each(eventArr, function(evt, eventCB) {
			var time = evt['time'];
			var colonIndex = time.indexOf(":");
			var minsRemaining = parseInt(time.substring(0, colonIndex));
			var secsRemaining = parseInt(time.substring(colonIndex+1, colonIndex+3));
			var timeRemaining = minsRemaining*60 + secsRemaining;
			
			var team = evt['homeTeam'] ? homeTeam : awayTeam;

			var type = evt['event'][0];
			if (type == 'block' || type == 'steal' || type == 'shootingFoul') {
				team = team == homeTeam ? awayTeam : homeTeam;
			}

			if (type == 'quarter') {
				quarter = evt['event'][1];
				eventCB(null);
			} else {
				events[type](evt['event'], gid, team, quarter, timeRemaining, eventCB);
			}
		}, function(err) {
			if (err) console.log(err);
			callback(err);
		});
	}
	db.query(queryString, values, cb);
}

var handleEvt = function(evt) {
	var children = evt.children
	if (children) {
		var time = children[0].data;
	}
	var next = evt.next;
	if (next && next.next) {
		next = next.next;
		var info = {'time': time, 'event': getData(next)};

		//hack to determine what team did the stat
		info['homeTeam'] = false;
		if (info['event'].indexOf('hometeam') != -1) {
			info['homeTeam'] = true;
			info['event'] = info['event'].replace('hometeam', "");
		}

		return info;
	}
	return null;
}

var getData = function(element) {
	var evt = "";
	for (var i = 0; i < element.children.length; i++) {
		if (element.children[i].data) {
			if (/^\s+$/.test(element.children[i].data)) {
				//have to skip over 4 more elements if data is on right side of pbp
				var ele = element.next.next.next.next;
				evt += getData(ele) + "hometeam";
			} else {
				//description of play
				evt += element.children[i].data;
			}
		} else if (element.children[i].name == 'a') {
			//name of player
			evt += element.children[i].children[0].data;
		}
	}
	return evt;
}

module.exports = getHTML;