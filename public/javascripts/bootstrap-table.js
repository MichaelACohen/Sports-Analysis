//make columns be name, team, fg%, after 3 makes, diff, after 3 misses, diff

$(document).ready(function() {
	var lastIdx = null;
	var table = $('#rankingsTable').dataTable(
		{
			"columns": [
				{},
				{},
				{},
				{"orderable": false},
				{},
				{"orderable": false},
				{}
			]
		}
	);
});