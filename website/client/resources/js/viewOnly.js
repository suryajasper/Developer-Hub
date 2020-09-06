var socket = io();

var userID;
var topic;

initializeFirebase();

function refreshHeadings() {
  $('#sidenav').empty();
  var h1 = document.getElementsByTagName('h1');
  for (var i = 0; i < h1.length; i++) {
    h1[i].id = h1[i].innerHTML;
    var a = document.createElement('a');
    a.href = '#' + h1[i].innerHTML;
    a.innerHTML = h1[i].innerHTML;
    sidenav.appendChild(a);
  }
}

document.getElementById('approveChangesPopup').style.display = 'none';

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    userID = user.uid;
    topic = window.location.href.split('?')[1].split('#')[0];
    document.getElementById('pageTitle').innerHTML = topic;

    socket.emit('viewUpdateRequestChanges', userID, topic);
    socket.on('updateRequestChangesViewResult', function(change) {
      if (change !== null) {
        document.getElementsByClassName('main')[0].innerHTML = change.content;
        Prism.highlightAll();
        refreshHeadings();
        document.getElementById('approveChangesFirstButton').onclick = function(e) {
          e.preventDefault();
          document.getElementById('approveChangesPopup').style.display = 'block';
          document.getElementById('approveChangesButton').onclick = function(e2) {
            e2.preventDefault();
            socket.emit('approveChanges', userID, topic, document.getElementById('approveChangesComments').value);
            document.getElementById('approveChangesPopup').style.display = 'none';
          }
        }
      }
    })
  }
});
