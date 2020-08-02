function initializeFirebase() {
  var firebaseConfig = {
    apiKey: "AIzaSyBDpRQYkpYdeFuV_DBcX3hRR7nl5ciODYI",
    authDomain: "developer-hub-2b06f.firebaseapp.com",
    databaseURL: "https://developer-hub-2b06f.firebaseio.com",
    projectId: "developer-hub-2b06f",
    storageBucket: "developer-hub-2b06f.appspot.com",
    messagingSenderId: "174749639674",
    appId: "1:174749639674:web:9c41be0f1982ff14bc7a43",
    measurementId: "G-H5PLZC7JJ3"
  };

  firebase.initializeApp(firebaseConfig);
  console.log("INITIALIZED");
}
