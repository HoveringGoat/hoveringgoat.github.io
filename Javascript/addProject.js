function OnLoad() {
    if(navigator.userAgent.toLowerCase().indexOf("iphone") > -1){
		//window.location.href = 'https://itunes.apple.com/my/app/flipbizz/idexampleapp';
		window.location.href = 'https://play.google.com/store/apps/details?id=com.goat.project_pics';
		}

    if(navigator.userAgent.toLowerCase().indexOf("android") > -1){
		window.location.href = 'https://play.google.com/store/apps/details?id=com.goat.project_pics';
		}

    //Update #2
    if (!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
		// we should flesh out the page a bit
		// for now also redirect to the app page
		window.location.href = 'https://play.google.com/store/apps/details?id=com.goat.project_pics';
    }
}
