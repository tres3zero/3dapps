'use strict';
//const remote = require('electron').remote;
//if you require("./Utils") in the main process, you can access global var without remote
//and remote will be null
//const log = require('electron-log'); //https://www.npmjs.com/package/electron-log
// const remote = require('electron').remote;
// let globalAvailable = true;
// if (typeof remote !== "undefined") {
//     globalAvailable = false;
// }
const DISPLAY_SOURCE_FILE_IN_LOGS = true;
const USE_FULLPATH_FOR_SOURCE_FILE_IN_LOGS = false; //will ignore DISPLAY_SOURCE_FILE_IN_LOGS and use

let SOUNDS_TEST = {};
class Utils {

    //check if nodejs available
    static isNodeJS() {
        return (typeof process !== 'undefined') && (typeof process.versions.node !== 'undefined');
    }

    //check if from browser
    static isBrowser() {
        return (typeof window !== 'undefined') && (typeof window.navigator !== 'undefined');
    }

    static containsAtLeastOneString(string, ...values) {
        for (const value of arrayValues) {
            if (string == value) {
                return true;
            }
        }
        return false;
    }
    static containsAllStrings(string, ...values) {
        for (const value of values) {
            if (string !== value) {
                return false;
            }
        }
        return true;
    }
    /*****************************************************************************
    *****************************************************************************
     COPY/PASTE
    ****************************************************************************
    ****************************************************************************/
    static fallbackCopyTextToClipboard(text) {
        if (Utils.isBrowser()) {
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
        return false;
    }

    static copyTextToClipboard(text) {
        return Utils.fallbackCopyTextToClipboard(text);
    }

    /*****************************************************************************
    *****************************************************************************
      SLEEP
    ****************************************************************************
    ****************************************************************************/
    //await sleep(2000);
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /*****************************************************************************
    *****************************************************************************
      DATE
    ****************************************************************************
    ****************************************************************************/
    /*
    new Date().toJSON(); new Date().toISOString();
    "2020-03-24T23:04:08.450Z"
    */
    //2020-03-24 22:29:27
    static getTimestampMySQLFormat(timestampMS = null) {
        let timezoneOffset = (new Date()).getTimezoneOffset() * 60000; //because in ms
        if (timestampMS !== null) {
            return new Date(timestampMS - timezoneOffset).toISOString().slice(0, 19).replace('T', ' ');
        }
        return new Date(Date.now() - timezoneOffset).toISOString().slice(0, 19).replace('T', ' ');
    }

    static getTimestampMS() {
        return Date.now(); // new Date().getTime() is same
    }
    //22:29:27
    //Utils.getTime();
    static getTime(timestampMS = null) {
        return Utils.getTimestampMySQLFormat(timestampMS).split(' ')[1];
    }

    //2020-03-24
    static getDate(timestampMS = null) {
        return Utils.getTimestampMySQLFormat(timestampMS).split(' ')[0];
    }
    static minutesToMilliseconds(hours) {
        return hours * 60 * 60 * 1000;
    }
    static hoursToMilliseconds(hours) {
        return hours * 60 * 60 * 1000;
    }
    static daysToMilliseconds(hours) {
        return hours * 60 * 60 * 1000;
    }
    /*****************************************************************************
    *****************************************************************************
     ARRAY / OBJECTS (associative array / multidimensional)
    ****************************************************************************
    ****************************************************************************/
    static isSubKeyDefinedInArray(arr, ...keys) {
        var value = this.getValueFromArrayKeys(arr, ...keys);
        // Utils.log.debug("value="+value);
        if (typeof value === "undefined") {
            return false;
        }
        return true;
    }

    /**
    var array = {
        key1: "value1",
        key2: {
            subkey1: "subvalue1"
        }
    }
    Utils.getValueFromArrayKeys(array, "key2", "subkey1") --> "subvalue1"
    **/
    static getValueFromArrayKeys(arr, ...keys) {
        for (var i = 0; i < keys.length; ++i) {
            var key = keys[i];
            // Utils.log.debug("check key="+keys[i]);
            //if (!arr || !arr.hasOwnProperty(keys[i])){
            if (!this.checkIfArrayKeyExists(arr, key)) {
                // Utils.log.debug("check keys=false");
                return; //maybe return default value?
            }
            arr = arr[key];
        }
        // Utils.log.debug("check keys value="+arr);
        return arr;
    }

    static checkIfArrayKeyExists(arr, key) {
        if (arr == null || typeof arr === "undefined" || typeof arr === "string") {
            return false;
        }
        return key in arr;
    }

    static removeValueFromArray(arrayValues, value) {
        const index = arrayValues.indexOf(value);
        if (index > -1) {
            arrayValues.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
    NOT BY ME
     * Performs a deep merge of `source` into `target`.
     * Mutates `target` only but not its objects and arrays.
     *
     * @author inspired by [jhildenbiddle](https://stackoverflow.com/a/48218209).
     */
    static mergeTwoArraysOrObjectsIntoOneObject(target, source) {
        const isObject = (obj) => obj && typeof obj === 'object';

        if (!isObject(target)) {
            if (isObject(source)) {
                return source;
            }
        } else if (!isObject(source)) {
            if (isObject(target)) {
                return target;
            }
        }

        let final = {
            ...target
        }; //make a copy, so we don't change the original
        Object.keys(source).forEach(key => {
            const targetValue = final[key];
            const sourceValue = source[key];

            if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
                final[key] = targetValue.concat(sourceValue);
            } else if (isObject(targetValue) && isObject(sourceValue)) {
                final[key] = Utils.mergeTwoArraysOrObjectsIntoOneObject(Object.assign({}, targetValue), sourceValue);
            } else {
                final[key] = sourceValue;
            }
        });

        return final;
    }
    /*
    will return an object and not an array
    */
    static mergeArrays(...arrays) {
        return Utils.mergeObjects(arrays);
    }
    static mergeObjects(...objects) {
        let final = {};
        for (var obj of objects) {
            final = Utils.mergeTwoArraysOrObjectsIntoOneObject(final, obj);
        }
        return final;
    }
    static getSize(object) {
        if (object == null) {
            return 0;
        }
        return Object.keys(object).length;
    }
    static removeDuplicateFromArray(array) {
        return Array.from(new Set(array));
    }
    static includes(array, ...values) {
        if (Utils.isNotUndefinedAndNotNull(array)) {
            for (const value of values) {
                if (array.includes(value)) {
                    return true;
                }
            }
        }
        return false;
    }
    static includesAll(array, ...values) {
        if (Utils.isNotUndefinedAndNotNull(array)) {
            return array.every(function (i) {
                return values.includes(i)
            });
        }
        return false;
    }

    /*****************************************************************************
    *****************************************************************************
      DOM ELEMENTS
    ****************************************************************************
    ****************************************************************************/
    static getAttributeValueOfElement(element, attributeName, defaultValue = false) {
        if (typeof element !== 'undefined' && element !== null) {
            if (element.hasAttribute(attributeName)) {
                return element.getAttribute(attributeName);
            }
        }
        return defaultValue;
    }

    static getPropertyValueOfElement(element, propertyName, defaultValue = false) {
        if (typeof element !== 'undefined' && element !== null) {
            if (typeof element[propertyName] !== 'undefined') {
                return element[propertyName];
            }
        }
        return defaultValue;
    }

    static changeElementTextContent(elementOrElementId, string) {
        let element;
        if (typeof elementOrElementId === "string") {
            element = document.getElementById(elementOrElementId);
        } else {
            element = elementOrElementId;
        }
        if (typeof element !== 'undefined' && element !== null) {
            if (element.nodeName == "INPUT") {
                element.placeholder = string;
            } else {
                element.textContent = string;
            }
        }
    }
    static saveCSVContentToFile(csvContent = "value1,value2,value3", filename = "list.csv") {
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
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

    static saveToTxt(txtContent, filename = "list.txt") {
        var downloadLink = document.createElement("a");
        downloadLink.href = 'data:text;charset=utf-8,' + encodeURIComponent(txtContent);
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    }
    /*
    Utils.walkTheDOM(document, function (node) {
        console.log("node.nodeName="+node.nodeName + " - node.nodeValue="+ node.nodeValue);
         console.log(node);
    });
    original:
    //walkTheDOM(node, func){
    // func(node);
    // node = node.firstChild;
    // while (node) {
    //     walkTheDOM(node, func);
    //     node = node.nextSibling;
    // }
    //}
    */
    static walkTheDOM(node, func, nodeNameToRemove = null) {
        func(node)
        node = node.firstChild;
        while (node) {
            Utils.walkTheDOM(node, func, nodeNameToRemove);
            let previousNode = node;
            if (nodeNameToRemove !== null && node.nodeName == nodeNameToRemove) {
                node = node.nextSibling;
                if (previousNode !== null) {
                    previousNode.remove();
                }
            } else {
                node = node.nextSibling;
            }
        }
    }

    static getElementByXpath(xpath) {
        return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        /*
        var nodes = xml.evaluate(path, xml, null, XPathResult.ANY_TYPE, null);
                var result = nodes.iterateNext();
                while (result) {
                    txt += result.childNodes[0].nodeValue + "<br>";
                    result = nodes.iterateNext();
                }
           */
    }
    static hideScriptFromCodeSource(rootElement) {
        Utils.walkTheDOM(rootElement, function () {}, "SCRIPT");
    }
    static isScriptPresentsOnThisPage(scriptPath) {
        var result = false;
        //console.log(document.currentScript);
        var scripts = Array
            .from(document.querySelectorAll('script'))
            .map(scr => scr.src);

        scripts.forEach(function (item, index) {
            if (item.includes(scriptPath)) {
                result = true;
            }
        });
        console.log("isScriptPresentsOnThisPage(" + scriptPath + ")=" + result);
        return result;
    }
    /*****************************************************************************
    *****************************************************************************
      HTTP REQUEST (FETCH) / LOAD SCRIPT / OPEN URL
    ****************************************************************************
    ****************************************************************************/
    static openURL(url) {
        if (Utils.isNodeJS()) {
            Utils.nodeJS.openURL(url);
        } else {
            window.open(url);
        }
    }
    static async getPageContent(url) {
        // const response = await fetch(url, {
        // mode: 'cors',
        // headers: {
        // 'Access-Control-Allow-Origin':'*'
        // }
        // });
        // const text = await response.text();
        // // Utils.log.debug("text");
        // // Utils.log.debug(text);
        // return text;
        var result = await fetch(url, {
                /* mode: 'no-cors',
       headers: {
       'Access-Control-Allow-Origin':'*'
     },*/
                referrer: url
            }).then(async (response) => {
                if (!response.ok) {
                    return ('Network response was not ok');
                }
                return await response.text();
            })
            .catch(async (error) => {
                return 'There has been a problem with your fetch operation: ' + error;
            });
        return result;
    }

    //try to use jQuery then use javascript
    static loadScript(scriptPath, callback = function (loaded) {}) {
        if (typeof jQuery !== "undefined") {
            $.getScript(scriptPath, function (response, status, xhr) {
                if (status == "error") {
                    console.log(scriptPath + " not loaded.");
                    callback(false);
                } else {
                    console.log(scriptPath + " loaded.");
                    setScriptLoaded(scriptPath);
                    callback(true);
                }
            });
        } else {
            if (document.head !== null) {
                var script = document.head.createElement('script');
            } else {
                var script = document.createElement('script');
            }
            script.onload = function () {
                setScriptLoaded(scriptPath);
                callback(true);
            };
            script.onerror = function () {
                callback(false);
            };
            script.src = scriptPath;
            // document.head.appendChild(script); //or something of the likes
            document.appendChild(script);
        }
    }
    static isScriptAlreadyLoaded(scriptPath) {
        var isScriptLoaded = false;
        if (typeof window.scriptsLoaded === "undefined") {

        } else {
            if (typeof window.scriptsLoaded[scriptPath] !== "undefined") {
                isScriptLoaded = true;
            } else {
                isScriptLoaded = false;
            }
        }

        console.log("isScriptAlreadyLoaded(" + scriptPath + ")=" + isScriptLoaded);
        return isScriptLoaded;
    }

    static setScriptLoaded(scriptPath) {
        if (typeof window.scriptsLoaded === "undefined") {
            window.scriptsLoaded = {};
        }
        window.scriptsLoaded[scriptPath] = true;
    }
    /*****************************************************************************
    *****************************************************************************
     FORMAT / CONVERT / ENCODE / REPLACE / CHECK IF NULL/UNDEFINED
    ****************************************************************************
    ****************************************************************************/
    static formatNumber(number) {
        if (number !== null) {
            number = number.replace(/,/g, "");
            number = number.replace(/./g, "");
            number = number.replace(/ /g, "");
        }
        return number;
    }

    //text = 1,2 addede99
    //return [1, 2, 99]
    static extractNumbersFromText(text) {
        return text.match(/\d+/g);
    }

    static convertArrayOfKeyMapArrayToCSV(arrayOfHashMap, takeTitleColumns = false, takeOnlyTheseKeys = null) {
        var csvContent = "";
        if (arrayOfHashMap == null) {
            return;
        }
        for (i = 0; i < arrayOfHashMap.length; i++) {
            var csvCurrentLine = "";
            var arrayValues = arrayOfHashMap[i];
            //	logDebug(arrayValues);

            for (key in arrayValues) {
                if (takeTitleColumns && i == 0) {
                    if (takeOnlyTheseKeys !== null) {
                        for (k = 0; k < takeOnlyTheseKeys.length; k++) {
                            if (takeOnlyTheseKeys[k] == key) {
                                csvContent += '"' + key + '"' + ",";
                            }
                        }
                    } else {
                        csvContent += '"' + key + '"' + ",";
                    }
                }
                if (takeOnlyTheseKeys !== null) {
                    for (k = 0; k < takeOnlyTheseKeys.length; k++) {
                        if (takeOnlyTheseKeys[k] == key) {
                            csvCurrentLine += '"' + arrayValues[key] + '"' + ",";
                        }
                    }
                } else {
                    csvCurrentLine += '"' + arrayValues[key] + '"' + ",";
                }
            }
            if (takeTitleColumns && i == 0) {
                csvContent = Utils.removeLastCommaIfItIsInEndOfTheLine(csvContent) + "\n";
            }
            csvCurrentLine = Utils.removeLastCommaIfItIsInEndOfTheLine(csvCurrentLine);
            if (i == arrayOfHashMap.length - 1) {
                csvContent += csvCurrentLine;
            } else {
                csvContent += csvCurrentLine + "\n";
            }
        }
        return csvContent;
    }
    //https://www.w3resource.com/javascript/form/email-validation.php
    static isEmailValid(mail) {
		/*
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		*/
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/.test(mail)) {
            return true;
        }
        return false;
    }
    /*
         remove last char of a string
         ex: removeLastCommaIfItIsInEndOfTheLine("Hey you!,,",",");//"Hey you!,"
         ex: removeLastCommaIfItIsInEndOfTheLine("Hey you!,,",",",true);//"Hey you!"
         */
    static removeLastCommaIfItIsInEndOfTheLine(stringContent, characterToRemove, loop = false) {
        while (stringContent !== null && stringContent.length >= 1 && stringContent[stringContent.length - 1] == characterToRemove) {
            stringContent = stringContent.substr(0, stringContent.length - 1);
            if (!loop) {
                break;
            }
        }
        return stringContent;
    }
    static base64Encode(string) {
        if (Utils.isNodeJS()) {
            return Utils.nodeJS.base64Encode(string);
        } else {
            if (typeof window !== "undefined" && typeof window.btoa === "function") {
                return window.btoa(string); //javascript
            } else {
                Utils.log.error("btoa not available, string=" + string);
            }
        }
        return null;
    }

    static base64Decode(base64String) {
        if (Utils.isNodeJS()) {
            return Utils.nodeJS.base64Decode(base64String);
        } else {
            if (typeof window !== "undefined" && typeof window.atob === "function") {
                return window.atob(base64String); //javascript
            } else {
                Utils.log.error("atob not available, base64String=" + base64String);
            }
        }
        return null;
    }

    static isNotUndefinedAndNotNull(variable) {
        if (typeof variable !== "undefined" && variable !== null) {
            return true;
        }
        return false;
    }
    //https://stackoverflow.com/questions/15604140/replace-multiple-strings-with-multiple-other-strings
    /*
    var str = "I have a cat, a dog, and a goat.";
    var mapObj = {
       cat:"dog",
       dog:"goat",
       goat:"cat"
    };
    replaceAll(str, mapObj);
    or for normal (no map object):
    replaceAll(str, "cat", "dog")
    });*/
    static replaceAll(text, stringToReplaceOrMapObject, replaceBy = null) {
        if (typeof stringToReplaceOrMapObject === "string" && replaceBy !== null) {
            return text.replace(new RegExp(stringToReplaceOrMapObject, 'g'), replaceBy);
        }
        let re = new RegExp(Object.keys(stringToReplaceOrMapObject).join("|"), "g");
        return text.replace(re, function (matched) {
            return stringToReplaceOrMapObject[matched];
        });

    }
    /*function HeavyWorkload(nx, ny)
{
var data = [];

for(var x = 0; x < nx; x++)
{
 data[x] = [];

 for(var y = 0; y < ny; y++)
 {
  data[x][y] = Math.random();
 }
}

return data;
}
...you can now call it like this:

Async(HeavyWorkload, [1000, 1000],
function(result)
{
console.log(result);
}
);
    [constraints: the function header has to be as simple as function f(a,b,c) and if there's any result, it has to go through a return statement]
*/
    static Async(func, params, callback) {
        // ACQUIRE ORIGINAL FUNCTION'S CODE
        var text = func.toString();

        // EXTRACT ARGUMENTS
        var args = text.slice(text.indexOf("(") + 1, text.indexOf(")"));
        args = args.split(",");
        for (let arg of args) {
            arg = arg.trim();
        }

        // ALTER FUNCTION'S CODE:
        // 1) DECLARE ARGUMENTS AS VARIABLES
        // 2) REPLACE RETURN STATEMENTS WITH THREAD POSTMESSAGE AND TERMINATION
        var body = text.slice(text.indexOf("{") + 1, text.lastIndexOf("}"));
        for (var i = 0, c = params.length; i < c; i++) body = "var " + args[i] + " = " + JSON.stringify(params[i]) + ";" + body;
        body = body + " self.close();";
        body = body.replace(/return\s+([^;]*);/g, 'self.postMessage($1); self.close();');

        // CREATE THE WORKER FROM FUNCTION'S ALTERED CODE
        var code = URL.createObjectURL(new Blob([body], {
            type: "text/javascript"
        }));
        var thread = new Worker(code);

        // WHEN THE WORKER SENDS BACK A RESULT, CALLBACK AND TERMINATE THE THREAD
        thread.onmessage =
            function (result) {
                if (callback) callback(result.data);

                thread.terminate();
            }

    }
    /*
transform async to callback, idk if usefull, ex:
async function asynFunc(arg) {  arg = arg * 5;return arg;}
function syncFunc(arg) {  arg = arg * 10;return arg;}
asyncFunctionToCallback(asynFunc(5), function (result) {
   alert(result);
});
transform sync to promise
await syncFunctionToPromise(syncFunc(5));
    */
    static asyncFunctionToCallback(asyncMethod, callback) {
        (async () => {
            let func;
            if (typeof asyncMethod === "string") {
                func = new Function(func);
            } else {
                func = asyncMethod;
            }
            let result = await func;
            callback(result);
        })();
    }
    //doesn't work, thread still waits...
    static async syncFunctionToPromise(method) {
        return new Promise((resolve, reject) => {
            let func;
            let result;
            if (typeof method === "string") {
                func = new Function(method);
                result = func();
            } else {
                result = method;
            }
            resolve(result);
        });
    }
    // createAsync() {
    //
    //   const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
    //     return new AsyncFunction('a', `return new Promise((resolve) => {
    //         setTimeout(() => {resolve(a)}, 2000)
    //     });`);
    // }let asyncFn = createAsync();
    // asyncFn(1).then(function (result) {
    //     alert(result)
    // });
    //doesn't work, thread still waits...
    static async syncFunctionToAsync(method) {
        (async () => {
            let func;
            let result;
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
            if (typeof method === "string") {
                func = new AsyncFunction(method);
                result = func();
            } else {
                result = method;
            }
            resolve(result);
        })();
    }
    /*****************************************************************************
    *****************************************************************************
    RANDOM
    ****************************************************************************
    ****************************************************************************/
    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    static getRandomBoolean() {
        return Math.random() < 0.5;
    }
    static generateRandomID(length = 20) {
        let randomID = "";
        while (randomID.length < length) {
            randomID += Math.random().toString(36).substring(2, 15);
        }
        randomID = randomID.substring(0, length);
        return randomID;
    }
    /*****************************************************************************
        *****************************************************************************
       JSON
        ****************************************************************************
        ****************************************************************************/
    static stringify(object, prettyStyle = 4) {
        return JSON.stringify(object, Utils.getCircularReplacer(), prettyStyle);
    }
    static getCircularReplacer() {
        const seen = new WeakSet();
        return (key, value) => {
            if (typeof value === "object" && value !== null) {
                if (seen.has(value)) {
                    return;
                }
                seen.add(value);
            }
            return value;
        };
    }
    // var jsonWrong= 'dsede{"tete":"toto", "toto":"caca" sdds}'; fixJsonUnexpectedTokens(jsonWrong);
    static fixJsonUnexpectedTokens(content) { //jsonfilepath) {
        let jsonFixed = null;
        let messageUnexpectedToken = "Unexpected token";
        let messageUnexpectedNumber = "Unexpected number";
        let messageJSONAtPosition = "JSON at position ";
        try {
            JSON.parse(content);
        } catch (error) {
            //SyntaxError: Unexpected token q in JSON at position 0
            //SyntaxError: Unexpected end of JSON input
            let errorMessage = error.toString();
            if ((errorMessage.includes(messageUnexpectedToken) || errorMessage.includes(messageUnexpectedNumber)) && errorMessage.includes(messageJSONAtPosition)) {
                let positionWrongChar = parseInt(errorMessage.substring(errorMessage.indexOf(messageJSONAtPosition) + messageJSONAtPosition.length, errorMessage.length));
                let newContent = content.slice(0, positionWrongChar) + content.slice((positionWrongChar + 1));
                newContent = newContent.trim();
                jsonFixed = Utils.fixJsonUnexpectedTokens(newContent);
                return jsonFixed;
            }
        }
        return content;
    }

    /*****************************************************************************
    *****************************************************************************
    LOGGIN
    ****************************************************************************
    ****************************************************************************/
    static fnName(str) {
        const fnNameMatcher = /([^(]+)@|at ([^(]+) \(/;
        const regexResult = fnNameMatcher.exec(str);
        return regexResult[1] || regexResult[2];
    }

    //Utils.getVariableName({myVar});
    static getVariableName(variable) {
        //  const getName = varObj => Object.keys(varObj)[0]; var  displayName = varToString({ someVar })
        if (typeof variable !== "undefined") {
            return Object.keys(variable)[0];
        }
        return null;
    }

    /**
    calling console.log from an HTML file on electron will tell u the source file:
    [16704:0320/044947.087:INFO:CONSOLE(193)] "test" source: file:///Z:/CLOUD/electron-apps/SocialBot_2.0.0/themes/sbadmin2-easy-navigation-by-JB/index.html (193)

    if Utils is initiated in main.js and u call  Utils.getCallerFunction() from HTML file on electron, it'll cant find the source file
    but if Utils is declared like: const Utils = require('../../Utils'); in the HTML file, i can get the source file
    **/
    static getCallerFunction() {
        //console.trace(); can't be set in a variable, it output the logs automatically...
        const linesPosition = 3; //should be 2 if this code is called where you want to know the caller, but i call from another function so 3
        // if (DISPLAY_SOURCE_FILE_IN_LOGS) {
        let errorStack = (new Error()).stack;
        //  console.log(errorStack);
        let errorStackArray = errorStack.split("\n");
        let logLine;
        if (linesPosition >= errorStackArray.length) {
            logLine = errorStackArray[errorStackArray.length - 1].trim();
        } else {
            logLine = errorStackArray[linesPosition].trim();
        }
        if (DISPLAY_SOURCE_FILE_IN_LOGS || USE_FULLPATH_FOR_SOURCE_FILE_IN_LOGS) {
            let fileName = "";
            let filePath = "";
            let functionName = "";
            //=> at Configuration.loadConfiguration (Z:\CLOUD\electron-apps\SocialBot_2.0.0\Configuration.js:30:19)
            let delimiterFilePath = "(";
            if (logLine.includes("file:///")) {
                delimiterFilePath = "file:///";
            }
            if (logLine.includes(delimiterFilePath)) {
                filePath = logLine.substring(logLine.indexOf(delimiterFilePath) + delimiterFilePath.length, logLine.length - 1);
                fileName = filePath.replace(/^.*[\\\/]/, '')
                functionName = logLine.substring(0, logLine.indexOf(delimiterFilePath));
            }
            if (functionName.indexOf("at") == 0) {
                functionName = functionName.substring(3, functionName.length).trim();
            }
            // if(functionName == "callFunction" && fileName.includes("rpc-server.js")){
            //   return "console";
            // }
            if (USE_FULLPATH_FOR_SOURCE_FILE_IN_LOGS) {
                return functionName + " in " + filePath;
            } else {
                return functionName + " in " + fileName;
            }
        } else {
            return Utils.fnName(logLine);
        }

        // } else {
        //     const logLines = (new Error().stack).split('\n');
        //     const callerName = Utils.fnName(logLines[1]);
        //     if (callerName !== null) {
        //         if (callerName !== 'Function.getCallerFunction' && callerName !== 'getCallerFunction') {
        //             console.log('getCallerFunction callerName => ' + callerName);
        //         } else {
        //             const functionName = Utils.fnName(logLines[linesPosition]);
        //             console.log('getCallerFunction functionName => ' + functionName); //=> Configuration.loadConfiguration
        //         }
        //     } else {
        //         console.log(...messages);
        //     }
        // }
    }

    /*
   $(document).ready(function() {
       Utils.hideScriptFromCodeSource(document);
   });
   //Or
   document.addEventListener("DOMContentLoaded", function(event) {
 Utils.hideScriptFromCodeSource(document);
});
   */

    /*****************************************************************************
    *****************************************************************************
    SOUND
    ****************************************************************************
    ****************************************************************************/
    static async playSound(path, useSoundIfAlreadyExists = false) {
        let audio = null;
        if (useSoundIfAlreadyExists && typeof SOUNDS_TEST.path !== "undefined") {
            audio = SOUNDS_TEST.path;
            Utils.log.debug("Audio already exists, we use it again");
        }
        try {
            if (audio == null) {
                audio = new Audio(path);
                SOUNDS_TEST.path = audio;
            }
            await audio.play();
            return audio;
        } catch (error) {
            Utils.log.error("Audio not found or failed, error: " + error.toString());
            return false;
        }
    }
    /*
    https://stackoverflow.com/questions/18279141/javascript-string-encryption-and-decryption?answertab=active#tab-top
    basic encryption (unsecure) but if mix with base64 can be enough for non sensitive data
    */
}
Utils.nodeJS = {
    //electron
    dialog(titleText = "", messageText = "") {
        if (messageText == null) {
            messageText = "";
        }
        messageText = messageText.replace(/<br>/g, "\n")
        try {
            const app = require('electron').remote;
            //electronjs
            //	app.dialog.create({ title: titleText, text: messageText, buttons: [{ text: oneButtonText }] }).open();
            app.dialog.showMessageBox(null, {
                title: titleText,
                message: messageText
            });
        } catch (e) {
            //console.error("e="+e);
            //javascript
            alert(titleText + "\n" + messageText);
        }
    },
    openURL(url) {
        try {
            //electronjs, if without {} it doesn't work
            //     const{ shell }= require('electron');
            require('electron').shell.openExternal(url);
        } catch (error) {
            Utils.log.error("openURL electron failed, error: " + error.toString());
            return false;
        }
    },
    isAppPackaged() {
        try {
            const electron = require('electron');

            const app = electron.app || electron.remote.app;

            const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
            const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
            return isEnvSet ? !getFromEnv : app.isPackaged;
        } catch (err) {
            return null;
        }
    },
    removeDevToolOnElectronJSApp(mainWindow) {
        try {
            mainWindow.setMenu(null); //remove menu and dev tools
            // mainWindow.webContents.on("devtools-opened", () => {
            //     mainWindow.webContents.closeDevTools();
            // });
        } catch (error) {
            console.log("removeDevToolOnElectronJSApp error:" + error.toString());
        }
    },
    allowDevToolInProdOnElectronJSApp() {
        //add dev tool in packaged/production mode, to debug production only
        try {
            const remote = require('electron').remote; //access electron functions from renderer with remote
            remote.globalShortcut.register('CommandOrControl+Shift+K', () => {
                remote.BrowserWindow.getFocusedWindow().webContents.openDevTools()
            })
            window.addEventListener('beforeunload', () => {
                remote.globalShortcut.unregisterAll()
            })
        } catch (error) {
            console.log("allowDevToolOnElectronJSApp error:" + error.toString());
        }
    },
    /*
    if someday i need some of my code (using this Utils class) without electronjs, i just have to edit this method
    */
    getGlobalVariableNodeJS(varName) {
        const remote = require('electron').remote;
        let globalAvailable = true;
        if (typeof remote !== "undefined") {
            globalAvailable = false;
        }
        Utils.log.debug("Utils getGlobalVariable varName=" + varName + " - globalAvailable=" + globalAvailable);
        var globalVarToReturn = null;

        if (globalAvailable) {
            globalVarToReturn = global[varName];
        } else {
            globalVarToReturn = remote.getGlobal(varName);
        }
        Utils.log.debug("Utils getGlobalVariable globalVarToReturn=" + globalVarToReturn);
        return globalVarToReturn;
    },
    getPathAppRoot() {
        try {
            const electron = require('electron');
            const app = electron.app || electron.remote.app;
            return app.getAppPath();
        } catch (err) {

        }
        try {
            const path = require('path');
            return path.resolve(__dirname);
        } catch (err) {

        }
        return null;
    },
    // probleme ca prend le path de Utils.js si on donne un path relatif, donc faut faire genre:
    // Utils.requireReload(PATH_ROOT + "src/js/accounts.js");
    requireReload(modulePath) {
        delete require.cache[require.resolve(modulePath)];
        return require(modulePath);
    },

    getPathUserData() {
        try {
            const electron = require('electron');
            return (electron.app || electron.remote.app).getPath('userData');
        } catch (err) {
            alert(err.toString())
            return null;
        }
    },
    /**
    getInstanceFromRequire("Utils", "./Utils");
    getInstanceFromRequire("Database", "./Database", DATABASE_NAME);;
    **/
    getInstanceFromRequire(classOrModuleName, classOrModulePath = null, ...args) {
        if (classOrModulePath == null) {
            classOrModulePath = "./" + classOrModuleName;
        }
        let classOrModule = (() => {
            let object = null;
            const remote = require('electron').remote;
            if (typeof remote !== "undefined") {
                object = remote.getGlobal(classOrModuleName);
            } else {
                if (typeof global[classOrModuleName] !== "undefined") {
                    object = global[classOrModuleName];
                }
            }
            if (typeof object == "undefined" || object == null) {
                let requireObject = require(classOrModulePath);
              //  object = new requireObject(...args);//ES5??
                object = new requireObject(args);//TODO to try, i put this on 13/5/20 because closure compiler google
				
            }
            // Utils.log.debug("object")
            // Utils.log.debug(object)
            return object;
        })();
        // Utils.log.debug("classOrModule=" + classOrModule);
        return classOrModule;
    },
    base64Encode(string) {
        try {
            if (typeof Buffer == "function") {
                return new Buffer.from(string).toString('base64'); //nodejs
            } else {
                return btoa(string); //javascript
            }
        } catch (e) {}
        return null;
    },
    base64Decode(base64String) {
        try {
            if (typeof Buffer == "function") {
                return new Buffer.from(base64String, 'base64').toString(); //nodejs
            } else {
                return atob(base64String); //javascript
            }
        } catch (e) {}
        return null;
    }

}

Utils.chromeExtension = {
    setBadgeText(stringText) {
        chrome.browserAction.setBadgeText({
            text: stringText
        });
        /*
      chrome.browserAction.setTitle({
          title: stringUseless
      })
 */
    },

    setBadgeColor(hexStringColor) {
        chrome.browserAction.setBadgeBackgroundColor({
            color: hexStringColor
        });
    } //"#c3c3c3" gray //#32CD32 green  color: "#4589ff" blue // red light "#E67A73"
}
//Utils.log = require('electron-log');
Utils.log = {
    debug(message, ...variables) {
        if (typeof message !== "string") {
            message = "[OBJECT] " + Utils.stringify(message);
        }
        console.log("%c[DEBUG] " + Utils.log.formatMessage(message, variables) + " => " + Utils.getCallerFunction(), "color: GRAY");
    },
    info(message, ...variables) {
        if (typeof message !== "string") {
            message = "[OBJECT] " + Utils.stringify(message);
        }
        console.log("%c[INFO] " + Utils.log.formatMessage(message, variables) + " => " + Utils.getCallerFunction(), "color: GREEN");
    },
    megaDebug(message, ...variables) {
        if (typeof message !== "string") {
            message = "[OBJECT] " + Utils.stringify(message);
        }
        console.log("%c[MEGADEBUG] ============================================= ", "color: ORANGE")
        console.log("%c[MEGADEBUG] ============================================= ", "color: ORANGE")
        console.log("%c[MEGADEBUG] " + Utils.log.formatMessage(message, variables) + " => " + Utils.getCallerFunction(), "color: ORANGE")
        console.log("%c[MEGADEBUG] ============================================= ", "color: ORANGE")
        console.log("%c[MEGADEBUG] ============================================= ", "color: ORANGE")
    },
    error(message, ...variables) {
        if (typeof message !== "string") {
            message = "[OBJECT] " + Utils.stringify(message);
        }
        console.error("[/!\\ ERROR /!\\] " + Utils.log.formatMessage(message, variables) + " => " + Utils.getCallerFunction());
    },
    formatMessage(message, variables) {
        let variablesMessageFormated = "";
        for (var i = 0; i < variables.length; ++i) {
            console.log(variables[i])
            variablesMessageFormated += "var" + i + "=" + variables[i];
            if (i < variables.length - 1) {
                variablesMessageFormated += ",";
            }
        }
        if (variables.length > 0) {
            variablesMessageFormated = " (variables: " + variablesMessageFormated + ")";
        }
        return Utils.getTimestampMySQLFormat() + ": " + message + variablesMessageFormated
    }
};

/*
https://stackoverflow.com/questions/35744099/export-a-class-in-node-module-exports
*/
/************************************************************************************************
IF MODULES (NODEJS OR OTHER), NEED TO EXPORT, CHOOSE YOUR EXPORT METHOD HERE, USE ONLY 1
************************************************************************************************/
//javascript
export default Utils; //can't try catch

// module.exports = {
//     keyexportone: CanBeVarOrFunctionOrClass,
//     keyexprottwo: Utils
// }
