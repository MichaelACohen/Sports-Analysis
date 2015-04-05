var express = require('express');
var router = express.Router();

var scraper = require('../scraping/basketball.js')
var parser  = require('../scraping/parser.js')
var query   = require('../queries/queries.js')
var basic   = require('../analysis/basic.js')
var analyze = require('../analysis/analyze.js')
var rosters = require('../queries/rosters.js')
var db      = require('../database/db.js')
var filter  = require('../analysis/filterDB.js')
var ranking = require('../analysis/rankings.js')

var tester  = require('../scraping/rosters.js')
var popEvts = require('../scraping/populateEvents.js')
var ppgRank = require('../scraping/rankings.js')

/* GET home page. */
router.get('/', function(req, res) {

});

router.get('/rankings/players', function(req, res) {
	var cb = function(err, result) {
		if (err) console.log(err);
		res.render('rankings', { data: result.rows });
	}
	ranking.getRankings(cb);
});

router.get('/rankings/teams', function(req, res) {
	var cb = function(err, result) {
		if (err) console.log(err);
		res.render('teamRankings', { data: result.rows });
	}
	ranking.getTeamRankings(cb);
})

router.get('/teams', function(req, res) {
	var cb = function(err, results) {
		if (err) console.log(err);
		var teams = results[0].rows;
		var posEvents = results[1].rows;
		var negEvents = results[2].rows;

		res.render('form', { isPlayers: false, names: teams, posEvents: posEvents, negEvents: negEvents })
	}
	rosters.teams(cb);
});

router.get('/players', function(req, res) {
	var cb = function(err, results) {
		if (err) console.log(err);
		var players = results[0].rows;
		var posEvents = results[1].rows;
		var negEvents = results[2].rows;

		res.render('form', { isPlayers: true, names: players, posEvents: posEvents, negEvents: negEvents })
	}
	rosters.players(cb);
});

router.get('/correlation', function(req, res) {
	ranking.graphs(req, res);
});

router.post('/analyze', function(req, res) {
	if (req.body.isPlayers == 'false') var isPlayers = false;
	else var isPlayers = true;

	var toArr = function(ele) {
		if (typeof ele === 'string') return [ele];
		else return ele;
	}

	var names = toArr(req.body.names);
	var posEvents = toArr(req.body.posEvents);
	var negEvents = toArr(req.body.negEvents);

	var queryInfo = query.getQuery(isPlayers, names, posEvents, negEvents);
	
	var queryString = queryInfo.query;
	var values = queryInfo.values;

	var cb = function(err, result) {
		if (err) console.log(err);
		//stats is array, each element corresponds to a player/team
		var stats = analyze(result.rows, names, isPlayers, posEvents, negEvents);
		
		for (var i = 0; i < stats.length; i++) {
			console.log(stats[i]);
		}
		
		res.render('basic', { data: stats, title: 'Analysis' });
	}
	db.query(queryString, values, cb);
});

module.exports = router;