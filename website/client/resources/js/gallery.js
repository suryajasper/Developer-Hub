var socket = io();

initializeFirebase();

var userID;

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    userID = user.uid;

    document.getElementById('newPageButton').onclick = function() {
      document.getElementById('newPageForm').style.display = 'block';
    }
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
