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

function addNotification(type, text, time) {
  var notDiv = document.createElement('tr');
  notDiv.classList.add("notificationRow");

  var td = document.createElement('td');
  var notIcon = document.createElement('img');
  notIcon.classList.add("notificationIcon");
  notIcon.src = "resources/images/notificationIcons/" + type + '.svg';
  notIcon.title = type;
  td.appendChild(notIcon);
  notDiv.appendChild(td);

  td = document.createElement('td');
  var notText = document.createElement('p');
  notText.innerHTML = time;
  td.appendChild(notText);
  notDiv.appendChild(td);

  td = document.createElement('td');
  var notText = document.createElement('p');
  notText.innerHTML = '<b>' + type + ':</b> ' + text;
  td.appendChild(notText);
  notDiv.appendChild(td);

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
            addNotification(type.replaceAll('_', ' '), notObj.title, notObj.time);
          }
        }
      }
    })
  }
});
