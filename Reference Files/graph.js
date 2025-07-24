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
<items burpVersion="2025.6.5" exportTime="Tue Jul 22 10:34:07 IDT 2025">
  <item>
    <time>Tue Jul 22 10:26:50 IDT 2025</time>
    <url><![CDATA[http://192.168.0.9/graph.js]]></url>
    <host ip="192.168.0.9">192.168.0.9</host>
    <port>80</port>
    <protocol>http</protocol>
    <method><![CDATA[GET]]></method>
    <path><![CDATA[/graph.js]]></path>
    <extension>js</extension>
    <request base64="false"><![CDATA[GET /graph.js HTTP/1.1
Host: 192.168.0.9
Accept-Language: en-US,en;q=0.9
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36
Accept: */*
Referer: http://192.168.0.9/graph.html
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

]]></request>
    <status>200</status>
    <responselength>15805</responselength>
    <mimetype>script</mimetype>
    <response base64="false"><![CDATA[HTTP/1.1 200 OK
Content-Length: 15635
Content-Type: application/javascript
Content-Disposition: inline; filename="graph.js"
Connection: close
Accept-Ranges: none

/**
 * 
 */
"use strict"

var graphCanvas, graphContext, pixelsPerSample, pixelsPerDegree, pixelsPerMinute;
var pollTimer = null;
var ON = 1;
var OFF = 0;

// data sets -- set literally or obtain from an ajax call

var maxTemp = 500;	//Y axis
var minTemp = 0;	//Y axis
var degreesPerRow = 25;	// Y axis
var colHead = 50;
var rowHead = 50;
var margin = 5;

var numSamples = 16;
var minutesPerSample = 1;	// in minutes/sample.

var tempScale = 1; //1=F, 2=C

var lastChamberX, lastChamberY, lastProbeX, lastProbeY, lastTargetProbeX, lastTargetProbeY, lastTargetX, lastTargetY;

var startTime = new Date().getTime();
//console.log("startTime= " + startTime);
var isProbeCook = 0;

function init() {
	if (typeof(Storage) == "undefined") {
		alert("Sorry, your browser does not support Web Storage for graphing...");
	    // Store - localStorage.setItem("lastname", "Smith");
	    // Retrieve - localStorage.getItem("lastname");
	}
		checkConsole();
		setTempScale();
    // set these values for your data
    graphCanvas = document.getElementById("graphCanvas");
    graphContext = graphCanvas.getContext("2d");
    graphContext.fillStyle = "black";
    graphContext.font = "14pt Helvetica";
    // Initialize lastChamberY in pixels to canvas height.
    lastChamberY = graphCanvas.height-margin;
    lastChamberX = 0;
    lastProbeY = graphCanvas.height-margin;
    lastProbeX = 0;
    lastTargetY = graphCanvas.height-margin;
    lastTargetX = 0;
    lastTargetProbeY = graphCanvas.height-margin;
    lastTargetProbeX = 0;
    // set vertical scalar to available height / data points = pixels/degreesF
    pixelsPerDegree = (graphCanvas.height - colHead - margin) / (maxTemp - minTemp);
    // set horizontal scalar to available width / number of samples = pixels/sample
    pixelsPerSample = (graphCanvas.width - rowHead) / numSamples;
    pixelsPerMinute = pixelsPerSample/minutesPerSample;	//in pixels/minute

    drawColumns();
    drawRows();
		var dataLength = sessionStorage.length;
		console.log("sessionStorage.length = " + dataLength);
		if (dataLength > 0){
			rePlotData();
		} else {
			cleanGraph();
		}
    //pollStatsController(20, ON);
    sessionStorage.setItem('cmdControl', 'getGraphStats');	//tell control.js to run command getGraphStats.
    getStatsFromController();

}

function setTempScale(){
	var strTempScale = sessionStorage.getItem("tempScale");
	var intTempScale = parseInt(strTempScale);
	if (intTempScale != tempScale){
		if (intTempScale > 0 && intTempScale < 3){
			tempScale = intTempScale;				
		}
	}	
	if (tempScale == 2){
		maxTemp = 260;	//Y axis
		minTemp = 0;	//Y axis
		degreesPerRow = 20;	// Y axis
	} else {
		maxTemp = 500;	//Y axis
		minTemp = 0;	//Y axis
		degreesPerRow = 25;	// Y axis
	}	
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

function getStatsFromController(limit){	
	//checkConsole();	
	getCommand();
	var count = sessionStorage.length;
	//console.log("sessionStorage.length = " + sessionStorage.length);
	var postRate = sessionStorage.getItem("postRate");
	if (postRate == null){
		postRate = 10;
	} else {
		postRate = Number(postRate); 
				
	}
	
	var pollRate_ms = postRate*1000;
	
	var bbqState = sessionStorage.getItem("bbqState");
	//console.log("BBQ_STATE = " + bbqState);
	if (bbqState <= '0'){
		//console.log("BBQ_STATE = " + "LessThan OFF");
		setTimeout(function(){getStatsFromController("LAST")},pollRate_ms);
		return;
	}
	
	log("getStatsFromController called. Count = " + count);
	
	if (count <= 0){
		cleanGraph();
		log("getStatsFromController reports sessionStorage.length <=0");
		sessionStorage.setItem('cmdControl', 'getGraphStats');	//tell control.js to run command getGraphStats.
		setTimeout(function(){getStatsFromController("LAST")},pollRate_ms);
		//setInterval(function(){getStatsFromController("LAST")},pollRate_ms);
		return;
	}
	var key = "last";
	var value = sessionStorage.getItem(key);
//	if (limit.search("ALL") == 0){
//		for (var i = 0; i < count; i++){
//			key = sessionStorage.key(i);
//			value = sessionStorage.getItem(key);
//			log("SessionStorage key = " + key + " and value = " + value);
//		}
//	} 
	//isProbeCook = sessionStorage.getItem("isProbeCook");
	isProbeCook = sessionStorage.getItem("statusIsProbeCook");
	log("isProbeCook = " + isProbeCook);
	var time = getVarFromKvp("runTimeSeconds", value);
	//console.log("time = " + time);
//	var probeTemp = getVarFromKvp("probeTemp", value);
//	var targetProbeTemp = getVarFromKvp("targetProbeTemp", value);
	var probeTemp = 0;
	var targetProbeTemp = 0;
	if (isProbeCook == 1){
		probeTemp = getVarFromKvp("probeTemp", value);
		targetProbeTemp = getVarFromKvp("targetProbeTemp", value);
	}
	var chamberTemp = getVarFromKvp("chamberTemp", value);
	var targetTemp = getVarFromKvp("targetTemp", value);
	var runTimeMinutes = time/60;
	$("#targetTemp").text(targetTemp);
	$("#chamberTemp").text(chamberTemp);
	$("#probeTemp").text(probeTemp);
	$("#targetProbeTemp").text(targetProbeTemp);
	$("#dcOn").text(getVarFromKvp("dcOn", value));
	$("#dcOff").text(getVarFromKvp("dcOff", value));
	$("#augerOn").text(getVarFromKvp("augerOn", value));
	log("Plotting chamber temp = " + chamberTemp + " runTimeMinutes = " + runTimeMinutes);
	plotChamberData(runTimeMinutes, chamberTemp);
	log("Plotting probe temp = " + probeTemp + " runTimeMinutes = " + runTimeMinutes);
	plotProbeData(runTimeMinutes, probeTemp);
	log("Plotting targetProbe temp = " + targetProbeTemp + " runTimeMinutes = " + runTimeMinutes);
	plotTargetProbeData(runTimeMinutes, targetProbeTemp);
	log("Plotting target temp = " + targetTemp + " runTimeMinutes = " + runTimeMinutes);
	plotTargetData(runTimeMinutes, targetTemp);
	sessionStorage.setItem('cmdControl', 'getGraphStats');	//tell control.js to run command getGraphStats.
	setTimeout(function(){getStatsFromController("LAST")},pollRate_ms);

}

function rePlotData(){
	console.log("Replot data called.");
	var arrTimes = [];
	var bResize = false;
	lastChamberY = graphCanvas.height-margin;
    lastChamberX = 0;
    lastProbeY = graphCanvas.height-margin;
    lastProbeX = 0;
    lastTargetProbeY = graphCanvas.height-margin;
    lastTargetProbeX = 0;
    lastTargetY = graphCanvas.height-margin;
    lastTargetX = 0;
	//Build an array of times for sorting.
	var count = sessionStorage.length;
	log("rePlotData called. SessionStorage length = " + count);
	if (count <= 0){
		log("rePlotData reports sessionStorage.length <=0");
		return;
	}
	for (var i = 0; i < count; i++){
		key = sessionStorage.key(i);	
		if (key.search("STATS") == 0){
			//log("replotData: SessionStorage key = " + key);
			var arrTime = key.split("STATS_", 2);
			var time  = arrTime[1].trim();
			arrTimes[arrTimes.length] = time;
		}
	}
	
	arrTimes.sort(function(a, b){return a-b});
	graphContext.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
	drawColumns();
    drawRows();
	for (var i = 0; i < arrTimes.length; i++){
		var seconds = arrTimes[i];
		var key = "STATS_" + seconds;
		var value =  sessionStorage.getItem(key);
		//log("rePlotData key = " + key + " value = " + value);		
		var chamberTemp = getVarFromKvp("chamberTemp", value);
//		var probeTemp = getVarFromKvp("probeTemp", value);
//		var targetProbeTemp = getVarFromKvp("targetProbeTemp", value);
		var probeTemp = 1;
		var targetProbeTemp = 0;
		if (isProbeCook == 1){
			probeTemp = getVarFromKvp("probeTemp", value);
			targetProbeTemp = getVarFromKvp("targetProbeTemp", value);
		}
		var targetTemp = getVarFromKvp("targetTemp", value);
		var minutes = seconds/60;
		log("rePlotting chamber temp = " + chamberTemp + " runTimeMinutes = " + minutes);
		plotChamberData(minutes, chamberTemp);
		log("rePlotting probe temp = " + probeTemp + " runTimeMinutes = " + minutes);
		plotProbeData(minutes, probeTemp);
		log("rePlotting target probe temp = " + targetProbeTemp + " runTimeMinutes = " + minutes);
		plotTargetProbeData(minutes, targetProbeTemp);
		log("rePlotting target temp = " + targetTemp + " runTimeMinutes = " + minutes);
		plotTargetData(minutes, targetTemp);
	}
}

//function pollStatsController(postRate, state){
	//Moved to libtools.js
//}

function getXPixelByTime(minutes){
	//Returns the x value in pixels.
	pixelsPerMinute = pixelsPerSample/minutesPerSample;	//in pixels/minute
	//log("getXPixelByTime: pixelsPerMinute = " + pixelsPerMinute);
	var x0 = 0;
	// var x0 = pixelsPerMinute * 1;	//x0 = pixels/minute * 1 minute in pixels
	var xP = minutes*pixelsPerMinute;	//xP = x minutes * pixels/minute  in pixels.
	
	return (x0 + xP);
}

function getYPixelByTemp(temp){
	//Returns the y value
	var y0 = graphCanvas.height - margin;			// 0 degrees F in pixels
	var yP = temp*pixelsPerDegree;	// dataSet in F and pixelsPerDegree in pixels/F
	return (y0 - yP);
}

function increaseGraph(){
	minutesPerSample++;
	log("increaseGraph called.  Setting minutesPerSample = " + minutesPerSample);
	//pixelsPerSample = (graphCanvas.width - rowHead) / (numSamples);
	pixelsPerMinute = pixelsPerSample/minutesPerSample;
	
}

function drawColumns(){
	log("Drawing Columns...");
    graphContext.strokeStyle="rgba(128, 128, 255, 0.5)"; // light blue lines
    graphContext.beginPath();
    // print  column time and draw vertical grid lines
    for (var i = 0; i <= numSamples; i++) {
        var x = i * pixelsPerSample;
        if (i == numSamples){
        	try {
        		graphContext.fillText(" ", x, colHead - margin);
        	} catch(err) {
        		log("ERR: Drawing Columns: " + err);
        	}    	
        } else {
        	try {
        		graphContext.fillText(i * minutesPerSample, x, colHead - margin);   
            	graphContext.moveTo(x, colHead);
                graphContext.lineTo(x, graphCanvas.height - margin);  	
        	} catch(err) {
        		log("ERR: Drawing Columns: " + err);
        	}
        	
        }
    	
//        if (i == 0){
//        	graphContext.fillText(" ", x, colHead - margin);
//        } else {
//        	graphContext.fillText(i * minutesPerSample, x, colHead - margin);   
//        	graphContext.moveTo(x, colHead);
//            graphContext.lineTo(x, graphCanvas.height - margin);
//        }         
    }
    graphContext.stroke();
}

function drawRows(){
	log("Drawing rows...");
    graphContext.strokeStyle="rgba(128, 128, 255, 0.5)"; // light blue lines
    graphContext.beginPath();
    // print row temperature and draw horizontal grid lines
    var count = 0;
    for (var temp = maxTemp; temp >= minTemp; temp -= degreesPerRow) {
        var y = colHead + (pixelsPerDegree * count * degreesPerRow);
        var x0 = 0;
        //graphContext.fillText(temp, margin, y + margin);
        //graphContext.moveTo(rowHead, y);
        //graphContext.lineTo(graphCanvas.width, y);
       try {
    	   graphContext.moveTo(x0, y);
           graphContext.lineTo(graphCanvas.width-rowHead-margin, y);
           graphContext.fillText(temp, graphCanvas.width-rowHead, y + margin);
       } catch(err){
    	   log("ERR: Drawing Columns: " + err);
       }
        count++;
    }
    graphContext.stroke();
	
}

function plotChamberData(time, temp){
	//log("Plotting Chamber datar...");
	var x = getXPixelByTime(time);
	var y = getYPixelByTemp(temp);	
	if (x >= graphCanvas.width-margin-rowHead){
		increaseGraph();
		rePlotData();
		return;
	}
  graphContext.beginPath();
  //log("plotChamberData: moveTo: lastChamberX = " + lastChamberX + " lastChamberY = " + lastChamberY);
  graphContext.moveTo(lastChamberX,lastChamberY );
	//log("plotChamberData: lineTo: x = " + x + " y = " + y);
	graphContext.strokeStyle = "red";
	graphContext.lineTo(x, y);
	graphContext.stroke();
	lastChamberX = x;
	lastChamberY = y;
}

function plotProbeData(time, temp){
	//log("Plotting Probe datar...");
	var x = getXPixelByTime(time);
	var y = getYPixelByTemp(temp);	
	if (x >= graphCanvas.width-margin-rowHead){
		increaseGraph();
		rePlotData();
		return;
	}
  graphContext.beginPath();
  graphContext.moveTo(lastProbeX,lastProbeY );
	graphContext.strokeStyle = "purple";
	graphContext.lineTo(x, y);
	graphContext.stroke();
	lastProbeX = x;
	lastProbeY = y;
}

function plotTargetProbeData(time, temp){
	//log("Plotting Probe datar...");
	var x = getXPixelByTime(time);
	var y = getYPixelByTemp(temp);	
	if (x >= graphCanvas.width-margin-rowHead){
		increaseGraph();
		rePlotData();
		return;
	}
  graphContext.beginPath();
  graphContext.moveTo(lastTargetProbeX,lastTargetProbeY );
	graphContext.strokeStyle = "blue";
	graphContext.lineTo(x, y);
	graphContext.stroke();
	lastTargetProbeX = x;
	lastTargetProbeY = y;
}

function plotTargetData(time, temp){
	//log("Plotting Target datar...");
	var x = getXPixelByTime(time);
	var y = getYPixelByTemp(temp);	
	if (x >= graphCanvas.width-margin-rowHead){
		increaseGraph();
		rePlotData();
		return;
	}
  graphContext.beginPath();
  graphContext.moveTo(lastTargetX,lastTargetY );
	graphContext.strokeStyle = "green";
	graphContext.lineTo(x, y);
	graphContext.stroke();
	lastTargetX = x;
	lastTargetY = y;
}

/* function clearData(){
	sessionStorage.clear();
	graphContext.clearRect(0, 0, graphCanvas.width, graphCanvas.height);
	drawColumns();
  drawRows();
} */

function cleanGraph(){	
	clearGraphData();
	numSamples = 16;
	minutesPerSample = 1;	// in minutes/sample.
	rePlotData();
}


function clearGraphData(){
	var arrTimes = [];
	//Build an array of times for sorting.
	var count = sessionStorage.length;
	console.log("clearGraphData called. SessionStorage length = " + count);
	if (count <= 0){
		console.log("clearGraphData reports sessionStorage.length <=0");
		return;
	}
	for (var i = 0; i < count; i++){
		key = sessionStorage.key(i);	
		if (key.search("STATS") == 0){
			//console.log("clearGraphData: SessionStorage key = " + key);
			var arrTime = key.split("STATS_", 2);
			var time  = arrTime[1].trim();
			arrTimes[arrTimes.length] = time;
		}
	}
	
	 arrTimes.sort(function(a, b){return a-b});
	for (var i = 0; i < arrTimes.length; i++){
		var seconds = arrTimes[i];
		var key = "STATS_" + seconds;
		//console.log("clearGraphData key = " + key);
		sessionStorage.removeItem(key);
	}
}

function getCommand(){
	//If cmdControl is null do nothing.
	if (!sessionStorage.getItem("cmdGraph")){
		//do nothing.
		//console.log("cmdGraph is null");		
	} else {
		var cmdGraph = sessionStorage.getItem("cmdGraph");
		//Delete cmdGraph after retrieval.
		sessionStorage.removeItem("cmdGraph");
		console.log("Received cmdGraph = " + cmdGraph);
		if (cmdGraph == "cleanGraph"){
			cleanGraph();
		} else if (cmdGraph == "checkConsole"){
			checkConsole();
		}	else if (cmdGraph == "updateWiFi"){
			updateWiFi();
		}			
	}
}

// function log(message) {
	//Moved to libtools.js
// }]]></response>
    <comment></comment>
  </item>
</items>
