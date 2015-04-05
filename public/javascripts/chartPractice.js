//regression line r^2 = 1.23*10^-7 (basically 0)
//regression curve r^2 = 0
var makePosChart = function(data) {
	var graphData = [];
	var obj = [];
	for (var i = 0; i < data.length; i++) {
		graphData.push([data[i].ppg, data[i].positive]);
		obj.push({name: data[i].full_name, team: data[i].team, percent: data[i].positivepercent*100, x: data[i].ppg, y: data[i].positive*100});
	}
	var regLine = fitData(graphData);
    var slope = regLine.slope.toFixed(5);

    var r_squared = findRSquared(regLine, graphData);
	
    $(function() {
    	$('#playermakes').highcharts({
        	title: {
        		text: 'Player PPG vs Change FG% After 3 Makes'
        	},
        	subtitle: {
        		text: 'Reg. Line Slope: ' + slope + ', R^2: ' + r_squared
        	},
        	xAxis: {
        		title: {
        			enabled: true,
        			text: 'PPG',
        		},
        		min: 0.0,
        		max: 35.0,
        		startOnTick: true,
        		endOnTick: true,
        		showLastLabel: true
        	},
        	yAxis: {
        		title: {
        			text: 'Change in FG% After 3 Makes',
        		}
        	},
        	legend: {
        		layout: 'vertical',
        		align: 'center',
        		verticalAlign: 'top',
        		x: 100,
        		y: 70,
        		floating: true,
        		backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
        		borderWidth: 1
        	},
        	series: [
        		{
    	    		type: 'line',
    	    		name: 'Regression Line',
    	    		data: regLine.data,
    	    		marker: {
    	    			enabled: false
    	    		},
    	    		states: {
    	    			hover: {
    	    				lineWidth: 0
    	    			}
    	    		},
    	    		enableMouseTracking: false
    	    	}, {
    	    		type: 'scatter',
    	    		name: 'Scatter Plot',
    	    		data: obj,
    	    		marker: {
    	    			radius: 4
    	    		},
    	    		tooltip: {
    	    			headerFormat: '',
    	    			pointFormat: '<b>{point.name} ({point.team})</b><br><span>{point.x} ppg</span><br>{point.percent:.2tf}% FG after 3 consecutive makes, {point.y:.5tf}% change'
    	    		},
                    regression: true,
                    regressionSettings: {
                        type: 'polynomial'
                    }
        		}
        	]
        });
    });
};

//regression line r^2 = 5.89 * 10^-7 (basically 0)
//regression curve r^2 = 0
var makeNegChart = function(data) {
    var graphData = [];
    var obj = [];
    for (var i = 0; i < data.length; i++) {
        graphData.push([data[i].ppg, data[i].negative]);
        obj.push({name: data[i].full_name, team: data[i].team, percent: data[i].negativepercent*100, x: data[i].ppg, y: data[i].negative*100});
    }
    var regLine = fitData(graphData);
    var slope = regLine.slope.toFixed(5);

    var r_squared = findRSquared(regLine, graphData);
    
    $(function() {
        $('#playermisses').highcharts({
            title: {
                text: 'Player PPG vs Change FG% After 3 Misses'
            },
            subtitle: {
                text: 'Reg. Line Slope: ' + slope + ', R^2: ' + r_squared
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'PPG',
                },
                min: 0.0,
                max: 35.0,
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Change in FG% After 3 Misses',
                }
            },
            legend: {
                layout: 'vertical',
                align: 'center',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
                borderWidth: 1
            },
            series: [
                {
                    type: 'line',
                    name: 'Regression Line',
                    data: regLine.data,
                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            lineWidth: 0
                        }
                    },
                    enableMouseTracking: false
                }, {
                    type: 'scatter',
                    name: 'Scatter Plot',
                    data: obj,
                    marker: {
                        radius: 4
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '<b>{point.name} ({point.team})</b><br><span>{point.x} ppg</span><br>{point.percent:.2tf}% FG after 3 consecutive misses, {point.y:.5tf}% change'
                    },
                    regression: true,
                    regressionSettings: {
                        type: 'polynomial'
                    }
                }
            ]
        });
    });
};

