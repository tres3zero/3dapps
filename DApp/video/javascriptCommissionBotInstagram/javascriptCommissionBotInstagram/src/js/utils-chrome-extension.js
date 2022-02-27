'use strict';
//same file for twitter and instagram extensions
/**
version: 2
update: 9/6/2020
**/
var allLogsInfos = [];

//TODO revoir ce fichier parce que y'a des variables qui dependent de xx-extension.js... c pas bon

class UtilsChromeExtension {
    static convertUsernamesInfosArrayOfHashMapToTable(arrayOfHashMap, setNumberCount = false, baseSocialNetworkUsernameURL = "") {
        var tableContent = "";
        console.log(arrayOfHashMap)
        for (let i = 0; i < arrayOfHashMap.length; i++) {
            tableContent += "<tr>";
            if (setNumberCount) {
                tableContent += "<td class='tdNumUsernameList'>" + (i + 1) + "</td>";
            }
            var arrayValues = arrayOfHashMap[i];
            tableContent += "<td class='tdImgSrcList'><a target=_blank href='" + baseSocialNetworkUsernameURL + arrayValues.username + "'>" +
                "<img class='imgInTableScrape' link='" + arrayValues.imgSrc + "' src='" + arrayValues.imgSrc + "'/>" + "</a></td>";
            tableContent += "<td class='tdUsernamesList'><a target=_blank href='" + baseSocialNetworkUsernameURL + arrayValues.username + "'>" + arrayValues.username + "</a></td>";
            tableContent += "<td class='tdIsFollowedList'>" + arrayValues.isFollowAlreadyAsked + "</td>";
            tableContent += "</tr>";
        }
        return tableContent;
    }

