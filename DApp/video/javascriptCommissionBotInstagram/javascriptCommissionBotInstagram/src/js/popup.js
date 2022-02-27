'use strict';
//i use exact same file in both instagram/twitter extensions
/**
popup is reloaded everytime you open the popup
version: 2
update: 9/6/2020
**/
/*
communicate background <-> popup
var port = chrome.extension.connect({
      name: "Sample Communication"
 });
 port.postMessage("Hi BackGround");
 port.onMessage.addListener(function(msg) {
      console.log("message recieved" + msg);
 });
 */

import EasyStorage from '/src/js/class/EasyStorage.js';
window.licensingFileLoaded = true;
var manifest = chrome.runtime.getManifest();
if (manifest.short_name.toLowerCase().includes("instagram")) {
    document.body.style.background = "#FFFFFF";
} else if (manifest.short_name.toLowerCase().includes("twitter")) {
    document.body.style.background = "#FFFFFF";
} else if (manifest.short_name.toLowerCase().includes("tiktok")) {
    //document.body.style.background = "linear-gradient(to bottom left, #FFFFFF, #a0a0a0)";
}
var spanVersion = document.getElementById("spanVersion");
if (spanVersion != null) {
    spanVersion.textContent = manifest.version;
}
var aNewslettersContact = document.getElementById("aNewslettersContact");
if (aNewslettersContact != null && manifest.author.newsletterLink != null) {
    aNewslettersContact.href = manifest.author.newsletterLink;
} else {
    aNewslettersContact.outerHTML = "";
}
var prefixFilenameForExport = "list_";

var radioBoxFollow = document.getElementById("radioBoxFollow");
var radioBoxUnfollow = document.getElementById("radioBoxUnfollow");
var radioBoxScrape = document.getElementById("radioBoxScrape");

var labelRadioBoxFollow = document.getElementById("labelRadioBoxFollow");
var labelRadioBoxUnFollow = document.getElementById("labelRadioBoxUnFollow");
var labelRadioBoxScrape = document.getElementById("labelRadioBoxScrape");

var divStatus = document.getElementById("divStatus");
var divTimer = document.getElementById("divTimer");

var buttonStart = document.getElementById("buttonStart");
var buttonStop = document.getElementById("buttonStop");

var inputNumberDelaySecMin = document.getElementById("inputNumberDelaySecMin");
var inputNumberDelaySecMax = document.getElementById("inputNumberDelaySecMax");

var inputNumberFollowUnfollowMax = document.getElementById("inputNumberFollowUnfollowMax");
var inputNumberBreakTimeInMins = document.getElementById("inputNumberBreakTimeInMins");
var inputNumberBreakEveryXFollowsOrUnfollows = document.getElementById("inputNumberBreakEveryXFollowsOrUnfollows");

var inputNumberSleepTimeScrapeSeconds = document.getElementById("inputNumberSleepTimeScrapeSeconds");
var inputNumberSleepEveryXUsernamesScraped = document.getElementById("inputNumberSleepEveryXUsernamesScraped");
var inputNumberUsernamesScrapedMax = document.getElementById("inputNumberUsernamesScrapedMax");

var divConfigurationFollowOrUnfollow = document.getElementById("divConfigurationFollowOrUnfollow");
var divConfigurationScrape = document.getElementById("divConfigurationScrape");
var tdNbUsernamesScraped = document.getElementById("tdNbUsernamesScraped");

//var textAreaUsernamesList = document.getElementById("textAreaUsernamesList");
//OR
//var divTextAreaUsernamesList = document.getElementById("divTextAreaUsernamesList");

var inputAutoWhitelist = document.getElementById("autoWhitelist");
var textareaWhitelist = document.getElementById("textareaWhitelist");

var divNbFollows = document.getElementById("divNbFollows");
//var divNbUnfollows = document.getElementById("divNbUnfollows");
var divLastFollowed = document.getElementById("divLastFollowed");
var divLastUnFollowed = document.getElementById("divLastUnFollowed");
var divLog = document.getElementById("divLog");
var tdStatus = document.getElementById("tdStatus");

var tdCopyUsernames = document.getElementById("tdCopyUsernames");
var tdClear = document.getElementById("tdClear");

var thNumUsername = document.getElementById("thNumUsername");
var thImgSrc = document.getElementById("thImgSrc");
var thUsernames = document.getElementById("thUsernames");
var thIsFollowed = document.getElementById("thIsFollowed");

