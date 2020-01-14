var scatterChart;
function LoadChart(starData) {
    var ctx = document.getElementById('chart').getContext('2d');
    scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Avgerage Luminosity',
                data: null,
                pointBackgroundColor: 'rgba(10, 50, 100, 0.4)',
                pointBorderColor: 'rgba(10, 50, 100, 0.5)',
                backgroundColor: 'rgba(10, 50, 100, 0.5)',
            }, {
                    label: 'Luminosity Observations',
                    data: null,
                    pointBackgroundColor: 'rgba(100, 100, 100, 0.1)',
                    pointBorderColor: 'rgba(100, 100, 100, 0.1)',
                    backgroundColor: 'rgba(100, 100, 100, 0.1)',
                }, ]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'month'
                    }
                }],
                yAxes: [{
                    ticks: {
                        reverse: true,
                        min: -.5,
                        max: 2.75,
                    }
                }]
            }
        }
    });

    return scatterChart;
}


function UpdateChartData(starData) {
    if (typeof scatterChart === "undefined") {
        console.log("error retriving chart");
        return;
    }

    starData = CleanData(starData);
    scatterChart.data.datasets[0].data = starData[0];
    scatterChart.data.datasets[1].data = starData[1];
    scatterChart.update();
}

function LoadingChart() {
    var ctx = document.getElementById('chart').getContext('2d');
    ctx.font = '48px serif';
    ctx.fillText('Loading Data', 10, 50);
}

function CleanData(data) {
    var newData = [];
    var avgData = [];
    var movingAvg = {};
    movingAvg.weight = 1.0;
    movingAvg.value = 0.0;
    movingAvg.time = 0;
    movingAvg.update = 1.0;
    var startDate = new Date();
    var dateValue = GetValueString("chartStartDate");
    startDate = ParseDate(dateValue);

    data.forEach(function (i) {
        if ((typeof i.band !== "undefined") && ((i.band.indexOf("vis") >= 0) || (i.band == "v"))) {
            if (ConvertToUTC(i.jd) >= startDate) {
                if (Math.abs(parseFloat(i.mag) - (movingAvg.value / movingAvg.weight)) > 2) {
                    console.log("throwing out value: " + i.mag);
                }
                else {
                    var o = {};
                    o.x = ConvertToUTC(i.jd);
                    o.y = i.mag;
                    newData.push(o);

                    if (i.jd < movingAvg.time + movingAvg.update) {
                        movingAvg.value += parseFloat(i.mag);
                        movingAvg.weight++;
                    }
                    else {
                        if (movingAvg.time != 0) {
                            var avg = {};
                            avg.x = ConvertToUTC(movingAvg.time + (.5 * movingAvg.update));
                            avg.y = movingAvg.value / movingAvg.weight;
                            avgData.push(avg);

                            if (movingAvg.weight > 1) {
                                var days = parseFloat(i.jd) - movingAvg.time;
                                var reduceWeight = .5;
                                movingAvg.value *= reduceWeight
                                movingAvg.weight *= reduceWeight
                            }
                        }

                        movingAvg.time = parseFloat(i.jd);
                        movingAvg.value += parseFloat(i.mag);
                        movingAvg.weight++;
                    }
                }
            }
        }
    });

    // create last avg data point
    var avg = {};
    avg.x = ConvertToUTC(movingAvg.time + (.5 * movingAvg.update));
    avg.y = movingAvg.value / movingAvg.weight;
    avgData.push(avg);

    if ((startDate == 0 || (ConvertToUTC(data[0].jd) > startDate))) {
        SetValue("chartStartDate", GetFormattedDate(newData[0].x));
    }

    return [avgData, newData];
}