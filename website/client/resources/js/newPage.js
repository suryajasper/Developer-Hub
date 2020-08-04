var socket = io();

var userID;

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    userID = user.uid;

    socket.emit('isUserValid', userID, window.location.href.split('?')[1]);
    socket.on('userValidResults', function(result) {
      if (!result) {
        window.location.href = "main.html";
      }
    })
  }
});
