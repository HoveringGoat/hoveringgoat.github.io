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

function OnLoad() {
    LoadChart();
    UpdateChart();
}

function RefreshChart() {
    var data = GetFromLocalStorage("starData")
    data = JSON.parse(data);
    UpdateChartData(data[1]);
}

function UpdateChart() {
    UpdateData().then(function (data) {
        if ((typeof data !== "undefined") && (data != null)) {
            UpdateChartData(data);
        }
        else {
            console.log("loading failed");
        }
    });
}

function UpdateData() {
    var c = GetFromLocalStorage("starData");
    var lastData;
    var newDate = GetJulianDate();
    var lastDate = 2458119.5; 
    var updateTimeInterval = 4*0;

    if ((typeof c !== "undefined") && (c != null) && (c != "")) {
        console.log('local data retrieved!');
        c = JSON.parse(c);
        if ((typeof c !== "undefined") || (c.length == 2)) {
            console.log('data parsed!');
            if (c[1][0].jd < lastDate + 7) {
                lastDate = c[0];
                lastData = c[1];
                if (newDate < lastDate + (updateTimeInterval / 24)) {
                    console.log("data up to date no need to update.");
                    return new Promise(function (resolve) {
                        resolve(c[1]);
                    });
                }
            }
            UpdateChartData(c[1]);
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

    return promise.then(function (data) {
        console.log("request successful");
        var parsedData = ParseStarData(data.toLowerCase());
        var mergedData = MergeData(parsedData, lastData);
        CreateStarDataCookie("starData", mergedData, newDate);
        return mergedData;
    });

    return promise.catch(function () {
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

function ConvertToJulianDate(d) {
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

function WatchMe() {
    var input = document.getElementsByClassName("chartStartDate")[0];
    if (!input.hasAttribute("pendingEnterEvent")) {
        input.setAttribute("pendingEnterEvent", true);
        input.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                RefreshChart();
            }
        });
    }
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
