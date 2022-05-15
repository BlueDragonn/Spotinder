var SpotifyWebApi = require('spotify-web-api-node');
var bodyParser = require('body-parser');
const express = require('express');

const scopes = [
    'ugc-image-upload',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'app-remote-control',
    'user-read-email',
    'user-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-read-private',
    'playlist-modify-private',
    'user-library-modify',
    'user-library-read',
    'user-top-read',
    'user-read-playback-position',
    'user-read-recently-played',
    'user-follow-read',
    'user-follow-modify'
  ];
  
// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId: 'b2e6644931a64122a406332d4da0a0b4',
  clientSecret: '779bf5cc47ac46e38eb14935ba2ca3dc',
  redirectUri: 'http://localhost:8888/callback'
});
  const app = express();
  
  app.get('/login', (req, res) => {
    res.redirect(spotifyApi.createAuthorizeURL(scopes));
  });
  
  app.get('/callback', (req, res) => {
    const error = req.query.error;
    const code = req.query.code;
    const state = req.query.state;
  
    if (error) {
      console.error('Callback Error:', error);
      res.send(`Callback Error: ${error}`);
      return;
    }
  
    spotifyApi
      .authorizationCodeGrant(code)
      .then(data => {
        const access_token = data.body['access_token'];
        const refresh_token = data.body['refresh_token'];
        const expires_in = data.body['expires_in'];
  
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
  
        //console.log('access_token:', access_token);
       // console.log('refresh_token:', refresh_token);
  
        //console.log(
        //  `Sucessfully retreived access token. Expires in ${expires_in} s.`
        //);
        res.redirect('/');
        
        
        setInterval(async () => {
          const data = await spotifyApi.refreshAccessToken();
          const access_token = data.body['access_token'];
          
          console.log('The access token has been refreshed!');
          console.log('access_token:', access_token);
          spotifyApi.setAccessToken(access_token);
        }, expires_in / 2 * 1000);
        
      })
      .catch(error => {
        console.error('Error getting Tokens:', error);
        res.send(`Error getting Tokens: ${error}`);
      });
      
    });
    
    
    //////////////////////////////////////////////
    const path = require('path');       // for opening .html files after entering url
    app.use(express.static('public'))
    app.use(express.urlencoded({ extended: true }));
    
    app.get('/', function(req, res) {
      res.sendFile(__dirname + "/" + "/public/index.html");
      res.redirect('/request');
    });


    app.get('/auth_token', function(req, res) {
      let token = spotifyApi.getAccessToken();
      let user = {  
        access_token: token,
      }
      res.send(user);
    });

    var topArtists;


////////////////////////////////////////////////

var recommendationSeed = [];
var isSeedGenerated=0;

app.all("/request", (req, res) => {
  spotifyApi.getMyTopTracks()
  .then(function(data) {
    let myTopTracks = data.body.items;

    if(isSeedGenerated==0){
      recommendationSeed = [
        myTopTracks[0].id,
        myTopTracks[1].id,
        myTopTracks[2].id,
        myTopTracks[3].id,
        myTopTracks[4].id,
      ]
      isSeedGenerated=1;
    }
    console.log(...recommendationSeed);

    spotifyApi.getRecommendations({
      min_energy: 0.4,
      seed_tracks: [...recommendationSeed],
      min_popularity: 40
    })
  .then(function(data) {
    let recommendations = data.body;
    //console.log(recommendations);
    var inexOfSong = Math.floor(Math.random() * 3);
    let track = {
      trackToPlay: recommendations.tracks[inexOfSong].uri
    }
    
    res.send(track);
    res.end();

  }, function(err) {
    console.log("Something went wrong!", err);
  });
  }, function(err) {
    console.log('Something went wrong!', err);
  });
});

  //////////////////////////////////////////////
  app.get('/data', function(req, res) {

    spotifyApi.getMyCurrentPlayingTrack()
    .then(function(data) {
      res.send(data)
    }, function(err) {
      console.log('Something went wrong!', err);
    });;
  
  });

  app.all('/right', function(req, res) { // adding song to seed
    spotifyApi.getMyCurrentPlayingTrack()
    .then(function(data) {


      recommendationSeed.shift();
      recommendationSeed.push(data.body.item.id);

      //console.log(...recommendationSeed);
    }, function(err) {
      console.log('Something went wrong!', err);
    });;
  });

  app.all('/addToLiked', function(req, res) {

    spotifyApi.getMyCurrentPlayingTrack()
    .then(function(data) {
      var currentlyPlaying = data.body.item.id;

      spotifyApi.containsMySavedTracks([currentlyPlaying])
      .then(function(data) {
    
        var trackIsInYourMusic = data.body[0];
    
        if (trackIsInYourMusic) { // 'Track was found in the user\'s Your Music library'

          spotifyApi.removeFromMySavedTracks([currentlyPlaying])
            .then(function(data) {
              console.log('Removed!');
            }, function(err) {
              console.log('Something went wrong!', err);
            });
            res.send("notFollowed");
          
        } else { //'Track was not found.'

          spotifyApi.addToMySavedTracks([currentlyPlaying])
          .then(function(data) {
            console.log('Added track!');
          }, function(err) {
            console.log('Something went wrong!', err);
          });

          res.send("Followed");
        }
      }, function(err) {
        console.log('Something went wrong!', err);
      });

    }, function(err) {
      console.log('Something went wrong!', err);
    });;

 
  });

  app.post('/followArtist', function(req, res) {

    spotifyApi.getMyCurrentPlayingTrack()
    .then(function(data) {

      spotifyApi.followArtists([data.body.item.artists[0].id])
      .then(function(data) {
        console.log(data);
      }, function(err) {
        console.log('Something went wrong!', err);
      });

    }, function(err) {
      console.log('Something went wrong!', err);
    });;

    res.end();
  });

  
  app.post('/setVolume', function(req, res) {

      spotifyApi.setVolume(req.body.volume)
    .then(function () {
      }, function(err) {
      //if the user making the request is non-premium, a 403 FORBIDDEN response code will be returned
      console.log('Something went wrong!', err);
    });


    res.end(); // VERY IMPORTANT TO END REQUEST
  });

  app.get('/getPlaylist', function(req, res) {


    spotifyApi.getMe()
    .then(function(data) {
      console.log('Some information about the authenticated user', data.body);




    }, function(err) {
      console.log('Something went wrong!', err);
    })



    res.end(); // VERY IMPORTANT TO END REQUEST
  });



  app.listen(8888, () =>
  console.log(
    'HTTP Server up. Now go to http://localhost:8888/login in your browser.'
  ));
