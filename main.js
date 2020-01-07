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

function checkCookie() {
  var user=getCookie("username");
  if (user != "") {
    alert("Welcome again " + user);
  } else {
     user = prompt("Please enter your name:","");
     if (user != "" && user != null) {
       setCookie("username", user, 30);
     }
  }
}

function getRequest() {
    var request = new XMLHttpRequest()

    // todo pull cookie if exists only query if cookie is older than 1 hr
    var url = 'https://www.aavso.org/vsx/index.php?view=api.delim&ident=Betelgeuse&fromjd=2458124&tojd=2458125&delimiter=@@@'

    request.open('GET', url, true)
    request.onload = function() {
        // Begin accessing JSON data here
        var data = this.response

        if (request.status >= 200 && request.status < 400) {
            console.log(data)
            return data
            // TODO store cookie
        } else {
            console.log('error')
        }
    }

    request.send()
}

//checkCookie();
setCookie("test", "test", 7);
