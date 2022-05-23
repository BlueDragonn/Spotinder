var playlist_id="NULL";


async function LoadPar(test)
{
	document.getElementById("artist").innerHTML = test.trackToPlay.artists[0].name;
	document.getElementById("song").innerHTML =  test.trackToPlay.name;
	document.getElementById("cover").src =  test.trackToPlay.album.images[0].url;

	document.getElementById("addToPlaylistCircle").style.fill = "#66D36E";
	document.getElementById("addToPlaylist").disabled = false;

}

	
var tokenJSON;
$.getJSON('./auth_token', function(data) {
	tokenJSON = data.access_token;
});

window.onSpotifyWebPlaybackSDKReady = () => {
try{
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
			try{

				var request = $.getJSON('./request', function(track) {
					play({
						playerInstance: player,
						spotify_uri: track.trackToPlay.uri,
					});	
					LoadPar(track);
				})
				setTimeout(function (){
					request.abort();	
				},2500);
			}catch{}
		}
		playTrack()
		.then(
			player.getCurrentState()
			.then(state => {
				if (!state) {
					player.resume()
				}})
		);
		
		var slider = document.getElementById("myRange");
		slider.oninput = function() {
		player.setVolume(slider.value)

		};
		

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
	});
}catch{}
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
	toggleLikedButtonColor();
		
});

$("#addToPlaylist").click(function () {
	$.post("/addToPlaylist");
	document.getElementById("addToPlaylistCircle").style.fill = "#ff6666";
	document.getElementById("addToPlaylist").disabled = true;
	}
);

$("#followArtist").click(function () {
	$.post("/followArtist",
		{},
		function (data, status) {
			console.log(data);
		});
}); 


document.getElementById("addToPlaylist").disabled = true;
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
	document.getElementById("addToPlaylist").disabled = false;
  });