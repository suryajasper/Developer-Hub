var admin = require("firebase-admin");

var express = require('express');
var appExpress = express();
var http = require('http').createServer(appExpress);
var io = require('socket.io')(http);
appExpress.use(express.static(__dirname + '/client'));
var port = process.env.PORT || 3000;

var serviceAccount = require("/Users/suryajasper2004/Downloads/developer-hub-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://developer-hub-2b06f.firebaseio.com"
});

var database = admin.database();

var refSiteData = database.ref("siteData");

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

const { app, BrowserWindow } = require('electron');
console.log(app);
function createWindow () {
  console.log('creating window');
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile(__dirname + '/client/index.html');
  win.focus();
  win.webContents.openDevTools();
  console.log('created window');
}
app.whenReady().then(createWindow)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

http.listen(port, function(){
  console.log('listening on port ' + port.toString());
});
