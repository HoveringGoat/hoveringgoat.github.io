function setCookie(cname,cvalue,exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = ";expires=" + d;
    document.cookie = cname + "=" + cvalue + expires +";path=/";
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

//function request() {
//    var request = new XMLHttpRequest()

//    var url = 'https://www.aavso.org/vsx/index.php?view=api.delim&ident=Betelgeuse&fromjd=2458124&tojd=2458125&delimiter=@@@'

//    request.open('GET', url, true)
//    request.onload = function() {
//        // Begin accessing JSON data here
//        var data = this.response

//        if (request.status >= 200 && request.status < 400) {
//            console.log("request success")
//            return data
//        } else {
//            console.log('error')
//            return null
//        }
//    }

//    request.send()
//}


// todo after we load a cookie or create a new one we need to parse it into actual useable data.
// maybe store data in a json blob?
// once we have the data usable we need to come up with some graph functionality and display the data!

function testCookie() {
    var c = GetFromLocalStorage("starData");
    var lastData;
    var newDate = GetJulianDate();
    var lastDate = newDate - 365; 
    if ((typeof c !== "undefined") && (c != null) && (c != "")) {
        console.log('data retrieved!');
        c = JSON.parse(c);
        if ((typeof c !== "undefined") || (c.length == 2)) {
            console.log('data parsed!');
            lastDate = c[0];
            lastData = c[1];
            if (newDate < lastDate + (1 / 24)) {
                console.log("Data up to date no need to update.");
                return;
            }
        }
    }

    let promise = new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        var url = GenerateUrl(lastDate, newDate);

        request.open('GET', url, true);
        request.onload = function () {
            if (request.status >= 200 && request.status < 400) {
                resolve(this.response);
            } else {
                reject(Error("Network Error"));
            }
        }
        request.onerror - function () {
            reject(Error("Network Error"));
        }
        request.send();
        });

        promise.then(function (data) {
            // should parse to json (merge) then save cookie.
            console.log("request successful");
            var parsedData = ParseStarData(data);
            var mergedData = MergeData(parsedData, lastData);
            CreateStarDataCookie("starData", mergedData, newDate);
        });

        promise.catch(function () {
            console.log("Error on sending request");
            return null;
        });
}

function ParseStarData(c) {
    var delimiter = "@@@";
    var lines = c.split('\n');

    var starData = [];
    var headers = lines[0].split(delimiter);

        for(var i = 1; i < lines.length; i++) {
            var words = lines[i].split(delimiter);
            var observation = {};
            for (var j = 0; j < words.length; j++) {
                observation[headers[j]] = words[j];
            }
            starData.push(observation);
    }

    return starData;
}

function CreateStarDataCookie(name, data, newDate) {
    var c = [newDate, data];
    c = JSON.stringify(c);
    SaveToLocalStorage(name, c);
}
function SaveToLocalStorage(name, data) {
    console.log("saving to local storage");
    window.localStorage.setItem(name, data);
}

function GetFromLocalStorage(name) {
    var obj = window.localStorage.getItem(name);
    return obj;
}

function GetJulianDate() {
    var d = new Date();
    d.setTime(d.getTime())
    var jd = (d.getTime() / (1000 * 60 * 60 * 24)) + 2440587.5;
    return jd
}

function GenerateUrl(date) {
    var newDate = GetJulianDate();
    var url = `https://www.aavso.org/vsx/index.php?view=api.delim&ident=Betelgeuse&fromjd=${date}&tojd=${newDate}&delimiter=@@@`;
    return url;
}

function MergeData(newData, oldData) {
    if ((typeof oldData === "undefined") || (oldData.length == 0)) {
        return newData;
    }
    var index = 0;
    var lastData = oldData[oldData.length - 1];

    for (var i = newData.length - 1; i >= 0; i--) {
        if (newData[i] == lastData) {
            index = j+1;
        }
    }

    if (index < newData.length) {
        for (var i = index; i < newData.length; i++) {
            oldData.push(newData);
        }
    }

    return oldData;
}

function ChartTest{
    var ctx = document.getElementById('canvas').getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [{
                label: 'My First dataset',
                backgroundColor: 'rgb(255, 99, 132)',
                borderColor: 'rgb(255, 99, 132)',
                data: [0, 10, 5, 2, 20, 30, 45]
            }]
        },

        // Configuration options go here
        options: {}
    });
}

ChartTest();
