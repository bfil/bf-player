var HTML5 =  {
	isAudioSupported: function() {
		return !!(document.createElement('audio').canPlayType);
	},
	isRangeSupported: function() {
		var range = document.createElement("input")
		range.setAttribute("type","range");
		return range.type == "range";
	},
	isProgressSupported: function() {
		var audio = document.createElement('audio');
		return (audio != null && audio.buffered != undefined && audio.buffered.length != 0);
	}
};