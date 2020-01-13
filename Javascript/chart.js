function LoadChart(starData) {
    var ctx = document.getElementById('chart').getContext('2d');
    starData = CleanData(starData);
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Alpha Ori Luminosity ',
                data: starData
            }]
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
}

function LoadingChart() {
    var ctx = document.getElementById('chart').getContext('2d');
    ctx.font = '48px serif';
    ctx.fillText('Loading Data', 10, 50);
}

function CleanData(data) {
    var newData = [];
    var startDate = new Date();
    var dateValue = GetValueString("chartStartDate");
    startDate = ParseDate(dateValue);
    data.forEach(function (i) {
        if ((typeof i.band !== "undefined") && ((i.band.indexOf("vis") >= 0) || (i.band == "v"))) {
            if (ConvertToUTC(i.jd) >= startDate) {
                var o = {};
                o.x = ConvertToUTC(i.jd);
                o.y = i.mag;
                o.r = i.by;
                newData.push(o);
            }
        }
    });

    if (startDate == 0) {
        SetValue("chartStartDate", GetFormattedDate(newData[0].x));
    }

    return newData;
}