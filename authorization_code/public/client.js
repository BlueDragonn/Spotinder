var playlist_id="NULL";
let arr_of_playlists_id = new Array();

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

		async function playTrack(){
			try{
				var request = $.getJSON('./request', function(track) {
					setTimeout(function (){
						play({
							playerInstance: player,
							spotify_uri: track.trackToPlay.uri,
						});	
						LoadPar(track)
						.then(
							setTimeout(function (){
							$.getJSON('./statusINFO', function(status) {
								if(status){
									toggleFollowed(0);
								}
								else{
									toggleFollowed(1);
								}
							})
							},2000)
						)
					},0);
				})
				
				setTimeout(function (){
					request.abort();	
				},4500);


			}catch{}
		}
		playTrack();
		
		
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
				arr_of_playlists_id = [];
			}
			else if(x < 0 &&  (y < 800 && y > 100)){ //swipe left
				console.log("Left");
				playTrack();
				arr_of_playlists_id = [];
			}
		}
	});
	player.addListener('not_ready', ({ device_id }) => {
		console.log('Device ID is not ready for playback', device_id);
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

async function toggleLiked(data){
	if(data)
	{
		document.getElementById("addToLikedCircle").style.fill = "#66D36E";
		console.log("working")
	}
	else{
		console.log("working")
		document.getElementById("addToLikedCircle").style.fill = "#ff6666";
	}
};

async function toggleFollowed(data){
	if(data)
	{
		document.getElementById("followArtist").disabled = false;
		document.getElementById("followArtist").style.display = "flex";
		
		document.getElementById("UNfollowArtistButton").style.display = "none";
		document.getElementById("UNfollowArtistButton").disabled = true
	}
	else{
		document.getElementById("followArtist").disabled = true
		document.getElementById("followArtist").style.display = "none";

		document.getElementById("UNfollowArtistButton").disabled = false;
		document.getElementById("UNfollowArtistButton").style.display = "flex";
		
	}
};

$("#addToLiked").click(function () {
	$.post("/addToLiked",
		{},
		function (data, status) {
			console.log(data);
			if(data=="Saved"){toggleLiked(1);}
			else{toggleLiked(0);}
	});
});


$("#addToPlaylist").click(function () {
	$.post("/addToPlaylist");
	arr_of_playlists_id.push(playlist_id);
	document.getElementById("addToPlaylistCircle").style.fill = "#ff6666";
	document.getElementById("addToPlaylist").disabled = true;
});

async function follow(){
	$.post("/followArtist",
		{},
		function (data, status) {
			toggleFollowed(data);
			console.log(data);
		});
};

$("#followArtist").click(function () {
	follow();
}); 
$("#UNfollowArtistButton").click(function () {
	follow();
	console.log("unfolow")
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

	var x = false;
	function iterate(item) {
		if (item == playlist_id) {
			x = true;
		}
	}
	arr_of_playlists_id.forEach(iterate);
	if (x == false) {
		document.getElementById("addToPlaylist").disabled = false;
	document.getElementById("addToPlaylistCircle").style.fill = "#66D36E";
	} else {
		document.getElementById("addToPlaylistCircle").style.fill = "#ff6666";
		document.getElementById("addToPlaylist").disabled = true;
	}

	$.post("/addToPlaylistID",
		{
			id: playlist_id,
		});
    console.log("You selected: "+playlist_id);
	//document.getElementById("addToPlaylist").disabled = false;
	//document.getElementById("addToPlaylistCircle").style.fill = "#66D36E";
	//document.getElementById("addToPlaylist").disabled = false;
  });
  