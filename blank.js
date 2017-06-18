var isOpen = false;
document.addEventListener('DOMContentLoaded', function () {
	document.querySelector('.mouseover').addEventListener('mouseover', function () {
		if (isOpen){return false;} isOpen = true;
		document.querySelector(".sidebar").style.right = "0";
	});
	document.querySelector('.content').addEventListener('mouseover', function () {
		if (!isOpen){return false;} isOpen = false;
		document.querySelector(".sidebar").style.right = "-15%";
	});
	var linkList = document.querySelector(".list");
	function addLink(title,url,icon) {
		var newLink = document.createElement("a");
		newLink.innerHTML = title;
		newLink.href = url;
		if (icon) { newLink.style.backgroundImage = "url('"+icon+"')"; }
		newLink.setAttribute('sf-value', title);
		linkList.appendChild(newLink);
	}
	function addText(txtString) {
		var newText = document.createElement("h4");
		newText.innerHTML = txtString;
		linkList.appendChild(newText);
	}
	function isValid(t) { if (!t || !t.url || t.url=="chrome://newtab/" || !t.url.indexOf("view-source:") || !t.url.indexOf("chrome://")){return false;} return true; }
	chrome.sessions.getRecentlyClosed(function(sessions) {
		if(sessions.length<=0){ return addText("No Recent Tabs."); }
		for (var i = 0, len = sessions.length; i < len; i++) {
			if (!isValid(sessions[i].tab)){continue;}
			var tab = sessions[i].tab;
			var title = tab.url
			var icon = false
			if ( tab.favIconUrl && !tab.favIconUrl.includes("IDR_EXTENSIONS_FAVICON") ) { icon = tab.favIconUrl; }
			if (tab.title) { title = tab.title; }
			addLink(title, tab.url, icon);
		}
		!function(t,e,n){function o(e){var n=e.currentStyle||t.getComputedStyle(e,"");return n.display}function r(){for(var t=0;t<i.length;t++){a.push(o(i[t]));var e=i[t].getAttribute(l);e!==e.toLowerCase()&&i[t].setAttribute(l,e.toLowerCase())}}var u="sf-input",l="sf-value",a=[],i=e.querySelectorAll("["+l+"]");e.getElementById(u).onkeyup=function(){for(var t=this.value.toLowerCase(),e=0;e<i.length;e++)i[e].style.display="none",i[e].getAttribute(l).indexOf(t)>=0&&(i[e].style.display=a[e])},t.onload=r()}(window,document);
	});
	syncOptions(function(){
		if(getOption('SGSB')){
			var Form = document.createElement("form");
			Form.setAttribute('action', 'http://google.com/search');
			Form.setAttribute('class', 'search');
			var Input = document.createElement("input");
			Input.setAttribute('name', 'q');
			Input.setAttribute('type', 'text');
			Input.setAttribute('placeholder', 'Google Search');
			if(!getOption('SAC')){Input.setAttribute('autocomplete', 'off');}
			Form.appendChild(Input);
			document.querySelector(".content").appendChild(Form);
		}
	});
});