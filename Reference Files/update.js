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
<items burpVersion="2025.6.5" exportTime="Tue Jul 22 10:33:43 IDT 2025">
  <item>
    <time>Tue Jul 22 10:26:42 IDT 2025</time>
    <url><![CDATA[http://192.168.0.9/update.js]]></url>
    <host ip="192.168.0.9">192.168.0.9</host>
    <port>80</port>
    <protocol>http</protocol>
    <method><![CDATA[GET]]></method>
    <path><![CDATA[/update.js]]></path>
    <extension>js</extension>
    <request base64="false"><![CDATA[GET /update.js HTTP/1.1
Host: 192.168.0.9
Accept-Language: en-US,en;q=0.9
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
Accept: */*
Referer: http://192.168.0.9/update.html
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

]]></request>
    <status>200</status>
    <responselength>3761</responselength>
    <mimetype>script</mimetype>
    <response base64="false"><![CDATA[HTTP/1.1 200 OK
Content-Length: 3591
Content-Type: application/javascript
Content-Disposition: inline; filename="update.js"
Connection: close
Accept-Ranges: none

/**
 * 
 */
"use strict"

var startTime = new Date().getTime();
var servers = "abpdev.muxall.com, cloud1.muxall.com"

function confirmUpdate() {
	var rptcVer = $("#rptcVersion").val();
	if (rptcVer == ""){
		alert("RPTC-Q Version is blank.  Enter a version like 0.440 for example.");
		return;
	}
	var bbqOn = sessionStorage.getItem("bbqOn");
	if (bbqOn == "1"){
		alert("Updates are only allowed when BBQ State is OFF.");
		return;
	}
	var txt = "WARNING: ";
	txt += "This update will delete ALL saved Recipes!\n\n"
	txt += "Update controller to " + rptcVer + " version ?\n";
  var ask = confirm(txt);
  if (ask == true) {   
		doUpdate();
  } else {
   console.log("Cancel update.");;
  }
}

function doUpdate(){
	console.log("Do update!");
	var rptcVer = $("#rptcVersion").val();
	var csvKvps = "rptcVer=" + rptcVer;
	setCmdControl("setAbpKvp", csvKvps);
	//$("#updateStatus").attr("data-value","Upgrading...");
	$("#updateStatus").text("Update started.");
	//setTimeout(function(){pollUpdateStatus()},60000);
	setTimeout(function(){window.parent.location.reload(true)},90000);
	
}


function scanRptcVersion(){

	var selectedRptcVersion = $("#selRptcVersion option:selected").val();
	log("scanRptcVersion selectedRptcVersion = " + selectedRptcVersion);
	var rptcVersion = $("#rptcVersion").val();
	switch(selectedRptcVersion) {
			case "0":
	    	//<option  value="0">Custom</option>
	    	//User values read in above.
				rptcVersion = "";
	        break;
	    case "1":
	    	//<option  value="1">Latest</option> 
	    	rptcVersion = "Latest";
	      break;
			case "2":
	    	//<option  value="2">Previous</option> 
	    	rptcVersion = "Previous";
	      break;

	    default:
	
	}
	
	log("Loading RPTC Version: " + rptcVersion);
	$("#rptcVersion").val(rptcVersion);
	//$("#statusTargetProbeTemp").text(targetProbeTemp);	

}

function getUpdateStatus(){
	console.log("Getting update settings...");
	if (sessionStorage.length <= 0){
		console.log("sessionStorage.length <= 0");

		return;
	} 
	
	messageBuffer = sessionStorage.getItem("getUpdateStatus")	//Get saved values from control.js
	updateStatusByForm("stausUpdate");
	// updateTextValuesByForm("configFuelControl");
	// updateCheckBoxesByForm("configFuelControl");
	
}

function setCmdControl(cmd, value){
	sessionStorage.setItem(cmd, value);	//pass value to control.js .
	sessionStorage.setItem('cmdControl', cmd);	//tell control.js to run command .
}

function getCommand(){
	//If cmdControl is null do nothing.
	if (!sessionStorage.getItem("cmdUpdate")){
		//do nothing.
		//console.log("cmdConfig is null");		
	} else {
		var cmdUpdate = sessionStorage.getItem("cmdUpdate");
		//Delete cmdConfig after retrieval.
		sessionStorage.removeItem("cmdUpdate");
		console.log("Received cmdUpdate = " + cmdUpdate);
		if (cmdUpdate == "getUpdateStatus"){
			getUpdateStatus();
		} else if (cmdUpdate == "checkConsole"){
			checkConsole();
		}	else if (cmdUpdate == "updateWiFi"){
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
	sessionStorage.setItem('cmdControl', 'getUpdateStatus');	//tell control.js to run command getUpdateStatus.
	
}



]]></response>
    <comment></comment>
  </item>
</items>
