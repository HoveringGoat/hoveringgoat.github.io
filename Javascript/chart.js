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

function ConvertToUTC(jd) {
    var time = jd - 2440587.5;
    time *= 1000 * 60 * 60 * 24
    var d = new Date();
    d.setTime(time);
    return d;
}

function GetFormattedDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');

    var dateString = month + '/' + day + '/' + year;
    return dateString
}

function ParseDate(date) {
    var parsedDate = new Date();

    if ((date !== "undefined") && (date.length >= 0)) {
        var dates = date.split(/\.|-|\//);

        if ((dates !== "undefined") && (dates.length == 3)) {
            parsedDate.setUTCFullYear(dates[2]);
            parsedDate.setMonth(dates[0] - 1);
            parsedDate.setDate(dates[1]);
            return parsedDate;
        }
    }
    return parsedDate.setTime(0);
}