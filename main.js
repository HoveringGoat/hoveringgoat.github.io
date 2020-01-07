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

//    // todo pull cookie if exists only query if cookie is older than 1 hr
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

function testCookie(){
    var c = getCookie("spaceData");
    if (c != "") {
        console.log('data retrieved!\n'+c)
    } else {
        let promise = new promise(function (resolve, reject) {
            var request = new XMLHttpRequest()
            // todo pull cookie if exists only query if cookie is older than 1 hr
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
            setCookie("spaceData", data, 30)
            console.log("Success!!\n"+data)
        })
        promise.catch(function (data) {
            console.log("Error on sending request")
        })
        
    }
}