//regression line r^2 = 1.36*10^-4 (basically 0)
//regression curve r^2 = .2
var makeTeamPosChart = function(data) {
    var graphData = [];
    var obj = [];
    for (var i = 0; i < data.length; i++) {
        graphData.push([data[i].wins/(data[i].wins + data[i].losses)*100, data[i].positive]);
        obj.push({name: data[i].name, percent: data[i].positivepercent*100, x: data[i].wins/(data[i].wins+data[i].losses)*100, y: data[i].positive*100});
    }
    var regLine = fitData(graphData);
    var slope = regLine.slope.toFixed(5);
    var r_squared = findRSquared(regLine, graphData);

    var regCurve = fitData(graphData, 'exponential');

    $(function() {
        $('#teammakes').highcharts({
            title: {
                text: 'Team Win% vs Change FG% After 3 Makes'
            },
            subtitle: {
                text: 'Reg. Line Slope: ' + slope + ', R^2: ' + r_squared
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Win%',
                },
                min: 0.0,
                max: 100.0,
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Change in FG% After 3 Makes',
                }
            },
            legend: {
                layout: 'vertical',
                align: 'center',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
                borderWidth: 1
            },
            series: [
                {
                    type: 'line',
                    name: 'Regression Line',
                    data: (function() {
                        return regLine.data;
                    })(),
                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            lineWidth: 0
                        }
                    },
                    enableMouseTracking: false
                }, {
                    type: 'scatter',
                    name: 'Scatter Plot',
                    data: obj,
                    marker: {
                        radius: 4
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '<b>{point.name}</b><br><span>{point.x:.2tf} Win%</span><br>{point.percent:.2tf}% FG after 3 consecutive makes, {point.y:.5tf}% change'
                    },
                    regression: true,
                    regressionSettings: {
                        type: 'polynomial'
                    }
                }
            ]
        });
    });
};

//regression line r^2 = 1.79*10^-3 (basically 0)
//regression curve r^2 = .15
var makeTeamNegChart = function(data) {
    var graphData = [];
    var obj = [];
    for (var i = 0; i < data.length; i++) {
        graphData.push([data[i].wins/(data[i].wins + data[i].losses)*100, data[i].negative]);
        obj.push({name: data[i].name, percent: data[i].negativepercent*100, x: data[i].wins/(data[i].wins+data[i].losses)*100, y: data[i].negative*100});
    }
    var regLine = fitData(graphData);
    var slope = regLine.slope.toFixed(5);

    var r_squared = findRSquared(regLine, graphData);

    $(function() {
        $('#teammisses').highcharts({
            title: {
                text: 'Team Win% vs Change FG% After 3 Misses'
            },
            subtitle: {
                text: 'Reg. Line Slope: ' + slope + ', R^2: ' + r_squared
            },
            xAxis: {
                title: {
                    enabled: true,
                    text: 'Win%',
                },
                min: 0.0,
                max: 100.0,
                startOnTick: true,
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Change in FG% After 3 Misses',
                }
            },
            legend: {
                layout: 'vertical',
                align: 'center',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
                borderWidth: 1
            },
            series: [
                {
                    type: 'line',
                    name: 'Regression Line',
                    data: regLine.data,
                    marker: {
                        enabled: false
                    },
                    states: {
                        hover: {
                            lineWidth: 0
                        }
                    },
                    enableMouseTracking: false
                }, {
                    type: 'scatter',
                    name: 'Scatter Plot',
                    data: obj,
                    marker: {
                        radius: 4
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '<b>{point.name}</b><br><span>{point.x:.2tf} Win%</span><br>{point.percent:.2tf}% FG after 3 consecutive misses, {point.y:.5tf}% change'
                    },
                    regression: true,
                    regressionSettings: {
                        type: 'polynomial'
                    }
                }
            ]
        });
    });
};

var findRSquared = function(regLine, data) {
    var sum = 0;
    for (var i = 0; i < data.length; i++) {
        sum += data[i][1];
    }
    var mean = sum/data.length;

    var ss_tot = 0;
    var ss_res = 0;
    for (var i = 0; i < data.length; i++) {
        ss_tot += Math.pow(data[i][1] - mean, 2);
        ss_res += Math.pow(data[i][1] - regLine.y(data[i][0]), 2);
    }
    return Math.pow(1 - ss_res/ss_tot, 2);
}