var buttonExportCSV = document.getElementById("exportCSV");
var buttonExportXLS = document.getElementById("exportXLS");
var buttonExportTXT = document.getElementById("exportTXT");
var buttonExportHTML = document.getElementById("exportHTML");

var usernamesInfoContentArrayOfKeyMapArray = null;
/*
var buttonCopy = document.getElementById("buttonCopy");
var buttonClear = document.getElementById("buttonClear");
var textareaUsernames = document.getElementById("textareaUsernames");


var textareaUsernames = document.getElementById("textareaUsernames");

*/
toggleOpacityRadioBox();
toggleHideFollowsUnfollowsLastUsername();

radioBoxFollow.addEventListener('change', function () {
    stop();
    toggleOpacityRadioBox();
    toggleHideFollowsUnfollowsLastUsername();
});

radioBoxUnfollow.addEventListener('change', function () {
    stop();
    toggleOpacityRadioBox();
    toggleHideFollowsUnfollowsLastUsername();
});
radioBoxScrape.addEventListener('change', function () {
    stop();
    toggleOpacityRadioBox();
    toggleHideFollowsUnfollowsLastUsername();
});

thNumUsername.onclick = function (element) {

};

thImgSrc.onclick = function (element) {

};

thUsernames.onclick = function (element) {
    alert("copy usernames");
};

thIsFollowed.onclick = function (element) {

};

tdCopyUsernames.onclick = function (element) {
    copyUsernames();
};

tdClear.onclick = function (element) {
    clearTable();
};

buttonExportCSV.onclick = function (element) {
    var keysToTake = ["username", "isFollowAlreadyAsked", "imgSrc"];
    keysToTake = null;
    UtilsChromeExtension.saveCSVContentToFile(UtilsChromeExtension.convertArrayOfKeyMapArrayToCSV(usernamesInfoContentArrayOfKeyMapArray, false, keysToTake), prefixFilenameForExport + UtilsChromeExtension.getDateAndTimeString() + ".csv");
};

buttonExportXLS.onclick = function (element) {
    exportTableToExcel(prefixFilenameForExport + UtilsChromeExtension.getDateAndTimeString() + ".xls");
};
buttonExportTXT.onclick = function (element) {
    var keysToTake = ["username", "isFollowAlreadyAsked", "imgSrc"];
    keysToTake = null;
    UtilsChromeExtension.saveToTxt(UtilsChromeExtension.convertArrayOfKeyMapArrayToCSV(usernamesInfoContentArrayOfKeyMapArray, false, keysToTake), prefixFilenameForExport + UtilsChromeExtension.getDateAndTimeString() + ".txt");
};

buttonExportHTML.onclick = function (element) {
    UtilsChromeExtension.saveToHTML(document.getElementById("tableUsernamesInfos").outerHTML, prefixFilenameForExport + UtilsChromeExtension.getDateAndTimeString() + ".html");
};

buttonStart.onclick = function (element) {
    start();
};

