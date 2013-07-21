function Track(trackList, title, files) {
	var createLayout = function(trackList, title, files) {
		var track = $("<li></li>")
					.attr("id", trackList.children("li").length);
		
		var trackTitle = $("<a href=\"\"></a>")
						 .text(title)
						 .appendTo(track);
						 
		var tracksDiv = $("<div></div>")
						.appendTo(track);
		
		track.appendTo(trackList);
		return track;
		
	}
	
	this.trackElement = createLayout(trackList, title, files);
	this.title = title;
	
	this.files = new Array();
	for(var k=0; k<files.length; k++) {
		this.files[k] = new File(this, files[k]);
	}
	
	this.first = function() {
		var first;
		for(var k in this.files) {
			var file = this.files[k];
			if(Util.isFileSupported(file.uri)) {
				first = file;
				break;
			}
		}
		return first;
	}
}