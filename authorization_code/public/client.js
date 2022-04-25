window.addEventListener("load", LoadInfoAboutSong);
	
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
					  }, 800)
					
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
					   }, 800)
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

async function LoadInfoAboutSong()
{
	let data = new XMLHttpRequest()
	
	data.open('GET', "./data", true);

	data.onload = function() {
		if(data.status === 200)
		{
			//console.log('success')
			let test = JSON.parse(this.response);
            //console.log(test.body.item.album.images[0].url);
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


setTimeout(() => {
	LoadInfoAboutSong();
  }, 2000)