var request = new XMLHttpRequest()

// todo pull cookie if exists only query if cookie is older than 1 hr
var url = 'https://www.aavso.org/vsx/index.php?view=api.delim&ident=Betelgeuse&fromjd=2458124&tojd=2458125&delimiter=@@@'

request.open('GET', url, true)
request.onload = function() {
  // Begin accessing JSON data here
  var data = this.response

  if (request.status >= 200 && request.status < 400) {
  	console.log(data)
  	// TODO store cookie
  } else {
    console.log('error')
  }
}

request.send()
