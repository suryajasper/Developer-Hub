var admin = require("firebase-admin");

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/client'));
var port = process.env.PORT || 3000;

var serviceAccount = require("/Users/suryajasper2004/Downloads/developer-hub-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://developer-hub-2b06f.firebaseio.com"
});

var database = admin.database();

var gallery = database.ref("gallery");
var userInfo = database.ref('userInfo');

io.on('connection', function(socket){
  socket.on('changeSiteData', function(data) {
    userInfo.child(data.userID).child('unpublishedpages').child(data.topic).once('value', function(userInfoSnap) {
      console.log(data.topic);
      if (userInfoSnap.val() !== null) {
        console.log('found it ' + data.content.length.toString());
        userInfo.child(data.userID).child('unpublishedpages').child(data.topic).update({content: data.content});
      } else {
        gallery.child(data.topic).once('value', function(gallerySnap) {
          if (gallerySnap.val() !== null) {
            gallery.child(data.topic).update({content: data.content});
          }
        })
      }
    })
  })
  socket.on('getSiteData', function(userID, topic) {
    userInfo.child(userID).child('unpublishedpages').child(topic).once('value', function(userInfoSnap) {
      if (userInfoSnap.val() !== null && 'content' in userInfoSnap.val()) {
        socket.emit('updateSiteData', userInfoSnap.val().content);
      } else {
        gallery.child(topic).once('value', function(gallerySnap) {
          if (gallerySnap.val() !== null && 'content' in gallerySnap.val()) {
            socket.emit('updateSiteData', gallerySnap.val().content);
          }
        })
      }
    })
  })
  socket.on('newPageToGallery', function(pageName, isPublic, anyoneCanEdit, userID) {
    userInfo.child(userID).child('unpublishedpages').child(pageName).set({authorID: userID, isPublic: isPublic, anyoneCanEdit: anyoneCanEdit});
  });
  socket.on('isUserValid', function(userID, pageName) {
    gallery.child('pageName').once('value', function(snapshot) {
      userInfo.child(userID).child('unpublishedpages').once('value', function(userSnap) {
        socket.emit('userValidResults', (snapshot.val() !== null && snapshot.val().authorID === userID) || (userSnap.val() !== null && pageName in userSnap.val()));
      });
    })
  })
  socket.on('getUserPages', function(userID) {
    userInfo.child(userID).once('value', function(snapshot) {
      socket.emit('userPageRes', snapshot.val());
    })
  })
})

http.listen(port, function(){
  console.log('listening on port ' + port.toString());
});
