var Util =  {
	getAudioType: function(ext) {
		switch(ext.toLowerCase()) {
			case "ogg":
				return "audio/ogg";
			case "mp3":
				return "audio/mpeg";
			case "wav":
				return "audio/wav";
			default: 
				return null;
		}
	},
	getFileExtension: function(fileName) {
		return fileName.substr(fileName.lastIndexOf('.') + 1);
	},
	secondsToTime: function(seconds) {
		if(!isNaN(seconds) && seconds != 0) {
			var tcMins = parseInt(seconds/60);
		    var tcSecs = parseInt(seconds - (tcMins * 60));
		    if (tcSecs < 10) { tcSecs = '0' + tcSecs; }
		    return tcMins + ':' + tcSecs;
	    }
	    else {
	    	return "0:00";
	    }
	},
	isFileSupported: function(fileName) {
		var ext = Util.getFileExtension(fileName);
		var audioType = Util.getAudioType(ext);
		return (audioType != null && document.createElement('audio').canPlayType(audioType));	
	}
};