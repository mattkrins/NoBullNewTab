var defaultOptions = {};
defaultOptions.SGSB = {
	value: true,
	type: "checkbox",
	text: 'Show Google search bar',
	child: 'SAC'
};
defaultOptions.SAC = {
	parent: "SGSB",
	value: false,
	type: "checkbox",
	text: 'Allow search bar auto-complete'
};
defaultOptions.BGCOL = {
	type: "text",
	value: "#F2F2F2",
	text: 'Background color (hex)'
};
defaultOptions.UBG = {
	value: false,
	type: "checkbox",
	text: 'Use background image',
	child: ['BG','BGURL']
};
defaultOptions.BG = {
	parent: "UBG",
	type: "file",
	text: 'Upload background image',
	subtext: '< 5MB'
};
defaultOptions.BGURL = {
	parent: "UBG",
	type: "text",
	value: "",
	text: 'Background URL',
	subtext: 'Note: Must be from Imgur'
};

var storage = chrome.storage.local
if(chrome.storage.sync){ storage = chrome.storage.sync }

function optionChanged(key, value){
	if (key=="BGURL"){
		resetBackground();
		syncOptions(function(){ loadBackground(); });
	}
	if (key=="UBG"){
		document.body.style.backgroundImage = "none";
		syncOptions(function(){ if(getOption('UBG')){loadBackground();} });
	}
	if (key=="BGCOL"){
		document.body.style.backgroundColor = "none";
		syncOptions(function(){ if(getOption('BGCOL')){loadBackgroundCol();} });
	}
}

function byteCount(s) { return encodeURI(s).split(/%..|./).length - 1; }
function resetBackground(){ localStorage.removeItem("BGDATA"); localStorage.removeItem("BGURL");document.body.style.backgroundImage = "none"; }
function loadBackground(loop){
	var imageData = localStorage.getItem('BGDATA');
	var imageURL = localStorage.getItem('BGURL');
	var background = getOption('BGURL');
	if(imageData){
		if(imageURL!=background){
			imageData = false; imageURL = false;
			resetBackground();
		}else{
			document.body.style.backgroundImage = "url('"+imageURL+"')";
			return true;
		}
	}
	if(loop){return false;}
	if(!validURL(background)){return console.warn("background URL invalid.");}
	URLtoBase64(background,function(dataUrl) {
		if(!dataUrl){return false;}
		if(byteCount(dataUrl)>5042880){return false;}
		localStorage.setItem("BGDATA", dataUrl);
		localStorage.setItem("BGURL", background);
		return loadBackground(true);
	})
}

function loadBackgroundCol(){
	var col = getOption('BGCOL');
	var prefix = '#';
	if (col.substr(0, prefix.length) !== prefix)
	{
		col = prefix + col;
	}
	document.body.style.backgroundColor = col;
}

function URLtoBase64(src, callback, outputFormat) {
	var img = new Image();
	img.crossOrigin = 'Anonymous';
	img.onload = function() {
		var canvas = document.createElement('CANVAS');
		var ctx = canvas.getContext('2d');
		var dataURL;
		canvas.height = this.height;
		canvas.width = this.width;
		ctx.drawImage(this, 0, 0);
		dataURL = canvas.toDataURL(outputFormat);
		callback(dataURL);
	};
	img.src = src;
	if (img.complete || img.complete === undefined) { img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="; img.src = src; }
}

function validURL(str) {var pattern = new RegExp('^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$','i');return pattern.test(str);}
chrome.storage.onChanged.addListener(function(changed){ for (var key in changed) { optionChanged(key, changed[key].newValue); } })
var savedOptions = JSON.parse(JSON.stringify(defaultOptions));
function getOption(key){return savedOptions[key].value;}
function syncOptions(callBack){
	var get = {};
	for (var key in savedOptions) { get[key] = savedOptions[key].value; }
	storage.get(get, function(got) {
		for (var key in got) {
			savedOptions[key].value = got[key]
		}
		if (callBack) {
			callBack(savedOptions);
		}
	})
}
document.addEventListener('DOMContentLoaded', function () {
	syncOptions(function(){
		if(getOption('UBG')){loadBackground();}
		if(getOption('BGCOL')){loadBackgroundCol();}
	});
});