buttonStop.onclick = function (element) {
    stop();
};

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        ////console.log(request);
        if (typeof request !== 'undefined') {
            var message = request;
            //console.log("message['type']");
            //console.log(message['type']);
            //console.log("message['status']");
            //console.log(message['status']);
            if (typeof message !== 'undefined') {
                if (message['type'] == "refresh") {
                    if (message['status'] == "SLEEPING") {
                        divStatus.innerHTML = "Sleep started at " + message['dateStartSleep'];
                    } else if (message['status'] == "STARTED") {
                        divStatus.innerHTML = "STARTED";
                    } else {
                        divStatus.innerHTML = "STOPPED";
                    }
                    colorStatus();
                    divNbFollows.innerText = message['follows'];
                    // divNbUnfollows.innerText = message['unfollows'];
                    if (configuration['radioBoxFollow']) {
                        divLastFollowed.innerText = message['lastFollowedUsername'];
                    } else if (configuration['radioBoxUnfollow']) {
                        divLastFollowed.innerText = message['lastUnFollowedUsername'];
                    } else if (configuration['radioBoxScrape']) {
                        if (typeof message['allUsernamesAndInfoInArray'] !== 'undefined') {
                            /*	if(textAreaUsernamesList !== null){
                            		textAreaUsernamesList.value = message['allUsernamesAndInfoInArray'];
                            	}else if(divTextAreaUsernamesList !== null){
                            		//console.log(message['allUsernamesAndInfoInArray']);
                            		divTextAreaUsernamesList.innerHTML = message['allUsernamesAndInfoInArray'];
                            	}
                            	*/
                            usernamesInfoContentArrayOfKeyMapArray = message['allUsernamesAndInfoInArray'];
                            console.log(usernamesInfoContentArrayOfKeyMapArray);
                            document.getElementById("tBodyUsernamesInfoList").innerHTML = UtilsChromeExtension.convertUsernamesInfosArrayOfHashMapToTable(usernamesInfoContentArrayOfKeyMapArray, true, baseSocialNetworkUsernameURL); // true for displayCountUsernames
                            UtilsChromeExtension.convertArrayOfKeyMapArrayToCSV(usernamesInfoContentArrayOfKeyMapArray);

                            //tdNbUsernamesScraped.innerHTML = message['allUsernamesAndInfoInArray'].split(/\r\n|\r|\n/).length - 1
                            tdNbUsernamesScraped.innerHTML = message['nbUsernamesInfoScraped'];
                        }
                    }
                    if (typeof message['logs'] !== "undefined") {
                        displayLogsInDivLog(message['logs'].join("<br>"));
                    }

                } else if (message['type'] == "STOP") {
                    stop();
                    // } else if (message['type'] == "LOG") {
                    //   console.log("MESSAGE LOG RECEIVED POPUP")
                    //     let log = message['message'];
                    //     displayLogsInDivLog(log);
                } else if (message['type'] == "refreshTime") {
                    divTimer = message['time'];
                } else if (message['type'] == "whitelist") {
                    if (configuration['autoWhitelist']) {
                        if (configuration['whitelistUsernames'] == "" || configuration['whitelistUsernames'] == null) {
                            configuration['whitelistUsernames'] = message['username'];
                        } else {
                            configuration['whitelistUsernames'] = configuration['whitelistUsernames'] + "," + message['username'];
                        }
                        applyValueIfValueExists(textareaWhitelist, configuration['whitelistUsernames']);
                        saveConfiguration();
                    }
                }
            }
        }
    }
);
/**


**/
var configuration = {};
loadConfiguration();
refreshDataFromContentScript();
colorStatus();
/*
//getCurrentScriptStatus();
function getCurrentScriptStatus(){
	getStoredVariable("status", function(value){
		if(value !== null){
			divStatus.innerHTML = value;
		}
		colorStatus();
	});
}
*/
function displayLogsInDivLog(message) {
    divLog.innerHTML = message;
    // divLog.innerHTML = message + "<br>" + divLog.innerHTML;
}

function toggleHideFollowsUnfollowsLastUsername() {
    if (radioBoxScrape.checked) {
        document.getElementById("trFollows").style.display = "none";
        
        document.getElementById("trLastUsername").style.display = "none";
        divConfigurationScrape.style.display = "block";
        divConfigurationFollowOrUnfollow.style.display = "none";
    } else {
        document.getElementById("trFollows").style.display = "table-row";
        
        document.getElementById("trLastUsername").style.display = "table-row";
        divConfigurationScrape.style.display = "none";
        divConfigurationFollowOrUnfollow.style.display = "block";
    }
}

function colorStatus() {
    //console.log(divStatus.innerHTML);
    if (divStatus.innerHTML == "STOPPED") {
        tdStatus.style.backgroundColor = "#262626";
    } else {
        tdStatus.style.backgroundColor = "#262626";
    }
}

function toggleOpacityRadioBox() {
    labelRadioBoxFollow.style.opacity = radioBoxFollow.checked ? 1 : 0.6;
    labelRadioBoxUnFollow.style.opacity = radioBoxUnfollow.checked ? 1 : 0.6;
    labelRadioBoxScrape.style.opacity = radioBoxScrape.checked ? 1 : 0.6;
}

