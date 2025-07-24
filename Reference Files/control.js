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
<items burpVersion="2025.6.5" exportTime="Tue Jul 22 10:32:12 IDT 2025">
  <item>
    <time>Tue Jul 22 10:25:17 IDT 2025</time>
    <url><![CDATA[http://192.168.0.9/control.js]]></url>
    <host ip="192.168.0.9">192.168.0.9</host>
    <port>80</port>
    <protocol>http</protocol>
    <method><![CDATA[GET]]></method>
    <path><![CDATA[/control.js]]></path>
    <extension>js</extension>
    <request base64="false"><![CDATA[GET /control.js HTTP/1.1
Host: 192.168.0.9
Accept-Language: en-US,en;q=0.9
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
Accept: */*
Referer: http://192.168.0.9/control.html
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

]]></request>
    <status>200</status>
    <responselength>39658</responselength>
    <mimetype>script</mimetype>
    <response base64="false"><![CDATA[HTTP/1.1 200 OK
Content-Length: 39486
Content-Type: application/javascript
Content-Disposition: inline; filename="control.js"
Connection: close
Accept-Ranges: none

"use strict";

//Client States 		//moved to tools.
// var OFFLINE = 0;
// var REQUEST	= 1;
// var REGISTER = 2;
// var SYNC = 3;
// var WAIT = 4;
// var READY = 5;

var DELETE = 0;
var ADD = 1; 

//Device States
var DEV_OFFLINE = -1;
var DEV_SHUTDOWN = 0;
var DEV_REQUEST	= 1;
var DEV_REGISTER = 2;
var DEV_SYNC = 3;
var DEV_READY = 4;

//BBQ States
var BBQ_OFFLINE = -1;
var BBQ_OFF = 0;
var BBQ_COOLDOWN = 1
var BBQ_SMOKE = 2;
var BBQ_WARMUP = 3;
var BBQ_RUN = 4;
var BBQ_MANUAL = 5;
var BBQ_PAUSE = 6;


var clientState = OFFLINE;
var deviceState = DEV_OFFLINE;
var bbqState = BBQ_OFFLINE;
var ws = null;


var pollStatsAbpTimer = null;
var isStoreStats = false;
//var isWarmUpByPass = 0;
var tempScale = 1;	//1=F, 2=C
//var messageBuffer = "";// moved to tools

var startTime = new Date().getTime();
var arrRecipes = ["Default"];

var bbqStatus = "currentProfile,timeRemaining,chamberTemp,dcOn,dcOff,statusFanSpeed,targetTemp," +
		"bbqOn,deviceState,bbqState,probeTemp,probeTemp1,probeTemp2,probeTemp3,"+
		"OutsideTemp,isProbeCook,targetProbeTemp,CookByProbeNumber,PelletsLevel,isSettings";

var bbqSettings =  "targetTemp%,cookTime%,holdTemp%,dutyCycle%,isManualMode,"+
		"targetProbeTemp,restTime,bRefresh,smokeProfile,refreshTime,bSmoke,recipeName,"+
		"selTargetProbeTemp,isPostStatsAbp,postRate,isProbeCook,CookByProbeNumber";
				
var bbqRecipes = "Recipe_%";

//Recipe object definition with default values.
var Recipe = {
		recipeName:"Default", targetTemp1:"0", cookTime1:"0", 
		targetTemp2:"0", cookTime2:"0", targetTemp3:"0", cookTime3:"0",
		targetTemp4:"0", cookTime4:"0", smokeProfile:"1", isManualMode:"0", 
		dutyCycleOnTime:"15", dutyCycleOffTime:"60", targetProbeTemp: "145",
		restTime: "3", selTargetProbeTemp: "1", isProbeCook: "0"
};



//************************ Data Manipulation Functions *************************************//


function processNotify(){
	//console.log("processNotify called...");
	console.log("processNotify received: messageBuffer = " + messageBuffer);
	
	if (messageBuffer.search("isSettings") >= 0){
		//console.log("New Settings available for download");
		checkSettings();
	}
	
	if (messageBuffer.search("updateStatus") >= 0){
		console.log('message search updateStatus found!');
		storeNotifyUpdateStatus();
	}
}

function processOkGetData(){
	//log("processOkGetData called...");
	if (messageBuffer.search("STATS") >= 0){
		storeStats();		
		//checkSettings();		
	}
	
	if (messageBuffer.search("wifiSSID") >= 0){
		console.log('message search wifiSSID found!');
		storeConfig();
	}
	
	if (messageBuffer.search("wifiRSSI") >= 0){
		console.log('message search wifiRSSI found!');
		var strRSSI= getVarFromBuffer("wifiRSSI");
		var intRSSI = parseInt(strRSSI);
		console.log('RSSI value = ', intRSSI);
		sessionStorage.setItem('intRSSI', intRSSI);
		updateRSSI(intRSSI);	//in libtools.js
		setCfgControl("updateWiFi", "");
		setGraphControl("updateWiFi", "");
		setUpdateControl("updateWiFi", "");
	}
	
	if (messageBuffer.search("deviceState") >= 0){		
		UpdateControllerStatus();
		updateDeviceState();
		updatePelletsLevel();
	}
	
	if (messageBuffer.search("isSettings") >= 0){
			updateTextValuesByForm("cookingProfiles");
			updateCheckBoxesByForm("cookingProfiles");	
			updateRadioButtonsByName("smokeProfile");
			updateTextValuesByForm("endingControl");
			updateCheckBoxesByForm("endingControl");
			updateRadioButtonsByName("bSmoke");	
			updateSelectBoxById("CookByProbeNumber");
			updateSelectBoxById("selTargetProbeTemp");	
			updateSelectBoxById("fanSpeed");			
			updateCheckBoxesByForm("manualControls");
			scanProbeCook();	
			scanProfiles();			
				
	}

	
	if (messageBuffer.search("Recipe_") >= 0){
		updateTextValuesByForm("fileManagement");
		updateCheckBoxesByForm("fileManagement");
		updateRecipes();
	}
	
	if (messageBuffer.search("updateStatus") >= 0){
		console.log('message search updateStatus found!');
		storeUpdateStatus();
	}
	
	if (messageBuffer.search("isBeep") >= 0){
			var strNumBeeps = getVarFromBuffer("isBeep");
			var intNumBeeps = parseInt(strNumBeeps);
			Beep(intNumBeeps);		
	}
	
	if (messageBuffer.search("tempScale") >= 0){
			var strTempScale= getVarFromBuffer("tempScale");
			var intTempScale = parseInt(strTempScale);
			if (intTempScale != tempScale){
				if (intTempScale > 0 && intTempScale < 3){
					tempScale = intTempScale;
					sessionStorage.setItem('tempScale', tempScale);
					scanProbeCook();
					$('[id=scale]').each(function(x){
							var new_text = $(this).text().replace("F", "C"); 
							$(this).text(new_text);
						});
				}
			}	
	}
	
/* 	if (messageBuffer.search("isWarmUpByPass") >= 0){
		isWarmUpByPass = 1;			
	} else {
		isWarmUpByPass = 0;	
	} */
	
}

function checkSettings() {
	log("sessionStorage.length = " + sessionStorage.length);
	var isSettings = getVarFromBuffer("isSettings");

	if (isSettings == "1"){
		log("New Settings available for download");
		getAbpKvp(bbqSettings);
	
	} else {
		log("No new settings.");
	}	
}

function storeConfig(){
	log("storeConfig called...");
	var configKvp = stripCommand("OK: GET:",messageBuffer);
	log("Send config.js command getConfig = " + configKvp);
	// sessionStorage.setItem('configs', configKvp);		//Store the kvp pairs for config.js
	// sessionStorage.setItem('cmdConfig', 'getConfig');	//Tell config.js to run cmd getConfig
	setCfgControl("getConfig", configKvp);
}

function storeNotifyUpdateStatus(){
	log("postNotifyUpdateStatus called...");
	console.log('postNotifyUpdateStatus called...');
	var updateKvp = stripCommand("NOTIFY:",messageBuffer);
	log("Send update.js command getUpdateStatus = " + updateKvp);
	console.log("Send update.js command getUpdateStatus = " + updateKvp);

	setUpdateControl("getUpdateStatus", updateKvp);
}

function storeUpdateStatus(){
	log("storeUpdateStatus called...");
	console.log('storeUpdateStatus called...');
	var updateKvp = stripCommand("OK: GET:",messageBuffer);
	log("Send update.js command getUpdateStatus = " + updateKvp);
	console.log("Send update.js command getUpdateStatus = " + updateKvp);

	setUpdateControl("getUpdateStatus", updateKvp);
}

function storeStats(){
	log("storeStats called...");
	if (isStoreStats){
		var statsKvp = stripCommand("OK: GET:",messageBuffer);
		log("Received statsKvp = " + statsKvp);
		var arrStats = statsKvp.split("=",2);
		var key = arrStats[0].trim();
		arrStats = statsKvp.split(key+"=",2);
		var value = arrStats[1].trim();
		log("Storing session stats key = " + key + " value = " + value);
		//localStorage.setItem(key, value);
		sessionStorage.setItem(key, value);
		sessionStorage.setItem("last", value);
		isStoreStats = false;		//store them only once per request from graph.
	}
}


function UpdateControllerStatus(){
	log("Update Status called...");
	var arrIds = bbqStatus.split(',');
	for (var i = 0; i <  arrIds.length; i++){
		var key = arrIds[i];
		//log("Looking for key = " + key + " in buffer");
		var newValue = getVarFromBuffer(key);
		if (newValue != null){
			if (key == "isProbeCook"){
				key = "statusIsProbeCook"
			}
			if (key == "targetProbeTemp"){
					key = "statusTargetProbeTemp";
			}
			if (key == "CookByProbeNumber"){
					key = "statusCookByProbeNumber";
			}			
			var id = ("#" + key);
			var isDataValue = $(id).data("value");
			if (isDataValue != null){
				//console.log("Updating WebPage Status: key = " + key + " newValue = " + newValue);
				$(id).attr("data-value",newValue);
				$(id).text(newValue);
			}
			sessionStorage.setItem(key, newValue);
		}
	}
}

////////////////////// Recipe Functions /////////////////////////////	

function updateRecipes() {
	//log("updateRecipes called...");
	var rating;
	var arrKeys = getKeysFromBuffer("Recipe_");
	if (arrKeys == []){
		log("ERR: updateRecipe says arrKeys is empty. ");
		return;
	}
	
	for (var i = 0; i < arrKeys.length; i++){
		var fileName = arrKeys[i];
		log("updateRecipes: filename = " + fileName);
		var arrRecipe = fileName.split("Recipe_",2);
		var recipe = arrRecipe[1].trim();
		log("updateRecipes: recipe = " + recipe);
		rating = getVarFromBuffer(fileName);
		if (rating == null){
			rating = getVarFromBuffer("recipeRating");
		}
		if (rating == null){
			rating = '1';
		}
		log("Recipe = " + recipe + " found in buffer with rating = " + rating);
		updateRecipeOptions(ADD, recipe, rating);
	}

	var name = getVarFromBuffer("recipeName");
	if (name != null){
		$('#selRecipe option').filter(function () { return $(this).html() == name; }).prop('selected', true);
		//rating = $('#selRecipe option').filter(function () { return $(this).html() == name; }).val();
	}
	if (rating > 0){
		$("#recipeRating option[value=" + rating + ']').prop('selected', true);
	}
}

function saveRecipe(){
	if (clientState != READY){
		alert("clientState is not READY.");
		return;
	}
	var recipeName = $("#recipeName").val();
	if (recipeName == ""){
		alert("Recipe name required for save.");
		return;
	}
	if (recipeName == "Default"){
		alert("Cannot change Default recipe.");
		return;
	}
	log("Saving recipe: " + recipeName);
	var arrKvps = [];
	var value = "";
	var key;
	for (key in Recipe){
		if ((key === 'isManualMode') || (key === 'isProbeCook')){
			continue;
		}
		var id = ("#" + key);
		var value = $(id).val();
		if ((value != "") && (value != undefined)){
			log("Key = " + key + " New value = " + value);
			arrKvps[arrKvps.length] = (key + "=" + value);
		}			
	}
	
	$("#cookingProfiles input:checkbox").each(function(){	
		var key = this.id;
		var isChecked = $('#' + key).is(':checked'); 
		if (isChecked){
			log("Updating Recipe with checkbox bool: key = " + key + " value = 1");
			arrKvps[arrKvps.length] = (key + "=1");
		} else {
			log("Updating Recipe with checkbox bool: key = " + key + " value = 0");
			arrKvps[arrKvps.length] = (key + "=0");
		}		
	});
	
	// var isChecked = $('#isManualMode').is(':checked'); 
	// if (isChecked){
		// log("isManualmode = 1");
		// arrKvps[arrKvps.length] = ("isManualMode" + "=1");
	// } else {
		// log("isManualmode = 0");
		// arrKvps[arrKvps.length] = ("isManualMode" + "=0");
	// }
	
	var isChecked = $('#isProbeCook').is(':checked'); 
	if (isChecked){
		log("isProbeCook = 1");
		arrKvps[arrKvps.length] = ("isProbeCook" + "=1");
	} else {
		log("isProbeCook = 0");
		arrKvps[arrKvps.length] = ("isProbeCook" + "=0");
	}
	
	var CookByProbeNum = $("#CookByProbeNumber option:selected").val();
	arrKvps[arrKvps.length] = ("CookByProbeNumber=" + CookByProbeNum);
	
	var recipeRating = $("#recipeRating option:selected").val();
	if (recipeRating > 0){	
		arrKvps[arrKvps.length] = ("recipeRating" + "=" + recipeRating);
	} else {
		arrKvps[arrKvps.length] = ("recipeRating=1");
	}
	
	var smokeProfile = $("input[name=smokeProfile]:checked").val();
	log("Saving  smokeProfile = " + smokeProfile);
	arrKvps[arrKvps.length] = ("smokeProfile=" + smokeProfile);
	
	//Need to tell the web app that this recipe contains settings.
	arrKvps[arrKvps.length] = "isSettings=1";
	
	var isSmoke = $("input[name=bSmoke]:checked").val();
	log("Adding  bSmoke = " + isSmoke);
	arrKvps[arrKvps.length] = ("bSmoke=" + isSmoke);
	
	// if ($('#precisionCook').is(':checked')){
		// arrKvps[arrKvps.length] = "smokeProfile=0";
	// } else if ($('#minSmoke').is(':checked')){
		// arrKvps[arrKvps.length] = "smokeProfile=1";
	// }else if ($('#medSmoke').is(':checked')){
		// arrKvps[arrKvps.length] = "smokeProfile=2";
	// }else if ($('#maxSmoke').is(':checked')){
		// arrKvps[arrKvps.length] = "smokeProfile=3";
	// }
	
	if (arrKvps.length > 0){
		var csvKvps = arrKvps.join(',');
		log("Updating TC File = " + recipeName + " with: csvKpvs: " + csvKvps);
		var fileName = "Recipe_" + recipeName;
		setFileAbpKvp(fileName, csvKvps);
		
		var recipeRating = $('#recipeRating option:selected').val();
		//setAbpKvp(fileName + "=" + recipeRating + ",recipeName=" + recipeName);
	} else {
		log("Save: arryKvps is 0");
	}
	
	updateRecipeOptions(ADD, recipeName, recipeRating);
}

function deleteRecipe(){
	log("Delete recipe called for recipe = " + recipeName);
	if (clientState != READY){
		alert("clientState is not READY.");
		return;
	}

	var selectedRecipe = $("#selRecipe option:selected").text();
	if (selectedRecipe == ""){
		alert("Recipe name required for delete.");
		return;
	}
	
	if (selectedRecipe == "Default"){
		alert("Cannot delete Default recipe.");
		return;
	}
	
	var fileName = "Recipe_" + selectedRecipe;
	deleteFileAbp(fileName);	//Deletes file.
	deleteAbpEntry(fileName);	//Deletes from DB
	deleteAbpEntry(fileName);	//Deletes from DB
	updateRecipeOptions(DELETE, selectedRecipe, "0");
	$('#selRecipe option').filter(function () { return $(this).html() == "Default"; }).prop('selected', true);
	loadRecipe();
	
}

function deleteAllRecipeOptions(){
	$("#selRecipe option").each(function(){
		$(this).remove();
	});	
}

//This updates the dropdown menu and array of Recipes.
function updateRecipeOptions(action, name, rating){
	var isFound = false;
	//log("Updating recipe options...");
	$("#selRecipe option").each(function(){
		var optionText = $(this).text();
		if (optionText == name){
			isFound = true;
		}
	});	
	
	if ((isFound) && (action == DELETE)){
		//$("#selRecipe option:contains(Text)").remove();
		log("Removing selected recipe option: " + name);
		$("#selRecipe option:selected").remove();
		var index = arrRecipes.indexOf(name);
		if (index > -1){
			arrRecipes.splice(index,1);
		}
		//return;
	}
	
	if ((!isFound) && (action == ADD)){
		//Add recipe option.
		var newRecipeOption = ("<option  value='" + rating + "'>" + name + "</option>");
		log("Adding new recipe option: " + name);
		$("#selRecipe").append(newRecipeOption);
		
		$('#selRecipe option').filter(function () { return $(this).html() == name; }).prop('selected', true);		
		
		var index = arrRecipes.indexOf(name);
		if (index > -1){
			arrRecipes.push(name);
			
		}	
		//return;
	}
	$("#btnSaveRecipe").val("Delete");
}

function loadRecipe(){
	var selectedRecipe = $("#selRecipe option:selected").text();
	log("Loading recipe: " + selectedRecipe);
	var fileName = "Recipe_" + selectedRecipe;
	getFileAbpKvp(fileName);
	flashElement("#btnSubmit",ON);
}

////////////////////// Communication and IO Functions /////////////////////////////

//This function connects the websocket and listens for ws events.
function connect() {
    //var target = "ws://192.168.1.184:1018/abp/abp"  
		
	//****************************************************
  var host = window.location.host;	//returns localhost
	//var host = "192.168.1.228";
	//*******************************************************
	
	var target = "ws://" + host + "/";
		
    if ('WebSocket' in window) {
        ws = new WebSocket(target);
    } else if ('MozWebSocket' in window) {
        ws = new MozWebSocket(target);
    } else {
        alert('WebSocket is not supported by this browser.');
        return;
    }
    ws.onopen = function () {
        log('Info: WebSocket connection opened.');
        setClientState(REGISTER);
    };
    ws.onmessage = function (event) {
        log('Received TC Message: ' + event.data);
        processWebSocketInput(event.data);
    };
    ws.onclose = function (event) {
         //alert('Info: WebSocket connection closed, Code: ' + event.code + (event.reason == "" ? "" : ", Reason: " + event.reason));
         //setClientState(OFFLINE);
				 setClientState(WAIT);
				 setTimeout(function() { connect() }, 1000);
    };
    ws.onerror = function (event) {
        //alert("ERROR: Websocket code: " + event.code + " data: " + event.data);
        //setClientState(OFFLINE);
				//setTimeout(function() { connect() }, 1000);
				
   };
    
}

function disconnect() {
    if (ws != null) {
        ws.close();
        ws = null;
    }
}

function sendAbpMessage(message){
	log('Send TC Message: ' + message);
	if (ws != null) {
        ws.send(message);
        //messageBuffer = "";
    } else {
        log('WebSocket connection not established, please login again.');
        setClientState(OFFLINE);
    }
}

function getAbpKvp(csvKeys){
	var theMessage = ("GET: " + csvKeys);
	sendAbpMessage(theMessage);
	setClientState(WAIT);
}

function setAbpKvp(csvKvps){
	var theMessage = ("SET: " + csvKvps);
	sendAbpMessage(theMessage);
	setClientState(WAIT);
}

function deleteAbpEntry(key){
	var theMessage = ("DELETE: " + key);
	sendAbpMessage(theMessage);
	setClientState(WAIT);
}

function deleteStatsAbp(){
	var theMessage = ("STATS: DELETE: TRUNCATE");
	sendAbpMessage(theMessage);
	setClientState(WAIT);
}

function getFileAbpKvp(name){
	var theMessage = ("FILE: GET: " + "name=" + name);
	sendAbpMessage(theMessage);
	setClientState(WAIT);
}

function setFileAbpKvp(name, csvKvps){
	var theMessage = ("FILE: SET: " + "name=" + name + "," + csvKvps);
	sendAbpMessage(theMessage);
	setClientState(WAIT);
}

function deleteFileAbp(name){
	var theMessage = ("FILE: DELETE: " + "name=" + name);
	sendAbpMessage(theMessage);
	setClientState(WAIT);
}

function getStatsAbp(csvKeys){
	if (clientState == READY){
		var theMessage = ("STATS: GET: " + csvKeys);
		sendAbpMessage(theMessage);
		//setClientState(WAIT);
	} else {
		log("ERR: getStatsAbp: clientState not READY!");
	}
	
}

function getConfigAbp(){
	console.log('controls getConfigAbp called...');
	console.log('current state = ' + getStateName(clientState));	
	if (clientState == READY){	
		var theMessage = ("CONFIG: GET: ");
		sendAbpMessage(theMessage);
		setClientState(WAIT);
	} else {
		console.log('clientState not READY');
		log("ERR: getConfigAbp: clientState not READY!");
	}		
}

function getUpdateStatus(){
	console.log('controls getUpdateStatus called...');
	console.log('current state = ' + getStateName(clientState));	
	if (clientState == READY){	
		var theMessage = ("GET: rptcVer");
		sendAbpMessage(theMessage);
		setClientState(WAIT);
	} else {
		console.log('clientState not READY');
		log("ERR: getUpdateStatus: clientState not READY!");
	}		
}

////////////////////// Processing Data Input /////////////////////////////
function processWebSocketInput(message){
	if (clientState >= REGISTER) {
		if (message.search("Hello") == 0){
			sendAbpMessage("OK: Hello");
			return;
		}
		if (message.search("REGISTER") == 0){
			log("The TC server is asking us to register.")
			setClientState(REGISTER);
			//sendAbpMessage("OK: REGISTER");
			return;
		}
		if (message.search("OK: REGISTER") == 0){
			//log("Received OK: REGISTER");
			if (clientState < READY){
				hideForms(OFF);
				setClientState(SYNC);
				return;
			}	
		}
		if (message.search("ERR:") == 0){
			alert("ERROR:" + message)
			return;
		}
		
	}
	if (clientState == SYNC) {
		if (message.search("OK: GET") == 0){
			log("ERR: Invalid State -> SYNC: Received OK: GET");
			return;
			
		}
		if (message.search("OK: SET") == 0){
			log("ERR: Invalid State ->  SYNC: Received OK: SET");
			return;

		}
	}
	if (clientState == WAIT){
		if (message.search("OK: GET") == 0){
			//log("WAIT: Received OK: GET");
			messageBuffer = message;
			processOkGetData();
			setClientState(READY);
			return;
			
		}
		if (message.search("OK: SET") == 0){
			//log("WAIT: Received OK: SET");
			setClientState(READY);
			return;

		}
		if (message.search("OK: DELETE") == 0){
			//log("WAIT: Received OK: DELETE");
			setClientState(READY);
			return;

		}
		
	}
	
	if (clientState == READY) {
		setClientState(READY);	//Added to keep sessionStorage in sync after graph clears it.
		if (message.search("NOTIFY") == 0){
			console.log("READY: Received NOTIFY");
			messageBuffer = message;
			processNotify();
			//sendAbpMessage("OK: NOTIFY");
			//getAbpKvp(bbqStatus);
		}
		if (message.search("OK: GET") == 0){
			log("READY: Received OK: GET");
			messageBuffer = message;
			processOkGetData();
		}
		if (message.search("OK: SET") == 0){
			log("READY: Received OK: SET");

		}
		if (message.search("OK: DELETE") == 0){
			log("READY: Received OK: DELETE");

		}
	}
	
}

////////////////////// Polling and Submission /////////////////////////////
	
function pollStatsAbp(postRate, state){
	//
	var pollRate_ms = postRate*1000;
	if (state == ON){
		if (pollStatsAbpTimer == null){
			log("Starting pollStatsAbp Timer interval = " + pollRate_ms );
			pollStatsAbpTimer = setInterval(function(){getStatsAbp("startSeconds=LAST,limit=1")},pollRate_ms);
		} else {
			log("Resetting pollStatsAbp interval = " + pollRate_ms );
			clearInterval(pollStatsAbpTimer);
			pollStatsAbpTimer = setInterval(function(){getStatsAbp("startSeconds=LAST,limit=1")},pollRate_ms);
		}
		
	} else {
		if (pollStatsAbpTimer == null){
			//Do nothing it is already off.
		} else {
			log("Stopping pollStatsAbp Timer interval = " + pollRate_ms );
			clearInterval(pollStatsAbpTimer);
			pollStatsAbpTimer = null;
		}
	}
	
}

function submitSettings() {	
	if (clientState < SYNC) {
		alert('Client not READY, please Login.');
		return;
	}
	var arrIds = getAllTextInputIds();
	var arrKvps = [];
	for (var i = 0; i <  arrIds.length; i++){
		var key = arrIds[i];
		var id = ("#" + key);
		var value = $(id).val();
		if (value){
			log("Updating TC with: key = " + key + " value = " + value);
			arrKvps[arrKvps.length] = (key + "=" + value);	
		}
		
	}
	
	$(":checkbox").each(function(){	
		var key = this.id;
		if (key == "cbStatus"){
			return gotoNextKey;
		}
		var isChecked = $('#' + key).is(':checked'); 
		if (isChecked){
			log("Updating TC with checkbox bool: key = " + key + " value = 1");
			arrKvps[arrKvps.length] = (key + "=1");
		} else {
			log("Updating TC with checkbox bool: key = " + key + " value = 0");
			arrKvps[arrKvps.length] = (key + "=0");
		}
		
	});

	// if ($('#bSmokeOn').is(':checked')){
		// arrKvps[arrKvps.length] = "bSmoke=1";
	// } else {
		// arrKvps[arrKvps.length] = "bSmoke=0";
	// }
	
	var isSmoke = $("input[name=bSmoke]:checked").val();
	log("Adding  bSmoke = " + isSmoke);
	arrKvps[arrKvps.length] = ("bSmoke=" + isSmoke);
	
	var CookByProbeNum = $("#CookByProbeNumber option:selected").val();
	arrKvps[arrKvps.length] = ("CookByProbeNumber=" + CookByProbeNum);

	var selectedProbeTargetTemp = $("#selTargetProbeTemp option:selected").val();
	arrKvps[arrKvps.length] = ("selTargetProbeTemp=" + selectedProbeTargetTemp);
	
	var smokeProfile = $("input[name=smokeProfile]:checked").val();
	log("Adding  smokeProfile = " + smokeProfile);
	arrKvps[arrKvps.length] = ("smokeProfile=" + smokeProfile);
	
	var FanSpeedPercent = $("#fanSpeed option:selected").val();
	arrKvps[arrKvps.length] = ("fanSpeed=" + FanSpeedPercent);
	
	// var pLevel = getPelletsLevel();
	// log("Adding  PelletsLevel = " + pLevel);
	// arrKvps[arrKvps.length] = ("PelletsLevel=" + pLevel);
	
	if (arrKvps.length > 0){
		var csvKvps = arrKvps.join(',');
		log("Updating TC with: csvKpvs: " + csvKvps);
		setAbpKvp(csvKvps);
	} else {
		log("Submit: arryKvps is 0");
	}
	
}

function login() {
	if (clientState >= REGISTER) {
		register();
		return;
	}
	if (clientState == OFFLINE) {
		setClientState(REQUEST);
	} else {
		alert('Unable to connect for login.  Invalid clientState: ' + getStateName(clientState));
	}

}

function register() {
	if (clientState < REGISTER) {
		alert('ERR: register() is in an Invalid clientState: ' + getStateName(clientState));		
	} else {
		var userName = $("#userName").val();
		var userPassword = $("#userPassword").val();
		var message = "REGISTER: id=" + userName + ",userPassword=" + userPassword;
        //TODO: Get register info from webpage.
        sendAbpMessage(message);
	}
}

function syncDb(){
	var allSettings = (bbqSettings +"," + bbqStatus + "," + bbqRecipes);
	//var allConfig = (bbqSettings +"," + bbqStatus);
	deleteAllRecipeOptions();
	getAbpKvp(allSettings);
	
	
}


////////////////////// Client WebPage STATE Functions /////////////////////////////

function setClientState(newState) {
	if (clientState == newState) {
		sessionStorage.setItem('clientState', newState);
	} else {
		log("Setting clientState from " + getStateName(clientState) + " to " + getStateName(newState));
		clientState = newState;
		sessionStorage.setItem('clientState', newState);
		switchClientState();
	}
}

function switchClientState() {
	switch(clientState) {
	    case OFFLINE:
	    	$("#clientState").css("color","gray").text("OFFLINE");
	    	setDeviceState(DEV_OFFLINE);
	    	disconnect();
	    	flashElement("#btnLogin", ON);
	        break;
	    case REQUEST:
	    	$("#clientState").css("color","gray").text("REQUEST");
	    	connect();
	        break;
	    case REGISTER:
	    	$("#clientState").css("color","gray").text("REGISTER");
	    	register();
	        break;
	    case SYNC:
	    	$("#clientState").css("color","gray").text("SYNC"); 
	    	syncDb();
	    	flashElement("#btnLogin", OFF);
			//setTimeout(function(){getConfigAbp()},2000);
	        break;
	    case WAIT:
	    	$("#clientState").css("color","gray").text("WAIT");
	    	//wait();    	
	        break;
	    case READY:    	
	    	
	    	$("#clientState").css("color","green").text("READY");
	    	
	        break;
	    default:

	}
}


////////////////////// BBQ Controller Device STATE Functions /////////////////////////////

function setBbqMode(mode){
	if (mode == ON){
		// if (isWarmUpByPass == 1){
			// alert('Bypass Ignite Fire set in config! The igniter is disabled.');
		// }
		setAbpKvp("bbqOn=1");
		//scanPostStatsAbpInput();
		alert('BBQ ON command sent.');
		
	} else if (mode == OFF){
		setAbpKvp("bbqOn=0");
		//scanPostStatsAbpInput();
		alert('BBQ OFF command sent.');
	}
	
}

function updateDeviceState() {
	var bbqOn = getVarFromBuffer("bbqOn");
	var strDeviceState = getVarFromBuffer("deviceState");
	var intDeviceState = parseInt(strDeviceState);
	var strBbqState = getVarFromBuffer("bbqState");
	var intBbqState = parseInt(strBbqState);
	
	switchBBQState(intBbqState);
	setDeviceState(intDeviceState);

	if (bbqOn == "1"){
		log("BBQ is ON!");
	} else {
		log("BBQ is OFF!");
	}
	
}

function switchBBQState(newBbqState) {
	switch(newBbqState) {
	    case BBQ_OFFLINE:
	    	$("#bbqState").css("color","gray").text("OFFLINE");
	    	bbqState = BBQ_OFFLINE;
	        break;
	    case BBQ_OFF:
	    	$("#bbqState").css("color","black").text("OFF");
	    	bbqState = BBQ_OFF;
	        break;
			case BBQ_COOLDOWN:
	    	$("#bbqState").css("color","red").text("COOLDOWN"); 
	    	bbqState = BBQ_COOLDOWN;
	        break;
	    case BBQ_SMOKE:
	    	$("#bbqState").css("color","red").text("SMOKE");
	    	bbqState = BBQ_SMOKE;
	        break;
	    case BBQ_WARMUP:
	    	$("#bbqState").css("color","red").text("IGNITEFIRE"); 
				//We want to clear the old graph data.
				if (bbqState == BBQ_OFF){
					setGraphControl("cleanGraph", "");
				}
	    	bbqState = BBQ_WARMUP;
	        break;
	    case BBQ_RUN:
	    	$("#bbqState").css("color","red").text("RUN");			
	    	bbqState = BBQ_RUN;
	        break;
	    case BBQ_MANUAL:
	    	$("#bbqState").css("color","red").text("MANUAL");
	    	var manProfile = $("#dutyCycleOnTime").val() + "/" + $("#dutyCycleOffTime").val();
	    	log("manProfile = " + manProfile);
	    	bbqState = BBQ_MANUAL;
	        break;
			case BBQ_PAUSE:
	    	$("#bbqState").css("color","red").text("PAUSE");
	    	bbqState = BBQ_PAUSE;
	        break;

	    default:
	    	$("#bbqState").css("color","gray").text("N/A");
	}
}


function setDeviceState(state){	
	if (state == 4){
		//log("Device is online and ready!");
		deviceState = DEV_READY;
		$("#deviceState").css("color","green").text("READY");
		$("#deviceAuthentication").hide();
	} else if (state == 3) {
		log("Device is in SYNC state.");
		deviceState = DEV_SYNC;
		$("#deviceState").css("color","gray").text("SYNC");
	} else if (state == 2) {
		log("Device is in REGISTER state.");
		deviceState = DEV_REGISTER;
		$("#deviceState").css("color","gray").text("REGISTER");
	} else if (state == 1) {
		$("#deviceState").css("color","gray").text("REQUEST");
		log("Device is in REQUEST state.");
		deviceState = DEV_REQUEST;
	} else if (state == 0) {
		$("#deviceState").css("color","gray").text("SHUTDOWN");
		deviceState = DEV_SHUTDOWN;
		log("Device is in SHUTDOWN state.");
	} else {
		$("#deviceState").css("color","gray").text("OFFLINE");
		log("Device is OFFLINE.");
		deviceState = DEV_OFFLINE;
		$("#deviceAuthentication").show();
	}
}

////////////////////// GUI Manipulation Functions /////////////////////////////

function getStateName(number){
	switch(number) {
	    case OFFLINE:
	    	return "OFFLINE";
	    case REQUEST:
	    	return "REQUEST";
	    case REGISTER:
	    	return "REGISTER";
	    case SYNC:
	    	return "SYNC";
	    case WAIT:
	    	return "WAIT";
	    case READY:
	    	return "READY";
	    default:
	    	return "UNKNOWN";
	}
}



function scanDebugStatus() {
	var isChecked = $('#cbStatus').is(':checked');
	if (isChecked){
		$("#console").show();
		sessionStorage.setItem('cbStatus', "1");
	} else {
		sessionStorage.setItem('cbStatus', "0");
		$("#console").hide();
		$("#console").val("");
	}
	setCfgControl("checkConsole", "");
	setGraphControl("checkConsole", "");
	setUpdateControl("checkConsole", "");
}

function scanPostStatsAbpInput(){
	var isChecked = $('#isPostStatsAbp').is(':checked'); 
	var postRate = $("#postRate").val();
	if (postRate <= 7) {
		postRate = 7;
	}
	log("*********************postRate = " + postRate);
	sessionStorage.setItem("postRate", postRate);
	if (isChecked){
		//deleteStatsAbp(); //Clean out old stats.
		pollStatsAbp(postRate, ON);
	} else {
		pollStatsAbp(postRate, OFF)	;
		deleteStatsAbp(); //Clean out old stats.
	}
}

function disableProfile(pNum, state){
	if (pNum == 2){
		$("[id^='targetTemp2']").prop("disabled", state);
		$("[id^='cookTime2']").prop("disabled", state);
		$("[id^='holdTemp2']").prop("disabled", state);
	} else if (pNum == 3){
		$("[id^='targetTemp3']").prop("disabled", state);
		$("[id^='cookTime3']").prop("disabled", state);
		$("[id^='holdTemp3']").prop("disabled", state);
	} else if (pNum == 4){
		$("[id^='targetTemp4']").prop("disabled", state);
		$("[id^='cookTime4']").prop("disabled", state);
		$("[id^='holdTemp4']").prop("disabled", state);
	}
}

function scanProfiles() {
	var isHoldTemp1Checked = $('#holdTemp1').is(':checked');
	var isHoldTemp2Checked = $('#holdTemp2').is(':checked');
	var isHoldTemp3Checked = $('#holdTemp3').is(':checked');
	var isHoldTemp4Checked = $('#holdTemp4').is(':checked');
	
	if ( isHoldTemp1Checked == false ){
		disableProfile(2, false);
		disableProfile(3, false);
		disableProfile(4, false);	
	} else {
		$('#holdTemp2').prop("checked", false);
		$('#holdTemp3').prop("checked", false);
		$('#holdTemp4').prop("checked", false);
		disableProfile(2, true);
		disableProfile(3, true);
		disableProfile(4, true);
		return;
	}
	
	if ( isHoldTemp2Checked == false ){
		disableProfile(3, false);
		disableProfile(4, false);	
	} else {
		$('#holdTemp1').prop("checked", false);
		$('#holdTemp3').prop("checked", false);
		$('#holdTemp4').prop("checked", false);
		disableProfile(3, true);
		disableProfile(4, true);
		return;
	}
	
	if ( isHoldTemp3Checked == false ){	
		disableProfile(4, false);	
	} else {
		$('#holdTemp1').prop("checked", false);
		$('#holdTemp2').prop("checked", false);
		$('#holdTemp4').prop("checked", false);
		disableProfile(4, true);
	}
}

function scanProbeCook(){
	var isChecked = $('#isProbeCook').is(':checked'); 
	//var tempScale = sessionStorage.getItem("tempScale");
	var CookByProbeNum = $("#CookByProbeNumber option:selected").val();
	log("CookByProbeNum val = " + CookByProbeNum);
	var selectedProbeTargetTemp = $("#selTargetProbeTemp option:selected").val();
	log("scanProbeCook selTargetProbeTemp = " + selectedProbeTargetTemp);
	var targetProbeTemp = $("#targetProbeTemp.profileBox").val();
	var restTime = $("#restTime.profileBox").val();
	switch(selectedProbeTargetTemp) {
			case "0":
	    	//<option  value="0">Custom</option> UnknownF
	    	//User values read in above.
	        break;
	    case "1":
	    	//<option  value="1">Pork</option> 145F
				if (tempScale == 2){
					targetProbeTemp = 63;
				} else {
					targetProbeTemp = 145;
				}
	    	
	    	restTime = 3;
	        break;
	    case "2":
	    	//<option  value="2">Beef</option> 145F
	    	if (tempScale == 2){
					targetProbeTemp = 63;
				} else {
					targetProbeTemp = 145;
				}
	    	restTime = 0;
	        break;
	    case "3":
	    	//<option  value="3">Seafood</option> 145F
	    	if (tempScale == 2){
					targetProbeTemp = 63;
				} else {
					targetProbeTemp = 145;
				}
	    	restTime = 0;
	        break;
	    case "4":
	    	//<option  value="4">Veal and Lamb</option> 145F
	    	if (tempScale == 2){
					targetProbeTemp = 63;
				} else {
					targetProbeTemp = 145;
				}
	    	restTime = 3;
	        break;
	    case "5":
	    	//<option  value="5">Ground Meats</option>	165F
	    	if (tempScale == 2){
					targetProbeTemp = 74;
				} else {
					targetProbeTemp = 165;
				}
	    	restTime = 0;
	        break;
	    case "6":
	    	//<option  value="6">Poultry</option> 165F
	    	if (tempScale == 2){
					targetProbeTemp = 74;
				} else {
					targetProbeTemp = 165;
				}
	    	restTime = 0;
	        break;
	    default:
	
	}
	
	log("Loading probe target temp: " + targetProbeTemp);
	$("#targetProbeTemp.profileBox").val(targetProbeTemp);
	//$("#statusTargetProbeTemp").text(targetProbeTemp);	
	//sessionStorage.setItem("targetProbeTemp", targetProbeTemp);
	$("#restTime.profileBox").val(restTime);

	if (isChecked){
		log("Setting isProbeCook = 1");
		//sessionStorage.setItem("isProbeCook", 1);
		
		if (CookByProbeNum == 0){
			$("#CookByProbeNumber").val(1).prop('selected', true);
			//$("#statusCookByProbeNumber").text(1);
		} else {
			$("#CookByProbeNumber").val(CookByProbeNum).prop('selected', true);
			//$("#statusCookByProbeNumber").text(CookByProbeNum);
		}
		
	} else {
		sessionStorage.setItem("isProbeCook", 0);
		log("Setting isProbeCook = 0");
		$("#CookByProbeNumber").val(0).prop('selected', true);
		$("#statusCookByProbeNumber").text(0);
	}

}


function hideForms(state){
	if (state == ON){
		$("#sensorStatus").hide();
		$("#cookingProfiles").hide();
		$("#smokeControl").hide();
		$("#endingControl").hide();
		$("#statsControl").hide();
		$("#fileManagement").hide();
		$("#deviceControl").hide();
		$("#manualControls").hide();
		$("#debugConsole").hide();
	} else {
		$("#sensorStatus").show();
		$("#cookingProfiles").show();
		$("#smokeControl").show();
		$("#endingControl").show();
		$("#statsControl").show();
		$("#fileManagement").show();
		$("#deviceControl").show();
		$("#manualControls").show();
		$("#debugConsole").show();
	}
}

function setCfgControl(cmd, value){
	sessionStorage.setItem(cmd, value);	//pass value to config.js .
	sessionStorage.setItem('cmdConfig', cmd);	//tell config.js to run command .
}

function setUpdateControl(cmd, value){
	sessionStorage.setItem(cmd, value);	//pass value to update.js .
	sessionStorage.setItem('cmdUpdate', cmd);	//tell update.js to run command .
}

function setGraphControl(cmd, value){
	sessionStorage.setItem(cmd, value);	//pass value to update.js .
	sessionStorage.setItem('cmdGraph', cmd);	//tell update.js to run command .
}

function getCommand(){
	//If cmdControl is null do nothing.
	if (!sessionStorage.getItem("cmdControl")){
		//do nothing.
		//console.log("cmdControl is null");
		
	} else {
		var cmdCtl = sessionStorage.getItem("cmdControl");
		//reset cmdControl after retrieval.
		sessionStorage.removeItem("cmdControl");
		//console.log("cmdControl = " + cmdCtl);
		if (cmdCtl == "getConfigAbp"){
			getConfigAbp();
		} else if (cmdCtl == "setAbpKvp"){
			var value = sessionStorage.getItem(cmdCtl);
			setAbpKvp(value);
		}	else if (cmdCtl == "getGraphStats"){
			isStoreStats = true;
		}	else if (cmdCtl == "getUpdateStatus"){
			getUpdateStatus();
		}
	}
}

function updatePelletsLevel(){
	var newPelletsLevel = getVarFromBuffer("PelletsLevel");
	var intNewPelletsLevel = parseInt(newPelletsLevel);
	setPelletsLevel(intNewPelletsLevel);
}

function resetPelletsLevel(newLevel){
	setPelletsLevel(newLevel)
	
	if (clientState < SYNC) {
		alert('Client not READY, please Login.');
		return;
	}
	var arrKvps = [];
	
	var pLevel = getPelletsLevel();
	log("Adding  PelletsLevel = " + pLevel);
	arrKvps[arrKvps.length] = ("PelletsLevel=" + pLevel);
		
	if (arrKvps.length > 0){
		var csvKvps = arrKvps.join(',');
		log("Updating TC with: csvKpvs: " + csvKvps);
		setAbpKvp(csvKvps);
	} else {
		log("Submit: arryKvps is 0");
	}
}


function setPelletsLevel(newLevel){
	if ((newLevel < 0) || (newLevel > 100) || isNaN(newLevel)){
		$( "#PelletsLevel" ).progressbar({value: false});
	} else if (newLevel <= 15){
		$( "#PelletsLevel" ).progressbar({value: newLevel});
		$( "#PelletsLevel").find(".ui-progressbar-value").css("background", "red");
	} else {
		$( "#PelletsLevel" ).progressbar({value: newLevel});
		$( "#PelletsLevel").find(".ui-progressbar-value").css("background", "green");
	}
}

function getPelletsLevel(){
	console.log("PelletsLevel = " + PelletsLevel);
	return $( "#PelletsLevel" ).progressbar("value");
}

function showRefillDialog(){
  var txtFillLevel = prompt("Enter percent fill level.", "100");
	if (txtFillLevel == null || txtFillLevel == "") {
		 return;
	}
	
	var intFillLevel = parseInt(txtFillLevel);	
  if (isNaN(intFillLevel)) {
		alert("Enter a number between 1-100");
  } else {
    if (intFillLevel <= 0){
			resetPelletsLevel(0);
		} else if (intFillLevel >= 100){
			resetPelletsLevel(100);
		} else {
			resetPelletsLevel(intFillLevel);
		}
  }
	console.log("resetPelletsLevel = " + intFillLevel);
}



//This function is called when the page is first loaded or refreshed.
function init() {
	//check for web storage support.
	if (typeof(Storage) == "undefined") {
		alert("Sorry, your browser does not support Web Storage...");
	    // Store - localStorage.setItem("lastname", "Smith");
	    // Retrieve - localStorage.getItem("lastname");
	}
	log("b4 clear: sessionStorage.length = " + sessionStorage.length);
	//sessionStorage.clear();
	log("after clear: sessionStorage.length = " + sessionStorage.length);
	//$("#deviceState").css("color","gray").text("N/A");
	
	//updateRSSI(-65)
	scanDebugStatus();
	hideForms(ON);	
	pollForCmd(1,ON);	//poll for commands from config.js: 1 second, state=ON
		
}






	
]]></response>
    <comment></comment>
  </item>
</items>
