var socket = io();
socket.on('redirect', function(pageHref) {
  window.location.href = pageHref;
})
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
var headings = ['h1', 'h2', 'h3', 'h4', 'pre', 'p'];

var currentEdit = null;
var currentToReplace = null;
var currentEditCodeTag = null;

var currentCodeBlockExecs = [];

var lastInputSelect = null;

var userID;
var topic;

initializeFirebase();

String.prototype.replaceAll = function(toReplace, replaceWith) {
  var replaced = this.replace(toReplace, replaceWith);
  while (replaced.includes(toReplace)) {
    replaced = replaced.replace(toReplace, replaceWith);
  }
  return replaced;
}

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

function runBlock(block) {
  var textarea = document.createElement('textarea');
  textarea.classList.add('ignoreCSS');
  textarea.readOnly = true;
  textarea.style.width = '100%';
  textarea.style.resize = 'none';
  var println = function(stuffToPrint) {
    textarea.value += stuffToPrint + '\n';
  }
  try {
    eval(block.textContent.replaceAll('console.log', 'println'));
  } catch (e) {
    textarea.value += e.message + '\n';
  }
  insertAfter(textarea, block);
  currentCodeBlockExecs.push(textarea);
}

function CopyToClipboard(containerid) {
  if (document.selection) {
    var range = document.body.createTextRange();
    range.moveToElementText(document.getElementById(containerid));
    range.select().createTextRange();
    document.execCommand("copy");
  } else if (window.getSelection) {
    var range = document.createRange();
    range.selectNode(document.getElementById(containerid));
    window.getSelection().addRange(range);
    document.execCommand("copy");
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

function highlightAll() {
  Prism.highlightAll();
  for (var pre of document.getElementsByTagName('pre')) (function(pre) {
    if (pre.classList.contains('language-javascript') || pre.classList.contains('language-js')) {
      if (!pre.classList.contains('sectionTextArea-textArea')) {
        pre.classList.add('sectionTextArea-textArea');

        var newDiv = document.createElement('div');
        pre.parentNode.insertBefore(newDiv, pre);

        newDiv.classList.add('sectionTextArea-outer');
        pre.remove();

        var newButton = document.createElement("button");
        newButton.innerHTML = "Run";
        newButton.classList.add('sectionTextArea-AlignToRight');
        newButton.classList.add('isButton');
        newButton.onclick = function() {
          runBlock(pre);
        }

        newDiv.appendChild(newButton);
        newDiv.appendChild(pre);
      }
      else {
        pre.previousSibling.onclick = function() {
          runBlock(pre);
        }
      }
    }
  })(pre)
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

function parseTextArea(content, sectDiv) {
  var inCodeBlock = false;
  var language = 'javascript';
  var codeBlock = '';

  var listElements = [];
  var listIsOrdered = false;
  console.log(content);

  for (var line of content) {
    var toCreate;
    if (!inCodeBlock) {
      if (listElements.length > 0 && (listIsOrdered && !(!isNaN(line.substring(0, 1)) && line.substring(1, 3) === '. ')) || (!listIsOrdered && line.substring(1, 2) !== '- ')) {
        var parent = listIsOrdered ? document.createElement('ol') : document.createElement('ul');
        for (var listElement of listElements) {
          var li = document.createElement('li');
          li.innerHTML = listElement;
          parent.appendChild(li);
        }
        sectDiv.appendChild(parent);
        listElements = [];
      }

      if (line.substring(0,2) === '##') {
        toCreate = document.createElement('h3');
        toCreate.innerHTML = line.substring(2);
      } else if (line.substring(0,1) === '#') {
        toCreate = document.createElement('h2');
        toCreate.innerHTML = line.substring(1);
      } else if (!isNaN(line.substring(0, 1)) && line.substring(1, 3) === '. ') {
        if (listElements.length > 0 || line.substring(0, 1) === '1') {
          listElements.push(line.substring(3));
          listIsOrdered = true;
        } else {
          toCreate = document.createElement('p');
          toCreate.innerHTML = line;
        }
      } else if (line.substring(0, 2) === '- ') {
        listElements.push(line.substring(2));
        listIsOrdered = false;
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
      if (toCreate !== undefined)
        sectDiv.appendChild(toCreate);
    } else {
      if (line.includes('```')) {
        inCodeBlock = false;
        var code = '<pre class="language-' + language + '" data-src-loaded="" data-src="../resources/prism/prism.js"><code class="language-' + language + '">' + codeBlock.substring(0, codeBlock.length-1) + '</code></pre>'
        sectDiv.innerHTML += code;
        codeBlock = '';
      } else {
        if (language === 'markup') {
          line = line.replaceAll('<', '&lt;');
        }
        codeBlock += line + '\n';
      }
    }
  }
  if (listElements.length > 0) {
    var parent = listIsOrdered ? document.createElement('ol') : document.createElement('ul');
    for (var listElement of listElements) {
      var li = document.createElement('li');
      li.innerHTML = listElement;
      parent.appendChild(li);
    }
    sectDiv.appendChild(parent);
    listElements = [];
  }
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

  main.appendChild(fieldset);

  var createButton = document.createElement('button');
  createButton.innerHTML = 'Add Section';
  createButton.style.display = 'inline-block';
  createButton.onclick = function(e) {
    e.preventDefault();

    var sectDiv = document.createElement('section');
    sectDiv.id = legendInput.value;

    var h1 = document.createElement('h1');
    h1.innerHTML = legendInput.value;
    h1.style.textAlign = 'center';
    sectDiv.appendChild(h1);

    var content = contentIn.value.split('\n');

    parseTextArea(content, sectDiv);

    main.replaceChild(sectDiv, fieldset);
    highlightAll();
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

function savePageData() {
  if (editMode.value === 'editing') {
    clearAllExecs();
    reverseEditMode();
    handleEditMode();
  }
  socket.emit('changeSiteData', {userID: userID, topic: topic, content: main.innerHTML});
}

function changeAttr(ids, attr, val) {
  for (var id of ids) {
    document.getElementById(id).setAttribute(attr, val);
  }
}

firebase.auth().onAuthStateChanged(user => {
  if(user) {
    userID = user.uid;
    topic = window.location.href.split('?')[1].split('#')[0];
    document.getElementById('pageTitle').innerHTML = topic;

    socket.emit('isUserValid', userID, topic);
    socket.on('userValidResults', function(result) {
      console.log(result);
      if (result === 'unauthorized') {
        window.location.href = "main.html";
      } else {
        refreshHeadings(true);
        topBar.style.display = 'inline-block';

        socket.emit('getSiteData', user.uid, topic);
        socket.on('updateSiteData', function(innerHTML) {
          main.innerHTML = innerHTML;
          highlightAll();
          refreshHeadings(true);
        })

        var disableButtons;
        if (result === 'editor') {
          document.getElementById('saveButton').title = 'Since you are not the owner, saving your changes will only affect the way you view this page';
          disableButtons = ["renameButton","publishButton","deletePageButton"];
        } else {
          disableButtons = ["updateRequest"];
        }
        changeAttr(disableButtons, 'disabled', true);
        changeAttr(disableButtons, 'onclick', null);

        document.getElementById('saveButton').onclick = function(e) {
          e.preventDefault();
          savePageData();
        }

        Mousetrap.bind(['ctrl+s', 'command+s'], function(e) {
          e.preventDefault();
          savePageData();
        });
      }
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
      highlightAll();
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

function changeEditModeToView() {
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

function changeEditModeToEdit() {
  $(document).keyup(function(e) {
    if (e.key === "Escape") {
      makeLastEditView();
      console.log('dude');
    }
  });
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
            input.value = this.textContent;
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

function handleEditMode() {
  if (editMode.value === 'editing') {
    changeEditModeToEdit();
  }
  else {
    changeEditModeToView();
  }
}

handleEditMode();

editMode.oninput = function() {
  handleEditMode();
}

function insertAfter(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function insertBefore(newNode, referenceNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

var inBetweenHr = null;

function insertElementView(after) {
  if (editMode.value === 'editing') {
    makeLastEditView();
  }
  for (var heading of headings) {
    var headingAll = document.getElementsByTagName(heading);
    if (headingAll.length > 0) {
      for (var element of headingAll) {
        element.onmouseover = function() {
          inBetweenHr = document.createElement('hr');
          inBetweenHr.classList.add('line');
          if (after)
            insertAfter(inBetweenHr, this);
          else
            insertBefore(inBetweenHr, this);
        }
        element.onmouseout = function() {
          inBetweenHr.remove();
        }
        element.onclick = function() {
          changeEditModeToView();
          var fieldset = document.createElement('fieldset');
          fieldset.style.marginBottom = '90px';

          var contentIn = document.createElement('textarea');
          contentIn.classList.add('ignoreCSS');
          contentIn.classList.add('contentInCSS');

          inBetweenHr.parentNode.replaceChild(fieldset, inBetweenHr);

          var createButton = document.createElement('button');
          createButton.innerHTML = 'Add Section';
          createButton.style.display = 'inline-block';
          createButton.onclick = function(e) {
            e.preventDefault();

            var tempDiv = document.createElement('div');

            var content = contentIn.value.split('\n');

            parseTextArea(content, tempDiv);

            for (var i = tempDiv.children.length-1; i >= 0; i--) {
              insertAfter(tempDiv.children[i], fieldset);
            }
            fieldset.remove();

            highlightAll();
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

          fieldset.style.marginBottom = '0px';
        }
      }
    }
  }
}

document.getElementById('afterSection').onclick = function(e) {
  e.preventDefault();
  insertElementView(true);
}

document.getElementById('beforeSection').onclick = function(e) {
  e.preventDefault();
  insertElementView(false);
}

document.getElementById('deleteElement').onclick = function(e) {
  e.preventDefault();
  if (editMode.value === 'editing') {
    makeLastEditView();
  }
  for (var heading of headings) {
    var headingAll = document.getElementsByTagName(heading);
    if (headingAll.length > 0) {
      for (var element of headingAll) {
        element.onmouseover = function() {
          this.style.border = "1px solid rgb(190, 140, 140)";
        }
        element.onmouseout = function() {
          this.style.border = "none";
        }
        element.onclick = function() {
          this.remove();
          refreshHeadings();
        }
      }
    }
  }
  document.getElementById('exitModeButton').style.display = 'block';
  document.getElementById('exitModeButton').onclick = function() {
    changeEditModeToView();
    document.getElementById('exitModeButton').style.display = 'none';
  }
}

document.getElementById('renameButton').onclick = function(e) {
  e.preventDefault();
  document.getElementById('newName').value = topic;
  document.getElementById('renameForm').style.display = 'block';
  document.getElementById('confirmRename').onclick = function(e2) {
    e2.preventDefault();
    var newName = document.getElementById('newName').value;
    socket.emit('rename', userID, topic, newName);
    socket.on('renameCompleted', function() {
      window.location.href = 'tutorialpage.html?' + newName;
    })
  }
  document.getElementById('cancelRename').onclick = function(e3) {
    e3.preventDefault();
    document.getElementById('renameForm').style.display = 'none';
  }
}

document.getElementById('publishButton').onclick = function(e) {
  e.preventDefault();
  document.getElementById('publishForm').style.display = 'block';

  document.getElementById('publishCancel').onclick = function(e2) {
    e2.preventDefault();
    document.getElementById('publishForm').style.display = 'none';
  }

  document.getElementById('publishPage').onclick = function(e2) {
    e2.preventDefault();
    socket.emit('publishPage', userID, topic);
  }
}

//------------
var difficulties = ['Beginner', 'Intermediate', 'Experienced', 'Advanced', 'Professional'];
var diffSlider = document.getElementById('difficultySlider');
diffSlider.oninput = function() {
  document.getElementById('difficultyMode').innerHTML = difficulties[parseInt(diffSlider.value)];
}
var prereqIn = document.getElementById('prereqIn');
prereqIn.onkeypress = function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    var prereqDiv = document.createElement('div');
    prereqDiv.classList.add('prereq');
    prereqDiv.innerHTML = prereqIn.value;

    var prereqRemoveButton = document.createElement('button');
    prereqRemoveButton.classList.add('prereqRemove');
    prereqRemoveButton.classList.add('noButtonCSS');
    prereqRemoveButton.innerHTML = 'X';
    prereqRemoveButton.onclick = function() {
      prereqDiv.remove();
    }
    prereqDiv.appendChild(prereqRemoveButton);

    document.getElementById('prereqDiv').appendChild(prereqDiv);

    prereqIn.value = '';
  }
}
//------------

function clearAllExecs() {
  for (var exec of currentCodeBlockExecs) {
    exec.remove();
  }
  currentCodeBlockExecs = [];
}

document.getElementById('clearAllExecs').onclick = function(e) {
  e.preventDefault();
  clearAllExecs();
}

document.getElementById('runBlock').onclick = function(e) {
  e.preventDefault();
  var allpre = document.getElementsByTagName('pre');
  for (var element of allpre) {
    element.onmouseover = function() {
      this.style.border = "1px solid rgb(140, 190, 143)";
    }
    element.onmouseout = function() {
      this.style.border = "none";
    }
    element.onclick = function() {
      runBlock(this);
    }
  }
  document.getElementById('exitModeButton').style.display = 'block';
  document.getElementById('exitModeButton').onclick = function() {
    changeEditModeToView();
    document.getElementById('exitModeButton').style.display = 'none';
  }
}

document.getElementById('duplicateButton').onclick = function(e) {
  e.preventDefault();
  socket.emit('duplicate', userID, topic);
}

document.getElementById('deletePageButton').onclick = function(e) {
  e.preventDefault();
  socket.emit('deletePage', userID, topic);
}

document.getElementById('updateRequest').onclick = function(e) {
  e.preventDefault();
  savePageData();
  socket.emit('sendUpdateRequest', userID, topic);
}