class ElementHTML {
  constructor(name, start, end) {
    this.name = name;
    this.start = start;
    this.end = end;
  }
  makeTag(content) {
    var doc = new DOMParser().parseFromString(this.start + content + this.end, "text/xml");
    return doc.firstChild;
  }
  static makeTagFromElement(element, content) {
    var doc = new DOMParser().parseFromString(element.start + content + element.end, "text/xml");
    return doc.firstChild;
  }
  static makeTagFromString(elementstr) {
    var doc = new DOMParser().parseFromString(elementstr, "text/xml");
    return doc.firstChild;
  }
}

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

function insertTab(o, e)
{
  console.log('inserting tab');
	var kC = e.keyCode ? e.keyCode : e.charCode ? e.charCode : e.which;
	if (kC == 9 && !e.shiftKey && !e.ctrlKey && !e.altKey)
	{
		var oS = o.scrollTop;
		if (o.setSelectionRange)
		{
			var sS = o.selectionStart;
			var sE = o.selectionEnd;
			o.value = o.value.substring(0, sS) + "  " + o.value.substr(sE);
			o.setSelectionRange(sS + 1, sS + 1);
			o.focus();
		}
		else if (o.createTextRange)
		{
			document.selection.createRange().text = "  ";
			e.returnValue = false;
		}
		o.scrollTop = oS;
		if (e.preventDefault)
		{
			e.preventDefault();
		}
		return false;
	}
	return true;
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

function refreshHeadings() {
  $('#sidenav').empty();
  for (var i = 0; i < h1.length; i++) {
    h1[i].id = h1[i].innerHTML;
    var a = document.createElement('a');
    a.href = '#' + h1[i].innerHTML;
    a.innerHTML = h1[i].innerHTML;
    sidenav.appendChild(a);
  }
  sidenav.appendChild(createNewDivAnchor());
}
refreshHeadings();

function dropdown(name, values) {
  var dropdiv = document.createElement('div');
  dropdiv.classList.add('dropdown');

  var dropbtn = document.createElement('button');
  dropbtn.innerHTML = name;
  dropbtn.classList.add('dropbtn');

  var dropcnt = document.createElement('div');
  dropcnt.classList.add('dropdown-content');

  var arrA = [];

  for (var val of values) {
    var a = document.createElement('a');
    a.innerHTML = val;
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
  var newDropdown = dropdown('Add new element', ['<h2>heading 1</h2>', '<h3>heading 2</h3>', '<h4>heading 3</h4>', '<p>text</p>', 'link', 'code']);
  var dropdiv = newDropdown.dd;
  var anchors = newDropdown.aa;
  console.log(anchors);

  var elementParams = []; // arr of dicts
  var elementTypes = [];

  for (var anchor of anchors) {
    anchor.onclick = function(e) {
      e.preventDefault();
      var anchparams = {};
      if (this.innerHTML === 'code') {
        anchparams['code'] = document.createElement('textarea');
      } else if (this.innerHTML === 'link') {
        anchparams['name'] = document.createElement('input');
        anchparams['name'].type = 'text';
        anchparams['name'].style.display = 'inline-block';
        anchparams['link'] = document.createElement('input');
        anchparams['link'].type = 'text';
      } else if (this.innerHTML === '<p>text</p>') {
        anchparams['content'] = document.createElement('textarea');
      }
      else {
        anchparams['content'] = document.createElement('input');
        anchparams['content'].type = "text";
      }
      var type = this.innerHTML;
      for (var key of Object.keys(anchparams)) {
        anchparams[key].setAttribute('placeholder', key);
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

    for (var i = 0; i < elementTypes.length; i++) {
      var elementString;
      switch (elementTypes[i]) {
        case 'code':
          elementString = '<pre class="language-javascript" data-src-loaded="" data-src="../resources/prism/prism.js"><code class="language-javascript">' + elementParams[i]['code'].value + '</code></pre>';
          break;
        case '<h2>heading 1</h2>':
          elementString = '<h2>' + urlify(elementParams[i]['content'].value) + '</h2>';
          break;
        case '<h3>heading 2</h3>':
          elementString = '<h3>' + urlify(elementParams[i]['content'].value) + '</h3>';
          break;
        case '<h4>heading 3</h4>':
          elementString = '<h4>' + urlify(elementParams[i]['content'].value) + '</h4>';
          break;
        case '<p>text</p>':
          elementString = '<p>' + urlify(elementParams[i]['content'].value) + '</p>';
          break;
        case 'link':
          elementString = '<a href = "' + elementParams[i]['link'].value + '">' + elementParams[i]['name'].value + '</a>';
          break;
      }
      console.log(elementString);
      stringToAppend += elementString;
    }

    section.innerHTML += stringToAppend;
    main.replaceChild(section, fieldset);
    Prism.highlightAll();
    refreshHeadings();
  };

  fieldset.appendChild(dropdiv);
  fieldset.appendChild(createSection);
  main.appendChild(fieldset);
}
