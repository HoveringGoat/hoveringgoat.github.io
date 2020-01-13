function LoadChart(starData) {
    console.log("loading chart...");
    starData = CleanData(starData);
    var ctx = document.getElementById('chart').getContext('2d');
    var scatterChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Scatter Dataset',
                data: starData
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
}

function CleanData(data) {
    var newData = [];
    data.forEach(function (i) {
        if ((typeof i.band !== "undefined") && ((i.band.indexOf("vis") >= 0) || (i.band == "v"))) {
            var o = {};
            o.x = ConvertToUTC(i.jd);
            o.y = i.mag;
            o.r = i.by;
            newData.push(o);
        }
    });

    return newData;
}

function ConvertToUTC(jd) {
    var time = jd - 2440587.5;
    time *= 1000 * 60 * 60 * 24
    var d = new Date();
    d.setTime(time)
    return d;
}