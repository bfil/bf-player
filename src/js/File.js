function File(track, uri) {
	var createLayout = function(track, uri) {
		var filesDiv = track.trackElement.children("div").first();
		
		var trackFile = $("<a></a>")
						.attr("id", filesDiv.children("a").length)
						.attr("href",uri)
						.text(Util.getFileExtension(uri).toUpperCase())
						.appendTo(filesDiv);
						
		filesDiv.append(" ");
		return trackFile;
	}
	
	this.track = track;
	this.fileElement = createLayout(track, uri);
	this.uri = uri;
}