var socket = io();

function urlify(text) {
  var urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, function(url) {
    return '<a href="' + url + '">' + url + '</a>';
  });
}

var h1 = document.getElementsByTagName('h1');
var sidenav = document.getElementById('sidenav');
var sidebarshow = document.getElementById('sidebarshow');
var main = document.getElementsByClassName('main')[0];
var topBar = document.getElementById('top-options');
var editMode = document.getElementById('editMode');
var topic =document.getElementById('topic').innerHTML;

var currentEdit = null;
var currentToReplace = null;
var currentEditCodeTag = null;

var lastInputSelect = null;

initializeFirebase();

sidebarshow.onclick = function() {
  if (sidenav.style.display === 'block') {
    sidenav.style.display = 'none';
    sidenav.style.position = 'absolute';
    main.style.marginLeft = '0px';
  } else {
    sidenav.style.display = 'block';
    sidenav.style.position = 'fixed';
    main.style.marginLeft = '160px';
  }
}

function createNewDivAnchor() {
  var newDiv = document.createElement('a');
  newDiv.innerHTML = '+';
  newDiv.href = "#";
  newDiv.style.textAlign = "center";
  newDiv.onclick = function(e) {
    e.preventDefault();
    addNewSection();
    window.scrollTo(0,document.body.scrollHeight);
  }
  return newDiv;
}

function refreshHeadings(addAddButton) {
  $('#sidenav').empty();
  for (var i = 0; i < h1.length; i++) {
    h1[i].id = h1[i].innerHTML;
    var a = document.createElement('a');
    a.href = '#' + h1[i].innerHTML;
    a.innerHTML = h1[i].innerHTML;
    sidenav.appendChild(a);
  }
  if (addAddButton) {
    sidenav.appendChild(createNewDivAnchor());
  }
}

refreshHeadings(false);

function dropdown(name, values, placeholders) {
  var dropdiv = document.createElement('div');
  dropdiv.classList.add('dropdown');

  var dropbtn = document.createElement('button');
  dropbtn.innerHTML = name;
  dropbtn.classList.add('dropbtn');

  var dropcnt = document.createElement('div');
  dropcnt.classList.add('dropdown-content');

  var arrA = [];

  for (var i = 0; i < values.length; i++) {
    var a = document.createElement('a');
    a.innerHTML = values[i];
    if (placeholders!== null && placeholders[i] !== null) {
      a.id = placeholders[i];
    }
    dropcnt.appendChild(a);
    arrA.push(a);
  }

  dropdiv.appendChild(dropbtn);
  dropdiv.appendChild(dropcnt);
  return {dd: dropdiv, aa: arrA};
}

function addNewSection() {
  var fieldset = document.createElement('fieldset');
  fieldset.style.marginBottom = '90px';
  var legend = document.createElement('legend');
  var legendHeader = document.createElement('h1');
  legendHeader.style.display = "inline-block";
  legendHeader.style.marginRight = "10px";
  legendHeader.innerHTML = 'Section title: ';
  var legendInput = document.createElement('input');
  legendInput.style.display = "inline-block";
  legendInput.setAttribute('type', 'text');
  legend.appendChild(legendHeader);
  legend.appendChild(legendInput);
  fieldset.appendChild(legend);

  var contentIn = document.createElement('textarea');
  contentIn.classList.add('ignoreCSS');
  contentIn.classList.add('contentInCSS');
  //contentIn.contentEditable = true;
  /*var keywords = ["SELECT","FROM","WHERE","LIKE","BETWEEN","NOT LIKE","FALSE","NULL","FROM","TRUE","NOT IN"];
  contentIn.onkeyup = function(e){
    // Space key pressed
    if (e.keyCode == 32){
      var newHTML = "";
      // Loop through words
      console.log($(this).text().replace(/[\s]+/g, " "));
      $(this).text().replace(/[\s]+/g, " ").trim().split(" ").forEach(function(val){
        // If word is statement
        if (keywords.indexOf(val.trim().toUpperCase()) > -1)
          newHTML += "<span class='statement'>" + val + "&nbsp;</span>";
        else
          newHTML += "<span class='other'>" + val + "&nbsp;</span>";
      });
      $(this).html(newHTML);

      // Set cursor postion to end of text
      var child = $(this).children();
      var range = document.createRange();
      var sel = window.getSelection();
      range.setStart(child[child.length-1], 1);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      this.focus();
    }
  };*/

  main.appendChild(fieldset);

  var createButton = document.createElement('button');
  createButton.innerHTML = 'Add Section';
  createButton.style.display = 'inline-block';
  createButton.onclick = function(e) {
    e.preventDefault();
    var content = contentIn.value.split('\n');
    var sectDiv = document.createElement('section');
    sectDiv.id = legendInput.value;

    var h1 = document.createElement('h1');
    h1.innerHTML = legendInput.value;
    h1.style.textAlign = 'center';
    sectDiv.appendChild(h1);

    var inCodeBlock = false;
    var language = 'javascript';
    var codeBlock = '';
    for (var line of content) {
      var toCreate;
      if (!inCodeBlock) {
        if (line.substring(0,2) === '##') {
          toCreate = document.createElement('h3');
          toCreate.innerHTML = line.substring(2);
        } else if (line.substring(0,1) === '#') {
          toCreate = document.createElement('h2');
          toCreate.innerHTML = line.substring(1);
        } else if (line.includes('```')) {
          inCodeBlock = true;
          if (line.replaceAll(' ', '').length > 3) {
            language = line.replaceAll(' ', '').substring(3, line.replaceAll(' ', '').length).toLowerCase();
          } else {
            language = 'javascript';
          }
          continue;
        } else {
          toCreate = document.createElement('p');
          toCreate.innerHTML = line;
        }
        sectDiv.appendChild(toCreate);
      } else {
        if (line.includes('```')) {
          inCodeBlock = false;
          var code = '<pre class="language-' + language + '" data-src-loaded="" data-src="../resources/prism/prism.js"><code class="language-' + language + '">' + codeBlock.substring(0, codeBlock.length-1) + '</code></pre>'
          sectDiv.innerHTML += code;
          codeBlock = '';
        } else {
          codeBlock += line + '\n';
        }
      }
    }
    main.replaceChild(sectDiv, fieldset);
    Prism.highlightAll();
    refreshHeadings(true);
  }

  var cancelButton = document.createElement('button');
  cancelButton.innerHTML = 'Cancel';
  cancelButton.style.display = 'inline-block';
  cancelButton.onclick = function(e) {
    fieldset.remove();
  }

  fieldset.appendChild(contentIn);
  fieldset.appendChild(createButton);
  fieldset.appendChild(cancelButton);
}

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    refreshHeadings(true);
    topBar.style.display = 'inline-block';

    socket.emit('getSiteData', user.uid, topic);

    document.getElementById('saveButton').onclick = function(e) {
      e.preventDefault();
      if (editMode.value === 'editing') {
        reverseEditMode();
        handleEditMode();
      }
      socket.emit('changeSiteData', {userID: user.uid, topic: topic, content: main.innerHTML});
    }

    socket.on('updateSiteData', function(innerHTML) {
      console.log(innerHTML);
      main.innerHTML = innerHTML;
      Prism.highlightAll();
      refreshHeadings(true);
    })
  }
});

