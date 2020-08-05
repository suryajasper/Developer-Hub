var socket = io();

initializeFirebase();

var userID;

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    userID = user.uid;

    document.getElementById('newPageButton').onclick = function() {
      document.getElementById('newPageForm').style.display = 'block';
    }

    socket.emit('getUserPages', userID);
    socket.on('userPageRes', function(userPages) {
      if (userPages !== null) {
        if ('unpublishedpages' in userPages) {
          var names = Object.keys(userPages.unpublishedpages);
          document.getElementById('unfinishedH2').innerHTML = 'Your Unfinished Pages (' + names.length.toString() + ')';
        } else {
          document.getElementById('unfinishedH2').innerHTML = 'Your Unfinished Pages (0)';
        }
      }
    })
  }
});

document.getElementById('cancelPage').onclick = function() {
  document.getElementById('newPageForm').style.display = 'block';
}

document.getElementById('createPage').onclick = function(e) {
  e.preventDefault();

  socket.emit('newPageToGallery', document.getElementById('pageName').value, document.getElementById('isPublic').checked,document.getElementById('anyoneCanEdit').checked, userID);

  window.location.href = 'newPage.html?' + document.getElementById('pageName').value;
}

if (window.location.href.split('?')[1] === 'userCreated') {
  document.getElementById('userCreatedStuff').style.display = 'block';
  document.getElementsByTagName('h1')[0].innerHTML = 'Your Pages';
} else {
  document.getElementById('publicStuff').style.display = 'block';
}
