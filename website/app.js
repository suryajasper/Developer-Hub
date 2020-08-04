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

var refSiteData = database.ref("siteData");
var gallery = database.ref("gallery");

io.on('connection', function(socket){
  socket.on('changeSiteData', function(data) {
    var topic = data.topic;
    refSiteData.child(data.userID).child(topic).update({content: data.content});
  })
  socket.on('getSiteData', function(userID, topic) {
    refSiteData.once('value', function(deltaSnap) {
      if (deltaSnap.val() !== null) {
        if (deltaSnap.val()[userID] !== null) {
          refSiteData.child(userID).once("value", function(snapshot) {
            if (snapshot.val()[topic] !== null) {
              socket.emit('updateSiteData', snapshot.val()[topic]['content']);
            }
          })
        }
      }
    })
  })
})

http.listen(port, function(){
  console.log('listening on port ' + port.toString());
});
