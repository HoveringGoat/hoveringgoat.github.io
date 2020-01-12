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

function testCookie(){
    var c = getCookie("spaceData");
    if (c != "") {
        // TODO compare cookie to date and if its older than 1 hr we should get new request (from the last time slice)
        // and merge the two.Save the result as a new cookie
        console.log('data retrieved!\n' + c)
        // already parsed no need
        // ParseStarData(); 
    } else {
        let promise = new Promise(function (resolve, reject) {
            var request = new XMLHttpRequest()
            // TODO need to break url into components and a method to convert date to julian date (unless its built in)
            var url = 'https://www.aavso.org/vsx/index.php?view=api.delim&ident=Betelgeuse&fromjd=2458124&tojd=2458125&delimiter=@@@'

            request.open('GET', url, true)
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    resolve(this.response)
                } else {
                    reject(Error("Network Error"))
                }
            }
            request.onerror - function () {
                reject(Error("Network Error"))
            }

            request.send()
        })

        promise.then(function (data) {
            // should parse to json (merge) then save cookie.

            setCookie("spaceData", data, 30)
            console.log("Success!!\n" + data)
            ParseStarData();
        })
        promise.catch(function (data) {
            console.log("Error on sending request")
        })
        
    }
}

function ParseStarData() {
    console.log("ParseStarData:");
    var c = getCookie("spaceData");
    //var delimiter = "@@@";
    var lines = c.split('\n');

    lines.forEach(function (line) {
        console.log(line);
    });


}
