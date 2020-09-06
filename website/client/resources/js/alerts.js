var alertPopup = document.getElementById('alertPopup')
alertPopup.style.display = 'none';
function alertMsg(text) {
  alertPopup.style.display = 'block';
  alertPopup.innerHTML = text;

  var centerDiv = document.createElement('div');
  centerDiv.classList.add('wrapper');
  var confirmButton = document.createElement('button');
  confirmButton.innerHTML = "OK";
  confirmButton.onclick = function(e) {
    e.preventDefault();
    alertPopup.style.display = 'none';
  }
  confirmButton.style.backgroundColor = "#61d77b";
  centerDiv.appendChild(confirmButton);
  alertPopup.appendChild(centerDiv);
}