    static saveCSVContentToFile(csvContent = "value1,value2,value3", filename = "list.csv") {
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    static saveToTxt(txtContent, filename = "list.txt") {
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:text;charset=utf-8,' + encodeURIComponent(txtContent);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    static saveToHTML(htmlContent, filename = "list.html") {
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }

    static appDialog(title, message) {
        if (message != null) {
            message = message.replace(/<br>/g, "\n");
        }
        alert(title + "\n" + message);
    }

    static getDateAndTimeString() {
        var date = new Date();
        var dateString = date.toLocaleDateString(); //12/6/2018 or 6/12/2018, depends of the server
        dateString = UtilsChromeExtension.replaceAll(dateString, "/", "-");
        return dateString + "_" + date.toLocaleTimeString().replace(":", "h").replace(":", "m").replace(" ", ""); //8:50:20 PM
    }

    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static getTime() {
        //return new Date().toLocaleTimeString();
        return new Date().toTimeString().substring(0, 8);
    }

    static logInfo(message, color = "GREEN") {
        message = "[" + UtilsChromeExtension.getTime() + "] " + message
        console.log("%c" + message, "color: " + color);
        // let messagePopup = {};
        // messagePopup['type'] = "LOG";
        // messagePopup['message'] = message;
        allLogsInfos.unshift(message);
        // sendMessageToPopup(messagePopup);
    }

    static getAllLogsInfo() {
        return allLogsInfos;
    }

    static logDebug(message, color = "GRAY") {
        if (DEBUG && message !== null) {
            console.log("%c" + message, "color: " + color);
        }
    }

    static isThisTextContainsThisString(text, string) {
        if (text !== null) {
            return text.indexOf(string) > -1;
        }
        return false;
    }

    static sendMessageToPopup(message) {
        try {
            chrome.extension.sendMessage(message);
        } catch (error) {
            console.error("error: " + error)
        }
    }

    static sendMessageToContentScript(message) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            if (tabs == null || tabs.length == 0) {
                return;
            }
            chrome.tabs.sendMessage(tabs[0].id, {
                "message": message
            }); //, function(response) { doesn't work
        });
    }

    static getCurrentTabURL(callback) {
        chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function (tabs) {
            if (tabs !== null && tabs.length > 0) {
                var tabId = tabs[0].id;
                var urlCurrent = tabs[0].url;
                callback(urlCurrent, tabId);
            } else {
                callback(null, null);
            }
        });
    }

    //available in Utils.js
    static fallbackCopyTextToClipboard(text) {
        var textarea = document.createElement('textarea');
        //textarea.style.display = "none";
        textarea.textContent = text;
        textarea.value = text;
        document.body.appendChild(textarea);

        var selection = document.getSelection();
        var range = document.createRange();
        //  range.selectNodeContents(textarea);
        range.selectNode(textarea);
        selection.removeAllRanges();
        selection.addRange(range);

        var successCopy = document.execCommand('copy');
        selection.removeAllRanges();

        document.body.removeChild(textarea);
        return successCopy;
    }

    //available in Utils.js
    static copyTextToClipboard(text) {
        return UtilsChromeExtension.fallbackCopyTextToClipboard(text);
    }
    //available in Utils.js
    static removeLastCommaIfItIsInEndOfTheLine(stringContent) {
        if (stringContent !== null && stringContent.length > 1 && stringContent[stringContent.length - 1] == ",") {
            stringContent = stringContent.substr(0, stringContent.length - 1);
        } else if (stringContent.length == 1 && stringContent[stringContent.length] == ",") {
            stringContent = "";
        }
        return stringContent;
    }
    //available in Utils.js
    static convertArrayOfKeyMapArrayToCSV(arrayOfHashMap, takeTitleColumns = false, takeOnlyTheseKeys = null) {
        let csvContent = "";
        if (arrayOfHashMap == null) {
            return;
        }
        for (let i = 0; i < arrayOfHashMap.length; i++) {
            let csvCurrentLine = "";
            let arrayValues = arrayOfHashMap[i];

            for (let key in arrayValues) {
                if (takeTitleColumns && i == 0) {
                    if (takeOnlyTheseKeys !== null) {
                        for (let k = 0; k < takeOnlyTheseKeys.length; k++) {
                            if (takeOnlyTheseKeys[k] == key) {
                                csvContent += '"' + key + '"' + ",";
                            }
                        }
                    } else {
                        csvContent += '"' + key + '"' + ",";
                    }
                }
                if (takeOnlyTheseKeys !== null) {
                    for (let k = 0; k < takeOnlyTheseKeys.length; k++) {
                        if (takeOnlyTheseKeys[k] == key) {
                            csvCurrentLine += '"' + arrayValues[key] + '"' + ",";
                        }
                    }
                } else {
                    csvCurrentLine += '"' + arrayValues[key] + '"' + ",";
                }
            }
            if (takeTitleColumns && i == 0) {
                csvContent = UtilsChromeExtension.removeLastCommaIfItIsInEndOfTheLine(csvContent) + "\n";
            }
            csvCurrentLine = UtilsChromeExtension.removeLastCommaIfItIsInEndOfTheLine(csvCurrentLine);
            if (i == arrayOfHashMap.length - 1) {
                csvContent += csvCurrentLine;
            } else {
                csvContent += csvCurrentLine + "\n";
            }
        }
        return csvContent;
    }

    static replaceAll(str, find, replace) {
        return str.replace(new RegExp(find, 'g'), replace);
    }

    static getRandom(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }

    //i've similar function (but without selector) in Utils.js
    static getAttributeValueFromSelector(selector, attributeName, element = null) {
        let tempElement;
        if (element != null) {
            tempElement = element.querySelector(selector);
        } else {
            tempElement = document.querySelector(selector);
        }
        if (tempElement != null) { // && tempElement.hasAttribute(attributeName)) {
            return tempElement.getAttribute(attributeName);
        } else {
            return null;
        }
    }
    //i've similar function (but without selector) in Utils.js
    static getPropertyValueFromSelector(selector, propertyName, element = null) {
        let tempElement;
        if (element != null) {
            tempElement = element.querySelector(selector);
        } else {
            tempElement = document.querySelector(selector);
        }
        if (tempElement != null) {
            return tempElement[propertyName];
        } else {
            return null;
        }
    }

    static scrollToView(element, smooth = true) {
        try {
            let args = true;
            if (smooth) {
                args = {
                    behavior: "smooth",
                    // block: "start",
                    block: "center",
                    inline: "nearest"
                };
            }
            element.scrollIntoView(args);
            return true;
        } catch (error) {
            console.log(`scrollToView error: ${scrollToView}`);
            return false;
        }
    }
}
