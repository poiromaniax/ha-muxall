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
<items burpVersion="2025.6.5" exportTime="Tue Jul 22 10:33:14 IDT 2025">
  <item>
    <time>Tue Jul 22 10:25:57 IDT 2025</time>
    <url><![CDATA[http://192.168.0.9/config.js]]></url>
    <host ip="192.168.0.9">192.168.0.9</host>
    <port>80</port>
    <protocol>http</protocol>
    <method><![CDATA[GET]]></method>
    <path><![CDATA[/config.js]]></path>
    <extension>js</extension>
    <request base64="false"><![CDATA[GET /config.js HTTP/1.1
Host: 192.168.0.9
Accept-Language: en-US,en;q=0.9
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
Accept: */*
Referer: http://192.168.0.9/config.html
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

]]></request>
    <status>200</status>
    <responselength>14855</responselength>
    <mimetype>script</mimetype>
    <response base64="false"><![CDATA[HTTP/1.1 200 OK
Content-Length: 14684
Content-Type: application/javascript
Content-Disposition: inline; filename="config.js"
Connection: close
Accept-Ranges: none

/**
 * 
 */
"use strict"

var arrRecipes = ["Default"];
var startTime = new Date().getTime();
var ThermocoupleTypes = "Type-J, Type-K, Type-E, Type-N, Type-R, Type-S, Type-T, Type-B"
 
var RtdTypes = "PT-100, PT-1000, PT-1000_375, PT-10, PT-50, PT-200, PT-500, NI-120"

var ThermistorTypes = "CampChef, FireBoard, Maverick, Inkbird, ThermoPro, Generic-10K, Generic-30K" 




function getConfig(){
	console.log("Getting configs...");
	if (sessionStorage.length <= 0){
		console.log("sessionStorage.length <= 0");
		// addProbeModelOptions(1, "RTD");
		// addProbeModelOptions(2, "RTD");
		// addProbeModelOptions(3, "RTD");
		// addProbeModelOptions(0, "RTD");
		return;
	} 
	// addProbeModelOptions(1, "RTD");
	// addProbeModelOptions(2, "RTD");
	// addProbeModelOptions(3, "RTD");
	// addProbeModelOptions(0, "RTD");
	
	messageBuffer = sessionStorage.getItem("getConfig")	//Get saved value from control.js
	updateStatusByForm("configFuelControl");
	updateTextValuesByForm("configFuelControl");
	updateCheckBoxesByForm("configFuelControl");
	
	updateTextValuesByForm("configNetwork");
	updateCheckBoxesByForm("configNetwork");
	
	updateSelectBoxById("probe0Type");
	selProbe0Type();
	updateSelectBoxById("probe0Model");
	updateSelectBoxById("probe0NumWires");
	selProbe0NumWires();	//Manually fire off event callback
	
	updateSelectBoxById("probe1Type");
	selProbe1Type();
	updateSelectBoxById("probe1Model");
	updateSelectBoxById("probe1NumWires");
	selProbe1NumWires();
	
	updateSelectBoxById("probe2Type");
	selProbe2Type();
	updateSelectBoxById("probe2Model");
	updateSelectBoxById("probe2NumWires");
	selProbe2NumWires();
	
	updateSelectBoxById("probe3Type");
	selProbe3Type();
	updateSelectBoxById("probe3Model");
	updateSelectBoxById("probe3NumWires");
	selProbe3NumWires();
	
	updateSelectBoxById("slewRate");
	updateSelectBoxById("tempScale");
	scanConfigControl();
	
	updateTextValuesByForm("configPATC");
	updateCheckBoxesByForm("configPATC");
	//updateRadioButtonsByName("patcMode");
	updateSelectBoxById("patcMode");
	setTempScale();
	
	updateTextValuesByForm("configPelletHopperVibrator");
	updateCheckBoxesByForm("configPelletHopperVibrator");
	updateSelectBoxById("phvMode");
	checkPHV();
	
  
	$("#isReboot").val("0");	//Added this to fix when the page originally loads data.
	//Turn off Save button after updating fields.
	flashElement("#btnSaveConfig",OFF);	
	//console.log("isReboot = " + $("#isReboot").val())
}

function showPassword(){
	var isChecked = $('#showPassword').is(':checked');
	if (isChecked){
		$("#wifiPassword").attr("type","text");
	} else {
		$("#wifiPassword").attr("type","password");
	}
}

function checkPHV(){	
	var isChecked = $('#isPHV').is(':checked');
	if (isChecked){
		$("[id^='phvMode']").prop("disabled", false);
		checkPhvMode();
		
	} else {
		$("[id^='phvMode']").prop("disabled", true);
		$("[id^='phvRunMinutes']").prop("disabled", true);
		$("[id^='phvTimerInterval']").prop("disabled", true);
	}
}

function checkPhvMode(){	
	var phvm = $("#phvMode :checked").val();
	if ((phvm == '3') || (phvm == '4')){
		$("[id^='phvRunMinutes']").prop("disabled", true);
		$("[id^='phvTimerInterval']").prop("disabled", true);
	} else {
		$("[id^='phvRunMinutes']").prop("disabled", false);
		$("[id^='phvTimerInterval']").prop("disabled", false);
	}
}

function checkMDNS(){	
	var hostName = $('#hostName').val();
	var isChecked = $('#isMDNS').is(':checked');
	if (isChecked){
		$("#nameURL").text("http://" + hostName + ".local");
		$("[id^='hostName']").prop("disabled", false);
	} else {
		$("#nameURL").text("");
		$("[id^='hostName']").prop("disabled", true);
	}
}

//Used when user changes settings.
function scanTempScale(){
	var bbqOn = sessionStorage.getItem("bbqOn");
	var tempScale = sessionStorage.getItem("tempScale");
	if (bbqOn == "1"){
			alert("Changing Temp Scale is only allowed when BBQ State is OFF.");
			$("#tempScale").val(tempScale).prop('selected', true);
		} else {
			setTempScale();
		}
}

function setTempScale(){
	var ts = $("#tempScale :checked").val();
	if (ts == '2'){
		$('[id=scale]').each(function(x){
			var new_text = $(this).text().replace("F", "C"); 
			$(this).text(new_text);
		});		
	} else {
		$('[id=scale]').each(function(x){
			var new_text = $(this).text().replace("C", "F"); 
			$(this).text(new_text);
		});	
	}
}

function scanConfigControl() {
	
	scanDHCP();
	checkMDNS();
	checkPHV();

}


function scanDHCP() {
	var isChecked = $('#isDHCP').is(':checked');
	if (isChecked){
		$("[id^='ipAddr']").prop("disabled", true);
		$("[id^='sub']").prop("disabled", true);
		$("[id^='gw']").prop("disabled", true);
	} else {
		$("[id^='ipAddr']").prop("disabled", false);
		$("[id^='sub']").prop("disabled", false);
		$("[id^='gw']").prop("disabled", false);
	}
}

function scanSlewRate(){
	var slewRate = $("#slewRate option:selected").val();
	log("Loading slewRate: " + slewRate);
	//$("#txtSlewRate").text(slewRate);

}


//This updates the dropdown menu and array of Recipes.
function addProbeModelOptions(selProbeNum, selProbeType){
	log("addProbeModelOptions called...");
	var arrModels;
	if (selProbeType == "Thermocouple"){
		arrModels = ThermocoupleTypes.split(',');
	} else if (selProbeType == "Thermistor"){
		arrModels = ThermistorTypes.split(',');
	} else {
		//Defaults to RTD type
		arrModels = RtdTypes.split(',');
	}

	for (var i = 0; i <  arrModels.length; i++){
		var name = arrModels[i];
		//Add model option.
		var newModelOption = ("<option value='" + i + "' >" + name + "</option>");
		log("Adding new model option: " + name);
		//var selProbeId = ("#selProbe"+selProbeNum+"Model");
		$("#probe"+selProbeNum+"Model").append(newModelOption);
	}	
}

//Probe 0 is the chamber probe.
function selProbe0Type(){
	log("selProbe0Type called...");
	$("#probe0Model option").each(function(){
		$(this).remove();
	});
	var selectedType = $("#probe0Type option:selected").text();
	log("Selected Probe Type: " + selectedType);
	addProbeModelOptions(0,selectedType);
	replaceChamberTrmBlkPic();

}

function selProbe1Type(){
	log("selProbe1Type called...");
	$("#probe1Model option").each(function(){
		$(this).remove();
	});
	var selectedType = $("#probe1Type option:selected").text();
	log("Selected Probe Type: " + selectedType);
	addProbeModelOptions(1,selectedType);

}

function selProbe2Type(){
	log("selProbe2Type called...");
	$("#probe2Model option").each(function(){
		$(this).remove();
	});
	var selectedType = $("#probe2Type option:selected").text();
	log("Selected Probe Type: " + selectedType);
	addProbeModelOptions(2,selectedType);

}

function selProbe3Type(){
	log("selProbe3Type called...");
	$("#probe3Model option").each(function(){
		$(this).remove();
	});
	var selectedType = $("#probe3Type option:selected").text();
	log("Selected Probe Type: " + selectedType);
	addProbeModelOptions(3,selectedType);

}

//Probe 0 is the chamber probe.
function selProbe0Model(){	 

}

function selProbe1Model(){	 

}

function selProbe2Model(){	 

}

function selProbe3Model(){	 

}

function selProbe0NumWires(){	
	replaceChamberTrmBlkPic();
}

function selProbe1NumWires(){
	var selNumWires = $("#probe1NumWires option:selected").val();
	replaceProbePic(1,selNumWires);
}

function selProbe2NumWires(){
	var selNumWires = $("#probe2NumWires option:selected").val();
	replaceProbePic(2,selNumWires);
}

function selProbe3NumWires(){
	var selNumWires = $("#probe3NumWires option:selected").val();
	replaceProbePic(3,selNumWires);
}

function replaceProbePic(probeNum, selNumWires){	
	if (selNumWires == 2){
		$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='AudioPlug_2_120px.png' alt='2-Wire Audio Plug' style='float:right'>" );
	} else if (selNumWires == 3){
		$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='AudioPlug_3_120px.png' alt='2-Wire Audio Plug' style='float:right'>" );
	} else if (selNumWires == 4){
		$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='AudioPlug_4_120px.png' alt='2-Wire Audio Plug' style='float:right'>" );
	}	
}

function replaceChamberTrmBlkPic(){
	var probeNum = 0;
	var selProbeType = $("#probe0Type option:selected").text();
	var selNumWires = $("#probe0NumWires option:selected").val();
	
	if (selProbeType == "Thermocouple"){
		
		if (selNumWires == 2){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_ThermoCoup_2Wire.png' alt='3-Wire Terminal Block' style='float:right'>" );		
		} else if (selNumWires == 3){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_ThermoCoup_2Wire_Single.png' alt='3-Wire Terminal Block' style='float:right'>" );
		} else {
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_Custom_xWires.png' alt='Custom Terminal Block' style='float:right'>" );
		}		
		
	} else if (selProbeType == "Thermistor"){
		
		if (selNumWires == 2){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_Thermistor_2Wire_Share.png' alt='2-Wire Terminal Block' style='float:right'>" );
		} else if (selNumWires == 3){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_Thermistor_3Wire_Share.png' alt='3-Wire Terminal Block' style='float:right'>" );
		} else if (selNumWires == 4){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_Thermistor_4Wire_Share.png' alt='Custom Terminal Block' style='float:right'>" );
		}	else {
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_Custom_xWires.png' alt='Custom Terminal Block' style='float:right'>" );
		}	
		
	} else {
		//Defaults to RTD type		
		if (selNumWires == 2){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_RTD_2Wire_Share.png' alt='2-Wire Terminal Block' style='float:right'>" );
		} else if (selNumWires == 3){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_RTD_3Wire_Share.png' alt='3-Wire Terminal Block' style='float:right'>" );
		} else if (selNumWires == 4){
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_RTD_4Wire_Share.png' alt='4-Wire Terminal Block' style='float:right'>" );
		} else {
			$("#probe"+probeNum+"Pic").replaceWith( "<img id='probe"+probeNum+"Pic' src='TB_Custom_xWires.png' alt='Custom Terminal Block' style='float:right'>" );
		}
				
	}

}

function saveConfig() {	
	log("Save config called!");

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
		// if (key == "cbStatus"){
			// return gotoNextKey;
		// }
		var isChecked = $('#' + key).is(':checked'); 
		if (isChecked){
			log("Updating TC with checkbox bool: key = " + key + " value = 1");
			arrKvps[arrKvps.length] = (key + "=1");
		} else {
			log("Updating TC with checkbox bool: key = " + key + " value = 0");
			arrKvps[arrKvps.length] = (key + "=0");
		}	
	});
	
	var selPhvMode = $("#phvMode option:selected").val();
	arrKvps[arrKvps.length] = ("phvMode=" + selPhvMode);
	
	// var patcMode = $("input[name=patcMode]:checked").val();
	// log("Adding  patcMode = " + patcMode);
	// arrKvps[arrKvps.length] = ("patcMode=" + patcMode);
	
	var patcMode = $("#patcMode option:selected").val();
	arrKvps[arrKvps.length] = ("patcMode=" + patcMode);
	
	var selSlewRate = $("#slewRate option:selected").val();
	arrKvps[arrKvps.length] = ("slewRate=" + selSlewRate);
	
	var selTempScale = $("#tempScale option:selected").val();
	arrKvps[arrKvps.length] = ("tempScale=" + selTempScale);
	
	if ($("#isProbeChange").val() != null){
		var pcVal = $("#isProbeChange").val();
		if (pcVal == 1){
			arrKvps[arrKvps.length] = ("isProbeChange=1");
			$("#isProbeChange").val("0");
		} else {
			arrKvps[arrKvps.length] = ("isProbeChange=0");
		}		
	}
	
	if ($("#isReboot").val() != null){
		var resetVal = $("#isReboot").val();
		if (resetVal == '1'){
			arrKvps[arrKvps.length] = ("isReboot=1");
			$("#isReboot").val('0');
		} else {
			arrKvps[arrKvps.length] = ("isReboot=0");
		}		
	}

	
	//Get all the drop-downs
	for (var i = 0; i < 4; i++){
		
		var probeType = $("#probe" + i + "Type option:selected").val();
		arrKvps[arrKvps.length] = ("probe"+i+"Type=" + probeType);

		var probeModel = $("#probe"+i+"Model option:selected").val();
		arrKvps[arrKvps.length] = ("probe"+i+"Model=" + probeModel);
		
		var probeNumWires = $("#probe"+i+"NumWires option:selected").val();
		arrKvps[arrKvps.length] = ("probe"+i+"NumWires=" + probeNumWires);
	}
	
			
	//Concat kvps together in csv string.
	if (arrKvps.length > 0){
		var csvKvps = arrKvps.join(',');
		log("Updating TC with: csvKpvs: " + csvKvps);
		setCmdControl("setAbpKvp", csvKvps);
	} else {
		log("Save: arryKvps is 0");
	}	
	
}

function setCmdControl(cmd, value){
	sessionStorage.setItem(cmd, value);	//pass value to control.js .
	sessionStorage.setItem('cmdControl', cmd);	//tell control.js to run command .
}

function getCommand(){
	//If cmdControl is null do nothing.
	if (!sessionStorage.getItem("cmdConfig")){
		//do nothing.
		//console.log("cmdConfig is null");		
	} else {
		var cmdCfg = sessionStorage.getItem("cmdConfig");
		//Delete cmdConfig after retrieval.
		sessionStorage.removeItem("cmdConfig");
		console.log("Received cmdConfig = " + cmdCfg);
		if (cmdCfg == "getConfig"){
			getConfig();
		} else if (cmdCfg == "checkConsole"){
			checkConsole();
		}	else if (cmdCfg == "updateWiFi"){
			updateWiFi();
		}		
	}
}

function init() {
	//check for web storage support.
	if (typeof(Storage) == "undefined") {
		alert("Sorry, your browser does not support Web Storage...");
	    // Store - localStorage.setItem("lastname", "Smith");
	    // Retrieve - localStorage.getItem("lastname");
	}	
	checkConsole();
	updateWiFi();
	pollForCmd(1,ON);	// poll for commands from control.js: 1 second, state=ON
	sessionStorage.setItem('cmdControl', 'getConfigAbp');	//tell control.js to run command getConfigAbp.
	
}



]]></response>
    <comment></comment>
  </item>
</items>
