var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname));
var port = process.env.PORT || 2000;

http.listen(port, function(){
  console.log('listening on port ' + port.toString());
});
