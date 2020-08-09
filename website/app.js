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
      if (userInfoSnap.val() !== null) {
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
    gallery.child(pageName).once('value', function(snapshot) {
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
  socket.on('rename', function(userID, oldTitle, newTitle) {
    userInfo.child(userID).child('unpublishedpages').child(oldTitle).once('value').then(function(snapshot) {
      var data = snapshot.val();
      var update = {};
      update[newTitle] = data;
      userInfo.child(userID).child('unpublishedpages').update(update);
      userInfo.child(userID).child('unpublishedpages').child(oldTitle).remove();
      socket.emit('renameCompleted');
    });
  })
  socket.on('publishPage', function(userID, topic) {
    userInfo.child(userID).child('unpublishedpages').child(topic).once('value', function(snapshot) {
      if (snapshot.val() !== null) {
        var galleryUpdate = {};
        galleryUpdate[topic] = snapshot.val();
        gallery.update(galleryUpdate);

        userInfo.child(userID).child('unpublishedpages').child(topic).remove();

        userInfo.child(userID).child('publishedpages').once('value', function(publishedSnapshot) {
          var pub = publishedSnapshot.val();
          if (pub !== null) {
            var pubUpdate = {};
            pubUpdate[Object.keys(pub).length] = topic;
            userInfo.child(userID).child('publishedpages').update(pubUpdate);
          } else {
            userInfo.child(userID).child('publishedpages').update({0: topic});
          }
        })
      }
    })
  })
})

http.listen(port, function(){
  console.log('listening on port ' + port.toString());
});
