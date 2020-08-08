var socket = io();

initializeFirebase();

var userID;

function addButtonLink(trId, name, href) {
  var button = document.createElement('button');
  button.innerHTML = name;
  button.classList.add('languageSelection');
  button.onclick = function() {
    window.location.href = href;
  }
  document.getElementById(trId).appendChild(button);
}

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
          for (var name of names) {
            addButtonLink('unfinishedTr', name, 'tutorialpage.html?' + name);
          }
        } else {
          document.getElementById('unfinishedH2').innerHTML = 'Your Unfinished Pages (0)';
        }

        if ('publishedpages' in userPages) {
          var names = Object.keys(userPages.publishedpages);
          document.getElementById('finishedPublicH2').innerHTML = 'Your Published Pages (' + names.length.toString() + ')';
          for (var name of names) {
            addButtonLink('finishedPublicTr', userPages.publishedpages[name], 'tutorialpage.html?' + userPages.publishedpages[name]);
          }
        } else {
          document.getElementById('finishedPublicH2').innerHTML = 'Your Published Public Pages (0)';
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

  window.location.href = 'tutorialpage.html?' + document.getElementById('pageName').value;
}

if (window.location.href.split('?')[1] === 'userCreated') {
  document.getElementById('userCreatedStuff').style.display = 'block';
  document.getElementsByTagName('h1')[0].innerHTML = 'Your Pages';
} else {
  document.getElementById('publicStuff').style.display = 'block';
}
