//window.addEventListener("load", LoadInfoAboutSong);

var playlist_id="NULL";

async function LoadInfoAboutSong()
{
	$.getJSON('./data', function(test) {		

		setTimeout(function(){
            document.getElementById("artist").innerHTML = test.body.item.artists[0].name;
            document.getElementById("song").innerHTML =  test.body.item.name;
            document.getElementById("cover").src =  test.body.item.album.images[0].url;
		}, 900);
	})
};
	
	var tokenJSON;
	$.getJSON('./auth_token', function(data) {
		tokenJSON = data.access_token;
	});
	window.onSpotifyWebPlaybackSDKReady = () => {

		var player = new Spotify.Player({
			name: 'Spotinder',
			getOAuthToken: callback => {callback(tokenJSON); },
			volume: 0.25
		  });

		  player.connect();
		  player.addListener('ready', ({ device_id }) => {

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
			async function playTrack(){ // info about song from trackonplay

				$.getJSON('./request', function(track) {
						play({
						playerInstance: player,
						spotify_uri: track.trackToPlay,
						});

						setTimeout(function(){ // if track doesnt start by its self
							player.resume();
						}, 1000);
				
				});
			}
			playTrack();
			player.resume();		

			document.getElementById("cover").ondragend  = function() {
				var x = window.event.offsetX,
					y = window.event.offsetY;
					
				if(x > 500 &&  (y < 800 && y > 100)){	//swipe right

					console.log("Right");
					$.post("/right");
					playTrack();

				}
				else if(x < 0 &&  (y < 800 && y > 100)){ //swipe left
					console.log("Left");
					playTrack();		
				}
			}
			var t=setInterval(LoadInfoAboutSong,1500);
		});
	};


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

$("#addToPlaylist").click(function () {
	$.post("/addToPlaylist");
});

$("#followArtist").click(function () {
	$.post("/followArtist",
		{},
		function (data, status) {
			console.log(data);
		});
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



  function addPlaylist(item){
	let node = document.createElement("option");
	node.value = item.id;
	node.innerHTML = item.name;
	document.getElementById("playlists").appendChild(node); 
  }

  async function PlaylistsNames(){

	$.getJSON('./getPlaylist', (data) => {
			data.items.forEach(item => addPlaylist(item));
		});
	}

  window.addEventListener("load", PlaylistsNames);

  document.getElementById('playlists').addEventListener('change', function() {
    playlist_id = document.getElementById("playlists").value;

	$.post("/addToPlaylistID",
		{
			id: playlist_id,
		});
    console.log("You selected: "+playlist_id);
  });

  
