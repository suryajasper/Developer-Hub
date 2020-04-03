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

for (var i = 0; i < h1.length; i++) {
  h1[i].id = h1[i].innerHTML;
  var a = document.createElement('a');
  a.href = '#' + h1[i].innerHTML;
  a.innerHTML = h1[i].innerHTML;
  sidenav.appendChild(a);
}

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
  var newDropdown = dropdown('Add new element', ['heading 1', 'heading 2', 'heading 3', 'heading 4', 'code']);
  var dropdiv = newDropdown.dd;
  var anchors = newDropdown.aa;
  console.log(anchors);

  var elementsInSection = [];

  for (var anchor of anchors) {
    anchor.onclick = function(e) {
      e.preventDefault();
      var anchInput;
      if (this.innerHTML === 'code') {
        anchInput = document.createElement('textarea');
        /*anchInput.onkeydown = function(event) {
          insertTab(this, event);
        }*/
      }
      else {
        anchInput = document.createElement('input');
        anchInput.type = "text";
      }
      var type = this.innerHTML;
      anchInput.setAttribute('placeholder', type);
      elementsInSection.push(anchInput);
      fieldset.insertBefore(anchInput, dropdiv);
    }
  }

  var createSection = document.createElement('button');
  createSection.innerHTML = 'Create Section';
  createSection.onclick = function() {
    var section = document.createElement('section');
    section.id = legendInput.value;
    var h1LegendHeader = document.createElement('h1');
    h1LegendHeader.innerHTML = legendInput.value;
    section.appendChild(h1LegendHeader);

    for (var i = 0; i < elementsInSection.length; i++) {
      var elementString;
      if (elementsInSection[i].placeholder === 'code') {
        elementString = '<pre class="language-javascript" data-src-loaded="" data-src="../resources/prism/prism.js"><code class="language-javascript">' + elementsInSection[i].value + '</code></pre>';
      } else {
        switch (elementsInSection[i].placeholder) {
          case 'heading 1':
            elementString = '<h1>' + elementsInSection[i].value + '</h1>';
            break;
          case 'heading 2':
            elementString = '<h2>' + elementsInSection[i].value + '</h2>';
            break;
          case 'heading 3':
            elementString = '<h3>' + elementsInSection[i].value + '</h3>';
            break;
          case 'heading 4':
            elementString = '<h4>' + elementsInSection[i].value + '</h4>';
            break;
        }
      }
      section.appendChild(ElementHTML.makeTagFromString(elementString));
    }

    main.replaceChild(section, fieldset);
    Prism.highlightAll();
  };

  fieldset.appendChild(dropdiv);
  fieldset.appendChild(createSection);
  main.appendChild(fieldset);

  legendInput.click();
}

var newDiv = document.createElement('a');
newDiv.innerHTML = '+';
newDiv.style.textAlign = "center";
newDiv.onclick = function() {
  addNewSection();
}
sidenav.appendChild(newDiv);
