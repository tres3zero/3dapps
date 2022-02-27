'use strict';
//same for twitter and instagram extension
/**
background is launched once when the extension is installed / reloaded and keep running all the time
version: 1
update: 6/6/2020
**/

var isResellingVersion = false;

var URL_AUTOMATIZE_CODECANYON_PORTFOLIO = 'https://codecanyon.net/user/automatize/portfolio';
var URL_INSTAGRAM_EXTENSION_CODECANYON = "https://codecanyon.net/item/instagram-auto-followunfollowscraper/reviews/23030326";
var URL_TWITTER_EXTENSION_CODECANYON = "https://codecanyon.net/item/twitter-auto-followunfollowscraper-chrome-extension/23586640";
var URL_INSTAGRAM_AUTOMATIZE = "https://instagram.com/automatize_/";
var URL_SOCIALBOT_CODECANYON = "https://codecanyon.net/item/socialbot-instagram-and-twitter-bot/22972206";
var URL_MAILTO_AUTOMATIZE = "mailto:automatize.softwares@gmail.com";
var URL_NEWSLETTER_AUTOMATIZE = "https://automatize.nintenda.fr/routing.php?route=newsletter:automatize";
var URL_REVIEW_EXTENSION = URL_AUTOMATIZE_CODECANYON_PORTFOLIO; //will be changed later
/**
communicate background <-> popup
chrome.extension.onConnect.addListener(function(port) {
      console.log("Connected .....");
      port.onMessage.addListener(function(msg) {
           console.log("message recieved" + msg);
           port.postMessage("Hi Popup.js");
      });
 });
 */
var manifest = chrome.runtime.getManifest();
switch (manifest.author.itemID) {
case "23030326": //instagram extension
    URL_REVIEW_EXTENSION = "https://codecanyon.net/item/instagram-auto-followunfollowscraper/reviews/23030326";
    break;
case "23586640": //twitter extension
    URL_REVIEW_EXTENSION = "https://codecanyon.net/item/twitter-auto-followunfollowscraper-chrome-extension/reviews/23586640";
    break;
case "xxxxxx": //tiktok extension
    //  URL_REVIEW_EXTENSION =
    break;
default:

}
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {

    } else if (details.reason == "update") {
        //call a function to handle an update
    }
});
if (isResellingVersion) {

} else {
    chrome.contextMenus.create({
        title: "Newsletter and Contact",
        contexts: ["browser_action"],
        onclick: function () {
            window.open(URL_NEWSLETTER_AUTOMATIZE);
        }
    });
    // chrome.contextMenus.create({
    //     title: "Contact the developer",
    //     contexts: ["browser_action"],
    //     onclick: function () {
    //         window.open(URL_MAILTO_AUTOMATIZE);
    //     }
    // });
    chrome.contextMenus.create({
        title: "Instagram extension",
        contexts: ["browser_action"],
        onclick: function () {
            window.open(URL_INSTAGRAM_EXTENSION_CODECANYON);
        }
    });
    chrome.contextMenus.create({
        title: "Twitter extension",
        contexts: ["browser_action"],
        onclick: function () {
            window.open(URL_TWITTER_EXTENSION_CODECANYON);
        }
    });
    chrome.contextMenus.create({
        title: "Social Bot (Instagram and Twitter)",
        contexts: ["browser_action"],
        onclick: function () {
            window.open(URL_SOCIALBOT_CODECANYON);
        }
    });

    chrome.contextMenus.create({
        title: "More softwares...",
        contexts: ["browser_action"],
        onclick: function () {
            window.open(URL_AUTOMATIZE_CODECANYON_PORTFOLIO);
        }
    });
    chrome.contextMenus.create({
        title: "Rate this extension",
        contexts: ["browser_action"],
        onclick: function () {
            window.open(URL_REVIEW_EXTENSION);
        }
    });
}
/*
chrome.tabs.onActivated.addListener(function(activeInfo) {
    // how to fetch tab url using activeInfo.tabid
    chrome.tabs.get(activeInfo.tabId, function(tab) {

    });
});
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) { // onUpdated should fire when the selected tab is changed or a link is clicked
    chrome.tabs.getSelected(null, function(tab) {

    });
});

chrome.browserAction.onClicked.addListener(function (tab) {
	// for the current tab, inject the "inject.js" file & execute it
	/*chrome.tabs.executeScript(tab.ib, {
		file: 'inject.js'
	});

});
*/