function loadConfiguration() {
    console.log("loadConfiguration()");
    EasyStorage.getItem("config", function (result) {
        if (result.success === true) {
            configuration = result.response;
            radioBoxFollow.checked = configuration['radioBoxFollow'];
            radioBoxUnfollow.checked = configuration['radioBoxUnfollow'];
            radioBoxScrape.checked = configuration['radioBoxScrape'];
            toggleOpacityRadioBox();
            toggleHideFollowsUnfollowsLastUsername();

            applyValueIfValueExists(inputNumberDelaySecMin, configuration['inputNumberDelaySecMin']);
            applyValueIfValueExists(inputNumberDelaySecMax, configuration['inputNumberDelaySecMax']);

            applyValueIfValueExists(inputNumberFollowUnfollowMax, configuration['inputNumberFollowUnfollowMax']);

            applyValueIfValueExists(inputNumberBreakTimeInMins, configuration['inputNumberBreakTimeInMins']);
            applyValueIfValueExists(inputNumberBreakEveryXFollowsOrUnfollows, configuration['inputNumberBreakEveryXFollowsOrUnfollows']);

            applyValueIfValueExists(inputNumberSleepTimeScrapeSeconds, configuration['inputNumberSleepTimeScrapeSeconds']);
            applyValueIfValueExists(inputNumberSleepEveryXUsernamesScraped, configuration['inputNumberSleepEveryXUsernamesScraped']);
            applyValueIfValueExists(inputNumberUsernamesScrapedMax, configuration['inputNumberUsernamesScrapedMax']);

            console.log("whitelistUsernames");
            console.log(configuration['whitelistUsernames']);
            inputAutoWhitelist.checked = configuration['autoWhitelist'];
            if (configuration['whitelistUsernames'] !== null) {
                applyValueIfValueExists(textareaWhitelist, configuration['whitelistUsernames']);
            }
        }
    });
}

function applyValueIfValueExists(input, value) {
    if (input !== null && (typeof input !== 'undefined') && value !== null && (typeof value !== 'undefined')) {
        input.value = value;
    }
}

function saveConfiguration() {
    console.log("saveConfiguration()");
    EasyStorage.setItem("config", configuration);
}

function getConfigurationFromInputValues() {
    console.log("getConfigurationFromInputValues()");
    configuration['radioBoxFollow'] = radioBoxFollow.checked;
    configuration['radioBoxUnfollow'] = radioBoxUnfollow.checked;
    configuration['radioBoxScrape'] = radioBoxScrape.checked;
    let whitelistUsernames = textareaWhitelist.value;
    whitelistUsernames = whitelistUsernames.replace(/(\r\n|\n|\r)/gm, "");
    whitelistUsernames = whitelistUsernames.replace(" ", "");
    whitelistUsernames = whitelistUsernames.trim();
    configuration['whitelistUsernames'] = whitelistUsernames;
    configuration['autoWhitelist'] = inputAutoWhitelist.checked;
    if (radioBoxScrape.checked) {
        if (checkIfValueIsCorrect(inputNumberSleepTimeScrapeSeconds) === true) {
            configuration['inputNumberSleepTimeScrapeSeconds'] = inputNumberSleepTimeScrapeSeconds.value;
        } else {
            return false;
        }
        if (checkIfValueIsCorrect(inputNumberSleepEveryXUsernamesScraped, 12) === true) {
            configuration['inputNumberSleepEveryXUsernamesScraped'] = inputNumberSleepEveryXUsernamesScraped.value;
        } else {
            return false;
        }
        if (checkIfValueIsCorrect(inputNumberUsernamesScrapedMax, 1) === true) {
            configuration['inputNumberUsernamesScrapedMax'] = inputNumberUsernamesScrapedMax.value;
        } else {
            return false;
        }
    } else {
        if (checkIfValueIsCorrect(inputNumberDelaySecMin) === true) {
            configuration['inputNumberDelaySecMin'] = inputNumberDelaySecMin.value;
        } else {
            return false;
        }
        if (checkIfValueIsCorrect(inputNumberDelaySecMax) === true) {
            configuration['inputNumberDelaySecMax'] = inputNumberDelaySecMax.value;
        } else {
            return false;
        }
        if (checkIfValueIsCorrect(inputNumberFollowUnfollowMax) === true) {
            configuration['inputNumberFollowUnfollowMax'] = inputNumberFollowUnfollowMax.value;
        } else {
            return false;
        }
        if (checkIfValueIsCorrect(inputNumberBreakTimeInMins) === true) {
            configuration['inputNumberBreakTimeInMins'] = inputNumberBreakTimeInMins.value;
        } else {
            return false;
        }
        if (checkIfValueIsCorrect(inputNumberBreakEveryXFollowsOrUnfollows, 2) === true) {
            configuration['inputNumberBreakEveryXFollowsOrUnfollows'] = inputNumberBreakEveryXFollowsOrUnfollows.value;
        } else {
            return false;
        }
    }
    return true;
}

