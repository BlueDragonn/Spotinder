window.addEventListener("load", LoadInfoAboutSong);
var playlist_id="NULL";

async function LoadInfoAboutSong()
{
	let data = new XMLHttpRequest()
	
	data.open('GET', "./data", true);

	data.onload = function() {
		if(data.status === 200)
		{
			let test = JSON.parse(this.response);

            document.getElementById("artist").innerHTML = test.body.item.artists[0].name;
            document.getElementById("song").innerHTML =  test.body.item.name;
            document.getElementById("cover").src =  test.body.item.album.images[0].url;
			
		}
		else 
		{
			console.log("Error");
        }
		
	}
	data.send();
}

	var trackOnLoad;
	
		$.getJSON('./request', function(test) {
		trackOnLoad=test.trackToPlay;
		});
	
		function refreshRecommendedSong()
		{
			$.getJSON('./request', function(test) {
				trackOnLoad=test.trackToPlay;
				});
				console.log("Recommended: "+trackOnLoad);

				setTimeout(() => {
					LoadInfoAboutSong();
				  }, 1200)
		}


	$.getJSON('./auth_token', function(data) {

		window.onSpotifyWebPlaybackSDKReady = () => {
			const token = data.access_token;
			const player = new Spotify.Player({
			  name: 'Spotinder',
			  getOAuthToken: cb => { cb(token); },
			  volume: 0.25
			});

		  // Ready
		  player.addListener('ready', ({ device_id }) => {
			console.log('Ready with Device ID', device_id);

			const play = ({
				spotify_uri,
				playerInstance: {
				  _options: {
					getOAuthToken
				  }
				}
			  }) => {
				getOAuthToken(access_token => {
				  fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
					method: 'PUT',
					body: JSON.stringify({ uris: [spotify_uri] }),
					headers: {
					  'Content-Type': 'application/json',
					  'Authorization': `Bearer ${access_token}`
					},
				  });
				});
			  };

			  function playSongPlayer(song_uri)
			  {
				  play({
					  playerInstance: player,
					  spotify_uri: song_uri,
					});
					console.log("Playing: " + song_uri)
					refreshRecommendedSong();
					setTimeout(() => {
						LoadInfoAboutSong();
					  }, 1200)
				};

			playSongPlayer(trackOnLoad);

			  document.getElementById("cover").ondragend  = function() {
				var x = window.event.offsetX,
					y = window.event.offsetY;
				   
				 console.log(x, y); 
				 if(x > 500 &&  (y < 800 && y > 100))
				 {console.log("Right")
			
				 
					var right = $.post("/right",				// adding song to seed
					   {},
					   function (data, status) {
						   
					});
					
					 playSongPlayer(trackOnLoad);
					setTimeout(() => {
						LoadInfoAboutSong();
					  }, 1200)
					
					  setTimeout(function() {				//aborting old request so requests do not overload
						right.abort();
						console.log("Request canceled."); 
					}, 3000);
				 ;}
				 else if(x < 0 &&  (y < 800 && y > 100)){
					 console.log("left")
					 playSongPlayer(trackOnLoad);
					 setTimeout(() => {
						 LoadInfoAboutSong();
					   }, 1200)
				 ;}
			   }

		  });
		
		  // Not Ready
		  player.addListener('not_ready', ({ device_id }) => {
			console.log('Device ID has gone offline', device_id);
		  });

		  player.connect();
		  
		}
	});


  /////////////////////////////////////


$(document).ready(function () {
	$("#submit").click(function () {
	   $.post("/request",
		  {},
		  function (data, status) {
			 console.log(data);
		  });
	});
 });


$("#addToLiked").click(function () {
	$.post("/addToLiked",
		{},
		function (data, status) {
			console.log(data);
		});
		
});

$("#followArtist").click(function () {
	$.post("/followArtist",
		{},
		function (data, status) {
			console.log(data);
		});
}); 

	$.getJSON('./getPlaylist', function(allPlaylistInfo) {
		console.log(allPlaylistInfo.items[0].name);

	});

var slider = document.getElementById("myRange");

slider.oninput = function() {
  console.log(slider.value);

  $.post("/setVolume",
  {
	  volume: slider.value
  },
  function (data, status) {
	  console.log(data);
  });

}

setTimeout(() => {
	LoadInfoAboutSong();
  }, 2000)

  function addPlaylist(item){
	let node = document.createElement("option");
	node.value = item.id;
	node.innerHTML = item.name + " (" + item.tracks.total + ")";
	document.getElementById("playlists").appendChild(node); 
  }

  async function PlaylistsNames(){
	console.log("xd1");
  $.getJSON('./getPlaylist', (data) => {
		  console.log("xd2");
		  //data.items.forEach(item => addPlaylist(item));
	  });
	}

  window.addEventListener("load", PlaylistsNames);

  document.getElementById('playlists').addEventListener('change', function() {
    playlist_id = document.getElementById("playlists").value;
    console.log("You selected: "+playlist_id);
  });

  //end