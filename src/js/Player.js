function Player(playerId, tracksToAdd, options) {
	var self = this;
	
	var playerId = playerId;
	
	var el = new Object();
	el.player = $("#" + playerId);
	
	var audio = null;
	var tracks = null;
	
	var prop = new Object();
	prop.volume = 100;
	prop.autoplay = false;
	prop.autoadvance = false;
	prop.repeatAll = false;
	if(options != null) {
		$.extend(prop, options);
	}
	prop.loading = false;
	prop.playing = false;
	prop.disabled = false;
	
	var isValidDiv = function() {
		return el.player.length == 1;
	}
	
	var initializePlayer = function() {
		if(isValidDiv()) {
			createLayout();
			
			if(!HTML5.isAudioSupported()) {
				disable();
			}
			else {
				initializeAudio();
				if(tracksToAdd != null) {
					self.setTracks(tracksToAdd);
				}
			}
			
			if(!HTML5.isRangeSupported()) {
				el.position.hide();
				el.volume.hide();
			}
		}
		else {
			prop.disabled = true;
		}
	}
	
	var loading = function(loading) {
		prop.loading = loading;
		if(loading) {
			el.loading.show();
		}
		else {
			el.loading.hide();
		}
	}
	
	var initializeAudio = function() {
		audio = new Audio();
		
		audio.addEventListener('loadstart', function() {
			loading(true);
		},false);
		
		audio.addEventListener('loadedmetadata', function() {
			var length = audio.duration;
			var secs = audio.currentTime;
		 	var progress = (secs / length) * 100;
		  	if(isNaN(progress)) {
		  		progress = 0;
		  	}
		  	el.position.val(progress);
		  	el.trackTime.text(Util.secondsToTime(secs));
		 	el.trackDuration.text(Util.secondsToTime(length));
		},false);
		
		audio.addEventListener('loadeddata', function() {
			loading(false);
		},false);
		
		audio.addEventListener('stalled', function() {
			loading(true);
		},false);
		
		audio.addEventListener('waiting', function() {
			loading(true);
		},false);
		
		audio.addEventListener('playing', function() {
			loading(false);
		},false);
		
		audio.addEventListener('seeking', function() {
			loading(true);
		},false);
		
		audio.addEventListener('seeked', function() {
			loading(false);
		},false);
		
		audio.addEventListener('timeupdate', function() {
			var length = audio.duration;
			var secs = audio.currentTime;
		 	var progress = (secs / length) * 100;
		  	if(isNaN(progress)) {
		  		progress = 0;
		  	}
		  	el.position.val(progress);
		  	el.trackTime.text(Util.secondsToTime(secs));
		 	el.trackDuration.text(Util.secondsToTime(length));
		},false);
		
		audio.addEventListener('ended', function() {
			if(prop.autoadvance) {
				var current = getCurrentTrack();
				var next = current.next('li');
				if(next.html() != null) {
					var track = tracks[next.attr("id")];
					loadTrack(track);
				}
				else {
					if(prop.repeatAll) {
						loadTrack(tracks[0]);
					}
					else {
						stop();
					}
				}
			}
			else {
				stop();
			}
		},false);
		
		if(HTML5.isProgressSupported())
		{
			audio.addEventListener('progress', function() {
				  	var loaded = parseInt(((audio.buffered.end(0) / audio.duration) * 100), 10);
		    		el.loadingProgress.val(loaded);
			},false);
		}
		else {
			el.loadingProgress.hide();
		}
	}
	
	var addTrack = function(title, files) {
		tracks[tracks.length] = new Track(el.trackList, title, files);
	}
	
	this.setTracks = function(tracksToAdd) {
		
		if(!prop.disabled) {
		
			tracks = new Array();
			
			el.trackList.empty();
			
			for(var k in tracksToAdd) {
				var track = tracksToAdd[k];
				addTrack(track.title, track.files);
			}
			
			if(tracks.length > 0) {
				loadTrack(tracks[0]);
			}
			
			bindControls();
			
			if(prop.autoplay) {
				playPause();
			}
		}
	}
	
	var getTracks = function() {
		return $('#' + playerId + 'Playlist li');
	}
	
	var getCurrentTrack = function() {
		return $('#' + playerId + 'Playlist li.playerCurrent');
	}
	
	var getFiles = function() {
		return $('#' + playerId + 'Playlist li div a');
	}
	
	var createLayout = function () {
		
		el.player.addClass("player");
		el.player.empty();
		
		var display = $("<div></div>")
					  .addClass("playerDisplay")
					  .appendTo(el.player);
		
		
		var info = $("<span></span>")
		           .addClass("playerInfo")
				   .appendTo(display);
				   
		el.track = $("<span></span>")
		           			.addClass("playerTrack")
				   			.attr("id", playerId + "Track")
				 			.appendTo(info)
				 			.text("Stand By...");
				   
		el.playerTime = $("<span></span>")
		           .addClass("playerTime")
				   .appendTo(info);
				   
		el.trackTime = $("<span></span>")
					            .addClass("playerTrackTime")
					            .attr("id", playerId + "TrackTime")
							    .appendTo(el.playerTime)
							    .text("0:00");
					    
		el.playerTime.append(" / ");
		
		el.trackDuration = $("<span></span>")
			            	.addClass("playerTrackDuration")
			          		.attr("id", playerId + "TrackDuration")
					   	 	.appendTo(el.playerTime)
					   	 	.text("0:00");
					   	 	
		el.position = $("<input type=\"range\">")
				  .addClass("playerPositionSlider")
				  .attr("min",0)
				  .attr("max",100)
				  .attr("value",0)
				  .attr("id", playerId + "PositionSlider")
				  .appendTo(el.player);
				  
		el.loadingProgress = $("<progress>")
				  .addClass("playerLoadingProgress")
				  .attr("min",0)
				  .attr("max",100)
				  .attr("value",0)
				  .attr("id", playerId + "LoadingProgress")
				  .appendTo(el.player);
	
		el.controlBar = $("<div></div>")
			             .addClass("playerControlBar")
					     .appendTo(el.player);
					     
		var controls = $("<ul></ul>")
			             .addClass("playerControls")
					     .appendTo(el.controlBar);
		
		el.prev = $("<li></li>")
			       .addClass("playerBtnPrev")
			       .attr("id", playerId + "BtnPrev")
			       .append("<a href=\"\"></a>")
				   .appendTo(controls);
		
		el.playPause = $("<li></li>")
			       .addClass("playerBtnPlay")
			       .attr("id", playerId + "BtnPlayPause")
			       .append("<a href=\"\"></a>")
				   .appendTo(controls);
				   
	    el.stop = $("<li></li>")
			       .addClass("playerBtnStop")
			       .attr("id", playerId + "BtnStop")
			       .append("<a href=\"\"></a>")
				   .appendTo(controls);
				   
		el.next = $("<li></li>")
			       .addClass("playerBtnNext")
			       .attr("id", playerId + "BtnNext")
			       .append("<a href=\"\"></a>")
				   .appendTo(controls);
				   
		el.playlistToggler = $("<li></li>")
						      .addClass("playerBtnPlaylist")
						      .attr("id", playerId + "BtnPlaylist")
						      .append("<a href=\"\"></a>")
							  .appendTo(controls);
							  
							  
		el.loading = $("<div></div>")
				      .addClass("playerLoading")
				      .append("<div id=\"block1\" class=\"playerLoadingBlock\"></a>")
				      .append("<div id=\"block2\" class=\"playerLoadingBlock\"></a>")
				      .append("<div id=\"block3\" class=\"playerLoadingBlock\"></a>")
				      .appendTo(el.controlBar);
		
		
						  
		var volumeContainer = $("<div></div>")
						      .addClass("playerVolume")
						      .appendTo(el.controlBar);
		
		el.volume = $("<input type=\"range\">")
					  .addClass("playerVolumeSlider")
					  .attr("min",0)
					  .attr("max",100)
					  .attr("value",prop.volume)
					  .attr("id", playerId + "VolumeSlider")
					  .appendTo(volumeContainer);
					  
		
					  
					  
		var volumeDiv = $("<div></div>")
						.appendTo(volumeContainer);
		
		var volumeUl = $("<ul></ul>")
					   .addClass("playerControls")
					   .appendTo(volumeDiv);
					  
		el.volumeButton = $("<li></li>")
						   .addClass("playerBtnVolume")
						   .attr("id", playerId + "BtnVolume")
						   .append("<a href=\"\"></a>")
						   .appendTo(volumeUl);
					   
		el.playlist = $("<div></div>")
				  .addClass("playerPlaylist")
				  .attr("id", playerId + "Playlist")
				  .appendTo(el.player);
				  
		el.trackList = $("<ol></ol>")
		   				.attr("id", playerId + "TrackList")
						.appendTo(el.playlist);
		
		
	}
	
	var playPause = function() {
		if(el.playPause.hasClass("playerBtnPlay")) {
			el.playPause.removeClass('playerBtnPlay');
		    el.playPause.addClass('playerBtnPause');
		    prop.playing = true;
			if(audio.src != null) audio.play();
		}
		else {
			el.playPause.removeClass('playerBtnPause');
			el.playPause.addClass('playerBtnPlay');
			prop.playing = false;
			if(audio.src != null) audio.pause();
		}
	}
	
	var stop = function() {
		if(audio.src != null)
		{
			prop.playing = false;
			audio.pause();
			if(audio.currentTime != 0) audio.currentTime = 0;
		}
		el.position.val(0);
		if(el.playPause.hasClass("playerBtnPause")) {
			el.playPause.removeClass('playerBtnPause');
			el.playPause.addClass('playerBtnPlay');
		}
	}
	
	var prev = function() {
		var current = getCurrentTrack();
		var previous = current.prev('li');
		if(previous.html() != null) {
			var track = tracks[previous.attr("id")];
			loadTrack(track);
		}
	}
	
	var next = function() {
		var current = getCurrentTrack();
		var next = current.next('li');
		if(next.html() != null) {
			var track = tracks[next.attr("id")];
			loadTrack(track);
		}
	}
	
	var bindControls = function() {
	
		getTracks().unbind('click').click( function(e) {
			var trackIndex = $(this).attr("id");
			var track = tracks[trackIndex];
			loadTrack(track);
			e.preventDefault();
		});
		
		getFiles().unbind('click').click( function(e) {
				
			var trackIndex = $(this).parent().parent().attr("id");
			var fileIndex = $(this).attr("id");
			
			var file = tracks[trackIndex].files[fileIndex];
			if(Util.isFileSupported(file.uri)) {
				loadFile(file);
			}
			else {
				$(this).addClass('playerTypeNotSupported')
					   .attr('title','Format Not Supported By The Browser!');
			}
			
			if (e.stopPropagation) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
			
			e.preventDefault();
		});
		
		
		el.position.unbind('change').change( function() {
			audio.seeking = true;
			audio.pause();
		});
		
		el.position.unbind('mouseup').mouseup( function() {
			audio.currentTime = Math.round($(this).val() / 100 * audio.duration);
			audio.seeking = false;
			if(prop.playing) audio.play();
		});
		
		el.volume.unbind('change').change( function() {
			if($(this).val() > 0)
			{
				audio.muted = false;
				if(el.volumeButton.hasClass('playerBtnMute')) {
					el.volumeButton.removeClass('playerBtnMute');
				}
			}
			prop.volume = $(this).val();
		    audio.volume = $(this).val() / 100;
		});
		
		el.playPause.unbind('click').click( function(e) {
			playPause();		    
			e.preventDefault();
		});	
		
		
		el.stop.unbind('click').click( function(e) {
			stop();
			e.preventDefault();
		});
		
		el.prev.unbind('click').click( function(e) {
			prev();
			e.preventDefault();
		});
		
		el.next.unbind('click').click( function(e) {
			next();
			e.preventDefault();
		});
		
		el.playlistToggler.unbind('click').click( function(e) {
			el.playlist.toggle();
			e.preventDefault();
		});
		
		el.volumeButton.unbind('click').click( function(e) {
			if($(this).hasClass('playerBtnMute')) {
				$(this).removeClass('playerBtnMute');
				el.volume.val(prop.volume);
				audio.muted = false;
			}
			else {
				$(this).addClass('playerBtnMute');
				el.volume.val(0);
				audio.muted = true;
			}
			e.preventDefault();
		});
	}
	
	var loadTrack = function(track) {
		if(audio.src != null) {
			audio.pause();
		}
		
		var file = track.first();
		
		if(file != null) {
			loadFile(file);
		}
	}
	
	var loadFile = function(file) {
		if(!prop.loading){
			audio.src = file.uri;
			audio.load();
			
			var track = file.track;
			$('#' + playerId + 'Playlist li').removeClass('playerCurrent');
			track.trackElement.addClass('playerCurrent');
			
			$('#' + playerId + 'Playlist div a').removeClass('playerCurrentType');
			file.fileElement.addClass('playerCurrentType');
			
			$('#' + playerId + 'Track').text(track.title);
			$('#' + playerId + 'PositionSlider').val(0);
			
			if(prop.playing) audio.play();
		}
	}
	
	var disable = function() {
		prop.disabled = true;
		el.track.text("Your Browser Doesn't Support HTML5 Audio");
		el.track.addClass("playerNotSupported");
		el.playerTime.hide();
		el.position.hide();
		el.loadingProgress.hide();
		el.controlBar.hide();
		el.playlist.hide();
	}
	
	initializePlayer();
}