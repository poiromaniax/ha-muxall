<?xml version="1.1"?>
<!-- NOTE: Any NULL bytes in requests and responses are preserved within this output, even though this strictly breaks the XML syntax. If your XML parser rejects the NULL bytes then you will need to remove or replace these bytes before parsing. Alternatively, you can use the option to base64-encode requests and responses. -->
<!DOCTYPE items [
<!ELEMENT items (item*)>
<!ATTLIST items burpVersion CDATA "">
<!ATTLIST items exportTime CDATA "">
<!ELEMENT item (time, url, host, port, protocol, method, path, extension, request, status, responselength, mimetype, response, comment)>
<!ELEMENT time (#PCDATA)>
<!ELEMENT url (#PCDATA)>
<!ELEMENT host (#PCDATA)>
<!ATTLIST host ip CDATA "">
<!ELEMENT port (#PCDATA)>
<!ELEMENT protocol (#PCDATA)>
<!ELEMENT method (#PCDATA)>
<!ELEMENT path (#PCDATA)>
<!ELEMENT extension (#PCDATA)>
<!ELEMENT request (#PCDATA)>
<!ATTLIST request base64 (true|false) "false">
<!ELEMENT status (#PCDATA)>
<!ELEMENT responselength (#PCDATA)>
<!ELEMENT mimetype (#PCDATA)>
<!ELEMENT response (#PCDATA)>
<!ATTLIST response base64 (true|false) "false">
<!ELEMENT comment (#PCDATA)>
]>
<items burpVersion="2025.6.5" exportTime="Tue Jul 22 10:31:45 IDT 2025">
  <item>
    <time>Tue Jul 22 10:25:17 IDT 2025</time>
    <url><![CDATA[http://192.168.0.9/libtools.js]]></url>
    <host ip="192.168.0.9">192.168.0.9</host>
    <port>80</port>
    <protocol>http</protocol>
    <method><![CDATA[GET]]></method>
    <path><![CDATA[/libtools.js]]></path>
    <extension>js</extension>
    <request base64="false"><![CDATA[GET /libtools.js HTTP/1.1
Host: 192.168.0.9
Accept-Language: en-US,en;q=0.9
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
Sec-Purpose: prefetch;prerender
Accept: */*
Purpose: prefetch
Referer: http://192.168.0.9/
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

]]></request>
    <status>200</status>
    <responselength>9464</responselength>
    <mimetype>script</mimetype>
    <response base64="false"><![CDATA[HTTP/1.1 200 OK
Content-Length: 9292
Content-Type: application/javascript
Content-Disposition: inline; filename="libtools.js"
Connection: close
Accept-Ranges: none

"use strict";

var messageBuffer = "";
var pollTimer = null;
var flashElementTimer = null;
var gotoNextKey = true;

//Client States
var OFFLINE = 0;
var REQUEST	= 1;
var REGISTER = 2;
var SYNC = 3;
var WAIT = 4;
var READY = 5;

var ON = 1;
var OFF = 0;

var beep = new Audio("beep2.wav"); // buffers automatically when created
//************************ Data Manipulation Functions *************************************//


function Beep(count){	
	for (var i = 1; i <=  count; i++){
		setTimeout(function(){ beep.play() },i*1000);
	}
}

function updateStatusByForm(formId){
	log("Update Status by Form called...");
	$("#" + formId + " .status").each(function(){		
		log("this.id = " + this.id);
		var key = this.id;
		if (key == null || key == ""){
			return gotoNextKey;
		}
		var newValue = getVarFromBuffer(key);
		if ((newValue != null) || (newValue != "")){
			var id = ("#" + key);
			var isDataValue = $(id).data("value");
			if (isDataValue != null){
				log("Updating WebPage Status: key = " + key + " newValue = " + newValue);
				$(id).attr("data-value",newValue);
				$(id).text(newValue);
			}
			//sessionStorage.setItem(key, newValue);
		}
	});
}

function updateTextValuesByForm(formId){
	//log("Update Values called...");
	//var arrIds = [];
	$("#" + formId + " input[id]").each(function(){		
		var key = this.id;
		var newValue = getVarFromBuffer(key);
		log("updateTextValuesByForm:formId = " + formId + " key = " + key + " newValue = " + newValue);
		if (newValue != null){
			log("Updating Text value: key = " + key + " newValue = " + newValue);
			$(this).val(newValue);
		}
	});
}

function updateCheckBoxesByForm(formId){
	//log("Update CheckBoxes called...");
	//var arrIds = [];
	$("#" + formId + " input:checkbox").each(function(){		
		var key = this.id;
		var val = getVarFromBuffer(key);
		log("updateCheckBoxesByForm:formId = " + formId + " id = " + key + " value = " + val);
		if (val){
			if (val == '1'){
				$('#' + key).prop("checked", true);
			} else {
				$('#' + key).prop("checked", false);
			}
		}		
	});
}

function updateSelectBoxById(selBxId){
	//log("Update updateSelectBoxById called...");	
	//$("#" + selBxId + " option:selected").removeAttr('selected');
	var val = getVarFromBuffer(selBxId);
	log("updateSelectBoxById selecting : name = " + selBxId + " value = " + val);
	//$("#" + selBxId + " option:[val=" + val + "]").prop('selected', true);
	$("#" + selBxId).val(val).prop('selected', true);
	//$("#" + selBxId + " option:[value=" + val + "]").val(val);
}

function updateRadioButtonsByName(name){
	//log("Update updateRadioButtonsByName called...");	
	//$("[name=" + name + "]").removeAttr('checked');
	var val = getVarFromBuffer(name);
	log("updateRadioButtonsByName: name = " + name + "value = " + val);
	$("input[name=" + name + "][value=" + val + "]").prop('checked', true);
}

function getIdsByForm(formId){
	log("getIdsByForm: formId = " + formId);
	var arrIds = [];
	$(formId + " input[id]").each(function(){		
		var key = this.id;
		var value = $(this).val();	
		log("getIdsByForm: id = " + key);
		arrIds[arrIds.length] = key; 			
	});
	return arrIds;
}

function getAllTextInputIds(){	
	var arrIds = [];
	$("input[type='text']").each(function(){
		var key = this.id;
		log("getAllTextInputIds: id = " + key);
		arrIds[arrIds.length] = key;
	});
	return arrIds;
}

function getVarFromKvp(key,csvKvp){
	if (csvKvp == null){
		return null;
	}
	var startKvp = csvKvp.search(key);
	if (startKvp == -1){
		return null;
	} else {	
		var endKvp = csvKvp.indexOf(",",startKvp);
		if (endKvp == -1){
			endKvp = csvKvp.length;
		}
		var kvp = csvKvp.substring(startKvp,endKvp);
		//log("Found key: " + key + " in kvp = " + kvp);
		if (kvp.search("=") > -1){
			var arrKvp = kvp.split("=",2);
			var value = arrKvp[1].trim();
			//log("Returning value = " + value);
			return value;
		} else {
			//log("Returning value = null");
			return null;
		}
	}
}

function getVarFromBuffer(key){
	if (messageBuffer == ""){
		return null;
	}
	var startKvp = messageBuffer.search(key);
	if (startKvp == -1){
		return null;
	} else {	
		var endKvp = messageBuffer.indexOf(",",startKvp);
		if (endKvp == -1){
			endKvp = messageBuffer.length;
		}
		var kvp = messageBuffer.substring(startKvp,endKvp);
		//log("Found key: " + key + " in kvp = " + kvp);
		if (kvp.search("=") > -1){
			var arrKvp = kvp.split("=",2);
			var value = arrKvp[1].trim();
			//log("Returning value = " + value);
			return value;
		} else {
			//log("Returning value = null");
			return null;
		}
	}
}

function getKeysFromBuffer(regex){
	if (messageBuffer == ""){
		return;
	}
	var result = null;
	var arrKeys	= [];
	var done = false;
	var endKey = 0;
	var startKey = messageBuffer.search(key);	
	if (startKey == -1){
		return null;
	} 
	
	while (!done){
		startKey = messageBuffer.indexOf(regex,endKey);
		if (startKey == -1){
			break;
		} 
		
		var endKey = messageBuffer.indexOf("=",startKey);
		if (endKey == -1){
			endKey = messageBuffer.length;
			done = true;
		}
		var key = messageBuffer.substring(startKey,endKey);
		//Split string in case it contains a comma.
		var splitKey = key.split(",",2);
		key = splitKey[0];
		
		arrKeys[arrKeys.length] = key.trim();
		
	}
	
	log("Returning arrKeys");
	return arrKeys;	
}

function stripCommand(cmd, input){
	var arrInput = input.split(cmd,2);
	return arrInput[1].trim();	
}


function pollForCmd(pollRate, state){
	var pollRate_ms = pollRate*1000;
	if (state == ON){
		if (pollTimer == null){
			log("Starting pollTimer Timer interval = " + pollRate_ms );
			pollTimer = setInterval(function(){getCommand()},pollRate_ms);
		} else {
			log("Resetting pollTimer interval = " + pollRate_ms );
			clearInterval(pollTimer);
			pollTimer = setInterval(function(){getCommand()},pollRate_ms);
		}
		
	} else {
		if (pollTimer == null){
			//Do nothing it is already off.
		} else {
			log("Stopping pollTimer Timer interval = " + pollRate_ms );
			clearInterval(pollTimer);
			pollTimer = null;
		}
	}		
}

function fadeInOutElement(elementId){
	$(elementId).fadeTo(800, 0.5, function() { $(elementId).fadeTo(800, 1); });
}

function flashElement(elementId,state){
	//
	var flashTime_ms = 2000;
	if (state == ON){
		if (flashElementTimer == null){
			//log("Starting flash Element interval = " + flashTime_ms );
			flashElementTimer = setInterval(function(){fadeInOutElement(elementId)},flashTime_ms);
		} else {
			//log("Resetting flash element interval = " + flashTime_ms );
			clearInterval(flashElementTimer);
			flashElementTimer = setInterval(function(){fadeInOutElement(elementId)},flashTime_ms);
		}
		
	} else {
		if (flashElementTimer == null){
			//Do nothing it is already off.
		} else {
			//log("Stopping flash element interval = " + flashTime_ms );
			clearInterval(flashElementTimer);
			flashElementTimer = null;
		}
	}
	
}

function checkConsole() {
	var cbStatus = sessionStorage.getItem("cbStatus");
	if (cbStatus == "1"){
		$("#console").show();
	} else {
		$("#console").hide();
		$("#console").val("");
	}
}

function updateWiFi(){
	console.log('updateWiFi called!');
	var strRSSI= sessionStorage.getItem("intRSSI");
	var intRSSI = parseInt(strRSSI);
	if (isNaN(intRSSI)){
		console.log('updateWiFi reports intRSSI isNaN: ', intRSSI);
		return;
	}	
	updateRSSI(intRSSI);	
}

function updateRSSI(wifiLevel){
	var bar1color = "lightgrey";
	var bar2color = "lightgrey";
	var bar3color = "lightgrey";
	var bar4color = "lightgrey";
	var bar5color = "lightgrey";
	
	if (wifiLevel <= -90){
		//1 red bar
		bar1color = "red";
		
	} else if (wifiLevel <= -80){
		//2 red bar
		bar1color = "orange";
		bar2color = "orange";
		
	} else if ((wifiLevel > -80) && (wifiLevel <= -70)){
		//3 bars
		bar1color = "yellowgreen";
		bar2color = "yellowgreen";
		bar3color = "yellowgreen";
		
	} else if ((wifiLevel > -70) && (wifiLevel <= -60)){
		//4  bars
		bar1color = "yellowgreen";
		bar2color = "yellowgreen";
		bar3color = "yellowgreen";
		bar4color = "yellowgreen";
		
	
	} else if ((wifiLevel > -60) && (wifiLevel <= -50)){
		//5  bars
		bar1color = "green";
		bar2color = "green";
		bar3color = "green";
		bar4color = "green";
		bar5color = "green";
	
	} else if (wifiLevel > -50){
		//5  bars
		bar1color = "green";
		bar2color = "green";
		bar3color = "green";
		bar4color = "green";
		bar5color = "green";
		
	}
	
	$( "#wifiBar1" ).attr("fill", bar1color);
	$( "#wifiBar2" ).attr("fill", bar2color);
	$( "#wifiBar3" ).attr("fill", bar3color);
	$( "#wifiBar4" ).attr("fill", bar4color);
	$( "#wifiBar5" ).attr("fill", bar5color);
	
}

function log(message) {
	  var cbStatus = sessionStorage.getItem("cbStatus");
		if (cbStatus == "1"){
			var console = $("#console");
			var existingText = console.val();
			var timeFromStart = new Date().getTime() - startTime;
			message =  timeFromStart + ": " + message;
			console.val(existingText + message + "\n");
			console.scrollTop(console[0].scrollHeight);
		}  else {
			$("#console").val("");
		}
}


]]></response>
    <comment></comment>
  </item>
</items>