function makeLastEditView() {
  if (currentEdit !== null) {
    currentEdit.style.border = 'none';
    if (currentToReplace !== null) {
      if (currentEdit.tagName === 'PRE') {
        currentEdit.innerHTML = '<code class = "' + currentEditCodeTag + '">' + currentToReplace.value + '</code>';
      } else {
        currentEdit.innerHTML = currentToReplace.value;
      }
      console.log(currentToReplace);
      if (currentToReplace.parentNode !== null)
        currentToReplace.parentNode.replaceChild(currentEdit, currentToReplace);
      Prism.highlightAll();
      console.log('highlight');
    }
  }
}

function reverseEditMode() {
  if (editMode.value === 'editing') {
    editMode.value = 'viewing';
  } else {
    editMode.value = 'editing';
  }
}

function handleEditMode() {
  var headings = ['h1', 'h2', 'h3', 'h4', 'pre', 'p'];
  console.log(editMode.value);
  if (editMode.value === 'editing') {
    for (var heading of headings) {
      var headingAll = document.getElementsByTagName(heading);
      if (headingAll.length > 0) {
        for (var element of headingAll) {
          element.onmouseover = function() {
            this.style.border = "1px solid white";
          }
          element.onmouseout = function() {
            this.style.border = "none";
          }
          element.onclick = function() {
            if (currentToReplace !== null) {
              makeLastEditView();
            }
            currentEdit = this;
            if (this.tagName === 'PRE' || this.tagName === 'P') {
              currentEditCodeTag = this.firstChild.className;
              var input = document.createElement('textarea');
              input.classList.add('ignoreCSS');
              input.style.display = this.style.display;
              input.style.width = "100%";
              var fontSize = parseFloat(window.getComputedStyle(this, null).getPropertyValue('font-size')).toString();
              input.style.fontSize = fontSize;
              input.style.height = window.getComputedStyle(this, null).getPropertyValue('height')
              input.style.textAlign = this.style.textAlign;
              input.value = this.innerHTML;
              this.parentNode.replaceChild(input, this);
              input.focus();
              currentToReplace = input;
            }
            else {
              var input = document.createElement('input');
              input.style.display = this.style.display;
              input.style.backgroundColor = "black";
              input.style.color = "white";
              input.style.width = "100%";
              var fontSize = parseFloat(window.getComputedStyle(this, null).getPropertyValue('font-size')).toString();
              input.style.fontSize = fontSize;
              input.style.textAlign = this.style.textAlign;
              input.value = this.innerHTML;
              this.parentNode.replaceChild(input, this);
              input.focus();
              currentToReplace = input;
            }
          }
        }
      }
    }
  }
  else {
    makeLastEditView();
    for (var heading of headings) {
      var headingAll = document.getElementsByTagName(heading);
      if (headingAll.length > 0) {
        for (var element of headingAll) {
          element.onmouseover = null;
          element.onmouseout = null;
          element.onclick = null;
        }
      }
    }
  }
}

handleEditMode();

editMode.oninput = function() {
  handleEditMode();
}

document.getElementById('noInList').onclick = function(e) {
  e.preventDefault();
  console.log(document.activeElement);
  if (document.activeElement.tagName.toUpperCase() === 'INPUT') {
    if (document.activeElement.classList.contains('noIncludeInList')) {
      document.activeElement.classList.remove('noIncludeInList')
    } else {
      document.activeElement.classList.add('noIncludeInList')
    }
    console.log(document.activeElement.classList);
  }
}
