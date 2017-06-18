function Build(Element,Contents,Parent){
	var e = document.createElement(Element);
	if(Contents){e.innerHTML = Contents;}
	if(Parent){Parent.appendChild(e);}
	return e;
}
function setError(el,er){ if(er){el.style.color = "red";return;}el.removeAttribute("style"); }
function validHex(hex){ if(/^(#)?([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/.test(hex) == false) { return false; } return true; }
function Disable(id,is) { document.getElementById(id).disabled = is; }
function upload(base64URL) {
	console.log('Uploading...'	);
	Disable("BGURL", true);
	var base64 = base64URL.substring(base64URL.indexOf(",") + 1);
	Pace.track(function(){
	$.ajax({
		url: encodeURI("https://api.imgur.com/3/upload"),
		type: "POST",
		datatype: "json",
		crossDomain: true,
		data: {image: base64},
		success: function (data) {
			if(!data.success || !data.data || !data.data.link) {return console.error("Upload failed.");Disable("BGURL", false);}
			console.log(data.data.link);
			syncOption("BGURL", data.data.link);
			Disable("BGURL", false);
		},
		error: function (data) { console.error("Upload failed."); console.warn(data);Disable("BGURL", false); },
		beforeSend: function (xhr) {
			xhr.setRequestHeader("Authorization", "Client-ID " + "d7c68ae6a05965b");
		}
	});
	});
}

var storage = chrome.storage.local
if(chrome.storage.sync){ storage = chrome.storage.sync }


function syncOption(Key, Value){ var set = {}; set[Key] = Value; storage.set(set, function(t) { console.log('Synced.'); }); }
function onInputChange(input){
	if(!input.getAttribute('name')){return;}
	var Name = input.getAttribute('name');
	switch(input.type) {
		case "checkbox":
			syncOption(Name, input.checked);
			if(defaultOptions[Name].child){
				var children = {}
				if($.isArray(defaultOptions[Name].child)) { children = defaultOptions[Name].child; }else{ children[1] = defaultOptions[Name].child; }
				for (var key in children) {
					var child = document.getElementById(children[key]+"_tr");
					if(input.checked){child.style.visibility = 'visible';}else{child.style.visibility = 'hidden';}
				}
			}
		break;
		case "file":
			var reader  = new FileReader();
			reader.addEventListener("load", function () {
				upload(reader.result);
			}, false);
			if (input.files[0]) { reader.readAsDataURL(input.files[0]); }
		break;
		case "text":
			if(Name=="BGCOL" && input.value!='' && !validHex(input.value)){ setError(input, true); return; }
			if(Name=="BGURL" && input.value!='' && !input.value.includes("http://i.imgur.com/")){ setError(input, true); return; }
			setError(input, false);
			syncOption(Name, input.value);
		break;
		default: console.warn("Invalid Data.");
	}
}

function populateOptions(options){
	var inputs = document.querySelector(".inputs");
	for (var key in options) {
		var option = options[key]
		var tr = Build('tr');
		tr.setAttribute('id', key+"_tr");
		if(option.parent && options[option.parent]){
			if(options[option.parent].value){tr.style.visibility = 'visible';}else{tr.style.visibility = 'hidden';}
		}
		var text = option.text;
		if(option.subtext){
			text = text+"<br/><u>"+option.subtext+"</u>";
		}
		var td = Build('td',text,tr);
		var td2 = Build('td',false,tr);
		var div = Build('div',false,td2);
		var input = Build('input');
		input.setAttribute('name', key);
		input.setAttribute('id', key);
		if(option.type){
			input.setAttribute('type', option.type);
			switch(option.type) {
				case "file":
					input.setAttribute('accept', "image/*");
					var label = Build('label',"Choose a file");
					label.setAttribute('for', key);
				break;
				case "text":
					if(option.value){input.setAttribute('value', option.value);}
				break;
				case "checkbox":
					if(option.value){input.setAttribute('checked', 'true');}
				break;
			}
		}
		div.appendChild(input);
		if(label){div.appendChild(label);label=false;}
		var span = Build('span',false,div);
		inputs.appendChild(tr);
		input.addEventListener('change', function () {
			onInputChange(this);
		});
	}
	var tr2 = Build('tr');
	var td3 = Build('td',false,tr2);
	td3.setAttribute('colspan', '2');
	inputs.appendChild(tr2);
}

document.addEventListener('DOMContentLoaded', function () {
	if(!defaultOptions){return console.error("Critical Load Error.");}
	syncOptions(function(newOptions){
		populateOptions(newOptions);
	});
	document.querySelector('.close').addEventListener('click', function () {
		window.history.back();
	});
});

