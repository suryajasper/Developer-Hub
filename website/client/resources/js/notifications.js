var socket = io();
initializeFirebase();

var userID;

String.prototype.replaceAll = function(toReplace, replaceWith) {
  var replaced = this.replace(toReplace, replaceWith);
  while (replaced.includes(toReplace)) {
    replaced = replaced.replace(toReplace, replaceWith);
  }
  return replaced;
}

function addNotification(type, text) {
  var notDiv = document.createElement('div');
  notDiv.classList.add("notificationDiv");

  var notIcon = document.createElement('img');
  notIcon.classList.add("notificationIcon");
  notIcon.src = "resources/images/notificationIcons/" + type + '.svg';
  notDiv.appendChild(notIcon);

  var notText = document.createElement('p');
  notText.classList.add("notificationText");
  notText.innerHTML = '<b>' + type + ':</b> ' + text;
  notDiv.appendChild(notText);

  document.getElementById('notifications').appendChild(notDiv);
}

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    userID = user.uid;
    socket.emit('getNotifications', userID);
    socket.on('notificationsRes', function(notifications) {
      if (notifications !== null) {
        for (var type of Object.keys(notifications)) {
          for (var notObj of Object.values(notifications[type])) {
            addNotification(type.replaceAll('_', ' '), notObj.title);
          }
          document.getElementById('notifications').appendChild(document.createElement('hr')); // add a line
        }
      }
    })
  }
});