function checkIfValueIsCorrect(input, valueMin = 1) {
    console.log(input.value);
    console.log("input.value");
    console.log(valueMin);
    if (input !== null) {
        if (input.value !== null) {
            if (input.value.indexOf(".") > -1) {
                return false;
            }
            if (input.value >= valueMin) {
                return true;
            } else {
                alert(input.value + " is incorrect, minimum is " + valueMin);
                return false
            }
        }
    }
    return false;
}

function stop() {
    console.log("stop()");
    divStatus.innerHTML = "STOPPED";
    colorStatus();
    //	setStoredVariable("status", "STOPPED", null);
    UtilsChromeExtension.sendMessageToContentScript("STOP");
    //	stopTimer();
}

function start() {
    console.log("start()");
    if (window.licensingFileLoaded !== true) {
        return alert("Where is the license?");
    }
    let canStart = getConfigurationFromInputValues();
    if (canStart === true) {
        //startTimer();
        saveConfiguration();
        UtilsChromeExtension.sendMessageToContentScript(configuration);
        UtilsChromeExtension.sendMessageToContentScript("START");
        EasyStorage.setItem("status", "STARTED");
        divStatus.innerHTML = "STARTED";
        colorStatus();
    } else {
        console.log("Cannot start the bot because of incorrect parameter(s)")
        alert("Cannot start the bot because of incorrect parameter(s)");
    }
}

function copyUsernames() {
    if (usernamesInfoContentArrayOfKeyMapArray !== null) {
        let usernamesStringList = "";
        for (let i = 0; i < usernamesInfoContentArrayOfKeyMapArray.length; i++) {
            let usernameInfo = usernamesInfoContentArrayOfKeyMapArray[i];
            usernamesStringList += usernameInfo.username + (i == usernamesInfoContentArrayOfKeyMapArray.length - 1 ? "" : "\n");
            console.log(usernameInfo);
        }
        if (UtilsChromeExtension.copyTextToClipboard(usernamesStringList)) {
            console.log(usernamesStringList);
            alert(usernamesInfoContentArrayOfKeyMapArray.length + " usernames copied!");
        } else {
            alert("error copy");
        }
    }
}

function clearTable() {
    document.getElementById("tBodyUsernamesInfoList").innerHTML = "<tr><td>-</td><td>-</td><td>-</td><td>-</td></tr>";
}

function refreshDataFromContentScript() {
    UtilsChromeExtension.sendMessageToContentScript("refreshForPopup");
}

function exportTableToExcel(filename = "instagral_list.xls") {
    let tab_text = "<table border='2px'><tr bgcolor='#87AFC6'>";
    let j = 0;
    let tab = document.getElementById('tableUsernamesInfos'); // id of table

    for (let j = 0; j < tab.rows.length; j++) {
        tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
        //tab_text=tab_text+"</tr>";
    }

    tab_text = tab_text + "</table>";
    //tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
    //  tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // remove input params

    let ua = window.navigator.userAgent;
    let msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) // If Internet Explorer
    {
        txtArea1.document.open("txt/html", "replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus();
        sa = txtArea1.document.execCommand("SaveAs", true, filename);
    } else { //other browser not tested on IE 11
        //work but filename "download"  sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));
        //	let str = "Name, Price\nApple, 2\nOrange, 3";
        //	let uri = 'data:text/csv;charset=utf-8,' + str;

        let downloadLink = document.createElement("a");
        downloadLink.href = 'data:application/vnd.ms-excel,' + encodeURIComponent(tab_text);
        downloadLink.download = filename;

        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    return (sa);
}

/*
when someone wants my app without the licensing

add at bottom of popup.js:
$("#divLicense").remove();
window.licensingFileLoaded = true;

popup.html remove:
<script type="module" src="/src/js/licensing.js"></script>
*/
/*
var seconds = 0, minutes = 0, hours = 0, t;
var chronometerTimeString = "00:00:00";
var waitingTime = "00:00:00";

function add() {
	seconds++;
	if (seconds >= 60) {
		seconds = 0;
		minutes++;
		if (minutes >= 60) {
			minutes = 0;
			hours++;
		}
	}
	chronometerTime = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
}
function startTimer() {
	clearTimer();
	t = setInterval(add, 1000);
}

function stopTimer(){
	clearInterval(t);
}

function clearTimer(){
	divTimer.textContent = "00:00:00";
	seconds = 0; minutes = 0; hours = 0;
}
*/
