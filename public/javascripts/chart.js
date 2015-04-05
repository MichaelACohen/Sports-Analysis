var makeChart = function(data) {
	var graphData = [];
	for (var key in data) {
		graphData[key] = {'name': data[key]['name'], 'data': data[key]['data'].map(function(ele) {
			var diff = ((ele.percent - data[key]['data'][3].percent)*100).toFixed(1);
			return { diff: diff, makes: ele.makes, misses: ele.misses, total: ele.total, percent: (ele.percent*100).toFixed(1), name: data[key]['name'], y: (ele.percent - data[key]['data'][3].percent)*100, marker: { radius: Math.pow(ele.total, 1/3) }}
		})};
	}
	$(function() {
	    $('#container').highcharts({
	    	title: {
	    		text: 'Change in FG% Given Momentum',
	    		x: -20
	    	},
	    	xAxis: {
	    		categories: ['3+ Negative Events', '2 Negative Events', '1 Negative Event', 'All shots', '1 Positive Event', '2 Positive Events', '3+ Positive Events']
	    	},
	    	yAxis: {
	    		title: {
	    			text: 'Difference in FG%',
	    		},
	    		plotLines: [{
	    			value: 0,
	    			width: 1,
	    			color: '#808080'
	    		}]
	    	},
	    	legend: {
	    		layout: 'vertical',
	    		align: 'right',
	    		verticalAlign: 'middle',
	    		borderWidth: 0
	    	},
	    	series: graphData,
	    	tooltip: {
	            shared: false,
	            useHTML: true,
	            headerFormat: '',
	            pointFormat: '<small>Difference in FG%: {point.diff}</small><table align="center"><tr><td colspan=2 style="color: {point.color};text-align: center">{point.name}</td></tr>' +
	                '<tr><td style="text-align: center"><b>{point.makes}-{point.total}, </b></td><td style="text-align: center"><b> {point.percent}%</b></td></tr>',
	            footerFormat: '</table>',
            	valueDecimals: 2
        	}
	    });
	});
}