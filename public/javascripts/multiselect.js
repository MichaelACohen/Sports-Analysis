var setUp = function(isPlayers, names, posEvents, negEvents) {
	$(function() {
		var namesData = isPlayers ? setPlayers(names) : setTeams(names);
		var posEventsData = setPosEvents(posEvents);
		var negEventsData = setNegEvents(negEvents);

		var names_ms = $('#names');
		names_ms.multiselect({
			enableFiltering: true,
			maxHeight: 400,
			maxWidth: 200,
			buttonClass: "btn btn-primary"
		});
		names_ms.multiselect('dataprovider', namesData);
		
		var pe_ms = $('#posEvents');
		pe_ms.multiselect({
			enableFiltering: true,
			buttonClass: "btn btn-success"
		});
		pe_ms.multiselect('dataprovider', posEventsData);
		
		var ne_ms = $('#negEvents');
		ne_ms.multiselect({
			enableFiltering: true,
			buttonClass: "btn btn-danger"
		});
		ne_ms.multiselect('dataprovider', negEventsData);

		$('#multiselectForm').submit(function() {
			var namesLength = $('#names option:selected').length;
			var posEventsLength = $('#posEvents option:selected').length;
			var negEventsLength = $('#negEvents option:selected').length;
			//or just add html error msg


			if (namesLength < 1 || namesLength > 6) {
				//names multiselect is invalid
				errorMsg = " Please choose between 1 and 6 players/teams to analyze";
				$('#errorMsg').text(errorMsg);
				$('#alert').removeClass('hidden');
				return false;
			} else if (posEventsLength < 1) {
				//posEvents multiselect is invalid
				errorMsg = " Please choose at least 1 positive event";
				$('#errorMsg').text(errorMsg);
				$('#alert').removeClass('hidden');
				return false;
			} else if (negEventsLength < 1) {
				//negEvents multiselect is invalid
				errorMsg = " Please choose at least 1 negative event";
				$('#errorMsg').text(errorMsg);
				$('#alert').removeClass('hidden');
				return false;
			}
		});
	})
}

var setTeams = function(teams) {
	var label = 'Teams';
	var children = [];
	for (var i = 0; i < teams.length; i++) {
		children[i] = { label: teams[i].name, value: teams[i].name };
	}
	return [{ label: label, children: children }];
}

var setPlayers = function(players) {
	var optgroups = [];
	var i = 0, j = 0, k = 0;
	while (i < players.length) {
		var curTeam = players[i].team;
		var child = {};
		child['label'] = curTeam;
		child['children'] = [];
		while (i < players.length && players[i].team == curTeam) {
			child['children'][j] = { label: players[i].full_name, value: players[i].short_name };
			i++;
			j++;
		}
		j=0;
		optgroups[k] = child;
		k++;
	}
	return optgroups;
}

var setPosEvents = function(posEvents) {
	var children = [];
	for (var i = 0; i < posEvents.length; i++) {
		console.log(posEvents[i]['event']);
		children[i] = { label: posEvents[i]['event'], value: posEvents[i]['event'] };
	}
	return [{ label: 'Positive Events', children: children }];
}

var setNegEvents = function(negEvents) {
	var children = [];
	for (var i = 0; i < negEvents.length; i++) {
		children[i] = { label: negEvents[i]['event'], value: negEvents[i]['event'] };
	}
	return [{ label: 'Negative Events', children: children }];
}