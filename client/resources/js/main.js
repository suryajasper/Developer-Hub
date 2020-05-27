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
  var sectDiv = document.createElement('div');

  var fieldset = document.createElement('fieldset');
  fieldset.style.marginBottom = '350px';
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
  var newDropdown = dropdown('Add new element', ['<h2>heading 1</h2>', '<p class = "big">heading 2</p>', '<p class = "medium">large text</p>', '<p>normal text</p>', '<p style = "color: blue;"><u>link<u></p>', '<code>code</code>', 'unordered list', 'ordered list', 'end list'], ['Heading 1', 'Heading 2', 'Large text', 'Normal text', null, null, null, null, null]);
  var dropdiv = newDropdown.dd;
  var anchors = newDropdown.aa;
  console.log(anchors);

  var elementParams = []; // arr of dicts
  var elementTypes = [];

  for (var anchor of anchors) {
    anchor.onclick = function(e) {
      e.preventDefault();
      var anchparams = {};
      if (this.innerHTML === '<code>code</code>') {
        anchparams['code'] = document.createElement('textarea');
      } else if (this.innerHTML === '<p>normal text</p>') {
        anchparams['content'] = document.createElement('textarea');
      } else if (this.innerHTML === '<p style="color: blue;"><u>link<u></u></u></p>') {
        anchparams['name'] = document.createElement('input');
        anchparams['name'].type = 'text';
        anchparams['name'].style.display = 'inline-block';
        anchparams['link'] = document.createElement('input');
        anchparams['link'].style.display = 'inline-block';
        anchparams['link'].type = 'text';
      } else if (this.innerHTML === 'unordered list' || this.innerHTML === 'ordered list') {
        anchparams['legend'] = document.createElement('h2');
        anchparams['legend'].classList.add('listLegend');
        anchparams['legend'].innerHTML = '<span>Start of new ' + this.innerHTML + '</span>';
      } else if (this.innerHTML === 'end list') {
        anchparams['legend'] = document.createElement('h2');
        anchparams['legend'].classList.add('listLegend');
        anchparams['legend'].innerHTML = '<span>End of list</span>';
      } else {
        anchparams['content'] = document.createElement('input');
        anchparams['content'].type = "text";
      }
      var type = this.innerHTML;
      for (var key of Object.keys(anchparams)) {
        if (this.innerHTML !== 'unordered list' && this.innerHTML !== 'ordered list') {
          if (this.id !== "" && this.id !== null) {
            anchparams[key].placeholder = this.id;
          } else {
            anchparams[key].placeholder = 'content';
          }
        }
        fieldset.insertBefore(anchparams[key], dropdiv);
      }
      elementTypes.push(this.innerHTML);
      elementParams.push(anchparams);
    }
  }

  var createSection = document.createElement('button');
  createSection.innerHTML = 'Create Section';
  createSection.onclick = function() {
    var section = document.createElement('section');
    section.id = legendInput.value;
    var h1LegendHeader = document.createElement('h1');
    h1LegendHeader.innerHTML = legendInput.value;
    h1LegendHeader.style.textAlign = 'center';
    section.appendChild(h1LegendHeader);

    var stringToAppend = '';

    var startedParsingOrderedList = false;
    var startedParsingUnorderedList = false;

    for (var i = 0; i < elementTypes.length; i++) {
      var elementString = null;
      console.log(elementTypes[i]);
      console.log(elementParams[i]);
      switch (elementTypes[i]) {
        case '<code>code</code>':
          elementString = '<pre class="language-javascript" data-src-loaded="" data-src="../resources/prism/prism.js"><code class="language-javascript">' + elementParams[i]['code'].value + '</code></pre>';
          break;
        case '<h2>heading 1</h2>':
          elementString = '<h2>' + urlify(elementParams[i]['content'].value) + '</h2>';
          break;
        case '<p class="big">heading 2</p>':
          elementString = '<p class = "big">' + urlify(elementParams[i]['content'].value) + '</p>';
          break;
        case '<p class="medium">large text</p>':
          elementString = '<p class = "medium">' + urlify(elementParams[i]['content'].value) + '</p>';
          break;
        case '<p>normal text</p>':
          elementString = '<p>' + urlify(elementParams[i]['content'].value) + '</p>';
          break;
        case '<p style="color: blue;"><u>link<u></u></u></p>':
          elementString = '<a href = "' + elementParams[i]['link'].value + '">' + elementParams[i]['name'].value + '</a>';
          break;
        case 'unordered list':
          elementString = '<ul>';
          startedParsingUnorderedList = true;
          break;
        case 'ordered list':
          elementString = '<ol>';
          startedParsingOrderedList = true;
          break;
        case 'end list':
          if (startedParsingOrderedList)
            elementString = '</ol>';
          else if (startedParsingUnorderedList)
            elementString = '</ul>';
          startedParsingOrderedList = false;
          startedParsingUnorderedList = false;
          break;
      }
      console.log(elementString);
      if ((startedParsingOrderedList && elementString !== '<ol>') || (startedParsingUnorderedList && elementString !== '<ul>')) {
        elementString = '<li>' + elementString + '</li>';
      }
      stringToAppend += elementString;
    }

    section.innerHTML += stringToAppend;
    main.replaceChild(section, fieldset);
    Prism.highlightAll();
    handleEditMode();
    refreshHeadings();
  };

  fieldset.appendChild(dropdiv);
  fieldset.appendChild(createSection);
  main.appendChild(fieldset);
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
    })
  }
});

function makeLastEditView() {
  if (currentEdit !== null) {
    currentEdit.style.border = 'none';
    if (currentToReplace !== null) {
      currentEdit.innerHTML = currentToReplace.value;
      console.log(currentToReplace);
      if (currentToReplace.parentNode !== null)
        currentToReplace.parentNode.replaceChild(currentEdit, currentToReplace);
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
