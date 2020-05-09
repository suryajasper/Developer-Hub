var socket = io();

initializeFirebase();

var email = document.getElementById("email");
var password = document.getElementById("password");
var submitButton = document.getElementById("login");

function logInUser() {
  firebase.auth().signInWithEmailAndPassword(email.value, password.value).then(auth => {
    window.location = 'main.html';
  }).catch(error => {
    alert(error.message);
  });
}

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    window.location = 'main.html';
  }
});

submitButton.onclick = function(e) {
  e.preventDefault();
  logInUser();
}
