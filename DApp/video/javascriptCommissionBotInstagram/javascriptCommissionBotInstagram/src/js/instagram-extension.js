'use strict';
/*
update 9/9/20:
- instagram has a problem, it load all the followers/following when u open the list on desktop interface and mobile interfaxce
fix? attendre que IG fix ça, en attendant j'ai pas besoin de scroller pr load les comptes

- maybe faire un mode avec mobile display (insepect element and toggle mobile, iphone X)

*/
var targetSocialNetwork = "instagram";
var baseSocialNetworkURL = "https://" + targetSocialNetwork + ".com/";
var baseSocialNetworkUsernameURL = "https://" + targetSocialNetwork + ".com/";

var mElementToScroll = null;
var heightDivOfOneFollowInTheFollowerList = 46; //px can change 46 then 54 when the list is refreshed (when u reach the bottom)

/*********************************************************************************
STRINGS TO ANALYSE ON THE PAGE
*********************************************************************************/
var languageVersion = "english";

let stringFollowing = "following";
let stringFollowers = "followers";
let stringSuggested = "Suggested";
let stringFollow = "Follow";
let stringUnfollow = "Unfollow";
let stringLikes = "Likes";
let stringClose = "Close";
let stringRequested = "Requested";
let stringPending = "Pending";
let stringTitlePopupWhenBanned = "Action Blocked";

switch (languageVersion) {
case "german":
    stringFollow = "Folgen";
    stringFollowing = "Abonniert";
    stringFollowers = "Abonnenten";
    stringUnfollow = "???";
    stringSuggested = "Vorschläge";
    stringPending = "???";
    stringRequested = "Anfrage gesendet";
    stringLikes = "Gefällt mir";
    stringClose = "Schließen";
    break;
case "french":
    stringFollow = "S’abonner";
    stringFollowing = "Abonné(e)";
    stringFollowers = "Abonnés";
    stringUnfollow = "Se désabonner";
    stringSuggested = "Suggestion";
    stringPending = "Demandé";
    stringRequested = "Demandé";
    stringLikes = "Mentions J’aime";
    stringClose = "Fermer";
    break;
}
class SocialNetworkExtension {

    //check if IG is in english
    static checkIfLanguageEnglishAndDisplayAlertIfNot() {
        var querySel = 'a[href*="/about-us"]';
        var wordInEnglishToCheck = "About";
        if (document.querySelector(querySel) !== null && typeof document.querySelector(querySel).textContent !== "undefined") {
            if (document.querySelector(querySel).textContent.includes(wordInEnglishToCheck)) {
                return true;
            } else {
                alert("Please set your Instagram in english (read documentation or add ?hl=en at the end of the URL)");
                return false;
            }
        }
    }

    static getElementsContainingAccountsInfo() {
        UtilsChromeExtension.logDebug("getElementsContainingAccountsInfo()");
        /**
        if Suggested, it's not "li" elements but only div with button
        https://www.instagram.com/explore/people/suggested/
        see:
        document.querySelectorAll('[role="button"]') to get the div with image and username
        and document.querySelectorAll('button') to get the button "follow"
        **/

        mElementToScroll = null;
        SocialNetworkExtension.isPopupLikes = false;
        let divAccounts;
        let liAccounts;
        let divsPopup = document.querySelectorAll('div[role="dialog"] > div');
        for (var i = 0, l = divsPopup.length; i < l; i++) {
            let divPopup = divsPopup[i];
            let divTitle = divPopup.querySelector("h1");
            let titlePopup = divTitle.innerText;
            // console.log("title:" + titlePopup);
            if (titlePopup == stringFollowers) {
                /*********************************************************************************
                FOLLOWERS (ul elements)
                *********************************************************************************/
                divAccounts = divPopup.querySelector("ul");
                liAccounts = divAccounts.querySelectorAll("li");
                mElementToScroll = divAccounts.parentElement;
            } else if (titlePopup == stringLikes) {
                /*********************************************************************************
                LIKES (div elements "<div aria-labelledby=")
                update 10june2020
                when you scroll down, it unload the previous and load new one, so there is only ~17 max elements at a time
                so i should scroll 1 user, do action, scroll 1 user, do action...
                *********************************************************************************/
                SocialNetworkExtension.isPopupLikes = true;
                divAccounts = divPopup.querySelector("div[style*='flex-direction']");
                liAccounts = divAccounts.querySelectorAll("div[aria-labelledby]");
                // divAccounts = Array.prototype.slice.call(divAccounts);
                // var test = Array.prototype.slice.call(tempDiv.querySelectorAll("div[aria-labelledby]"));
                // divAccounts = new Set([...divAccounts, ...test]);
                // divAccounts = Array.from(divAccounts);
                mElementToScroll = divAccounts.parentElement;
            } else if (titlePopup == stringFollowing) {
                /*********************************************************************************
                FOLLOWING (ul elements)
                *********************************************************************************/
                divAccounts = divPopup.querySelector("ul");
                liAccounts = divAccounts.querySelectorAll("li");
                mElementToScroll = divAccounts.parentElement;
            } else if (titlePopup == stringSuggested) {
                /*********************************************************************************
                SUGGESTION i don't know if it works lol
                *********************************************************************************/
                divAccounts = divPopup.querySelector("ul");
                liAccounts = divAccounts.querySelectorAll("li");
                mElementToScroll = divAccounts.parentElement;
            }
        }
        if (liAccounts == null || liAccounts.length == 0) {
            return false;
        } else {
            return liAccounts;
        }
    }

    static getUsernameAndImgSrcAndIfFollowed(liElement) {
        var result = {
            "username": null,
            "isFollowAlreadyAsked": null,
            "imgSrc": null
        };
        var img = null;
        var imgSrc = null;
        var buttonFollowUnfollowRequested = null;
        var isFollowAlreadyAsked = null;
        var aElements = null;
        var username = null;
        if (typeof liElement !== 'undefined' && liElement !== null) {
            /**
		usually there are 2 balises "a"(one with image, one with username) but sometimes when someone has a public story
		there is only 1 "a" but still the balise "img" but in a "span"
		**/
            img = liElement.querySelector('img');
            if (typeof img !== 'undefined' && img !== null) {
                if (img.hasAttribute('src')) {
                    imgSrc = img.src;
                }
            }

            var aElements = liElement.querySelectorAll('a');

            if (typeof aElements !== 'undefined' && aElements !== null) {
                if (aElements.length > 1) {
                    if (typeof aElements[1] !== "undefined" && aElements[1] !== null) {
                        if (aElements[1].hasAttribute('title')) {
                            username = aElements[1].title;
                        }
                    }
                } else {
                    if (typeof aElements[0] !== "undefined" && aElements[0] !== null) {
                        if (aElements[0].hasAttribute('title')) {
                            username = aElements[0].title;
                        }
                    }
                }
            }
            buttonFollowUnfollowRequested = liElement.querySelector('button');
            if (typeof buttonFollowUnfollowRequested !== 'undefined' && buttonFollowUnfollowRequested !== null) {
                if (buttonFollowUnfollowRequested.innerHTML == stringFollow) {
                    isFollowAlreadyAsked = false;
                } else if (buttonFollowUnfollowRequested.innerHTML == stringRequested || buttonFollowUnfollowRequested.innerHTML == stringFollowing) {
                    isFollowAlreadyAsked = true;
                } else {
                    //probably because in scrape comments mode
                    isFollowAlreadyAsked = "unknown";
                }
                //isFollowAlreadyAsked = (buttonFollowUnfollowRequested.innerHTML == stringFollow) ? false : true;
            }
        }
        result['imgSrc'] = imgSrc;
        result['username'] = username;
        result['isFollowAlreadyAsked'] = isFollowAlreadyAsked;
        /*if(typeof liElement !== 'undefined' && liElement.innerText.indexOf("\n") > 0){
		accountNameCurrentFollowed = liElement.innerText.substring(0, liElement.innerText.indexOf("\n"));
	}
	*/
        // UtilsChromeExtension.logDebug("Current Account name: " + username);
        return result;
    }

    static getCurrentButtonToRequest(elementAccount) {
        /*
	- for mobile web version, when already followed:
	document.querySelector("span[aria-label='Following']").click();
	- if just requested:
	Array.from(document.querySelectorAll('button'))
  .find(el => el.textContent === 'Requested')
*/
        return elementAccount.querySelector('button');
    }

    static canClickOnFollow(elementButton) {
        return (typeof elementButton !== 'undefined' &&
            elementButton !== null &&
            elementButton.innerText == stringFollow);
    }

    static canClickOnUnfollow(elementButton) {
        return (typeof elementButton !== 'undefined' &&
            elementButton !== null &&
            (elementButton.innerText == stringFollowing || elementButton.innerText == stringRequested));
    }

    static async scrollDownXUsernames(nbUsers, timeMS = 1) {
        UtilsChromeExtension.logDebug("scrollDownXUsernames(nbUsers=" + nbUsers + ", timeMS=" + timeMS + ")");
        setTimeout(function () {
            let pixelsDown = (heightDivOfOneFollowInTheFollowerList * nbUsers);
            if (mElementToScroll != null) {
                mElementToScroll.scrollTop += pixelsDown;
                UtilsChromeExtension.logDebug("scrolled down " + pixelsDown + "px");
            } else {
                UtilsChromeExtension.logDebug("cannot scroll, mElementToScroll is null");
            }
        }, timeMS);
        await UtilsChromeExtension.sleep(timeMS);
    }

    static async scrollDownOneUsername(timeMS = 1) {
        return await SocialNetworkExtension.scrollDownXUsernames(1, timeMS);
    }
    //it seems it increases the users list of 12 everytime i scroll down, i guess it's fixed or depends of ur window size
    static scrollToBottomOfList() {
        if (mElementToScroll != null) {
            mElementToScroll.scrollTo(0, mElementToScroll.scrollHeight);
            UtilsChromeExtension.logDebug("scrollToBottomOfList() OK");
        } else {
            UtilsChromeExtension.logDebug("scrollToBottomOfList() ERROR, mElementToScroll is null");
        }
    }

    //only for IG
    static findUnfollowButton() {
        var elements = document.querySelectorAll('button');
        for (var i = 0, l = elements.length; i < l; i++) {
            if (elements[i].firstChild !== null && elements[i].firstChild.nodeValue == stringUnfollow) {
                return elements[i];
            }
        }
    }

    //TODO
    //only for IG
    static isPopupOpen(textTitlePopupToCheck) {
        var popupOpenFollowersLikesOrFollowings = document.querySelector('[role="dialog"]');
        UtilsChromeExtension.logDebug("=== isPopupOpen(textTitlePopupToCheck=" + textTitlePopupToCheck + ") popupOpenFollowersLikesOrFollowings=");
        UtilsChromeExtension.logDebug(popupOpenFollowersLikesOrFollowings);
        if (popupOpenFollowersLikesOrFollowings !== null && typeof popupOpenFollowersLikesOrFollowings !== 'undefined' && popupOpenFollowersLikesOrFollowings.childElementCount > 0) {
            var titlePopup = popupOpenFollowersLikesOrFollowings.children[0].innerText;
            if (textTitlePopupToCheck == null) {
                UtilsChromeExtension.logDebug("any popup open (because you didn't give the argument textTitlePopupToCheck)");
                return true;
            }
        } else {
            UtilsChromeExtension.logDebug("popupOpenFollowersLikesOrFollowings == null or undefined or no child");
            return false;
        }
        if (titlePopup == textTitlePopupToCheck) {
            UtilsChromeExtension.logDebug("titlePopup == textTitlePopupToCheck");
            return true;
        } else {
            UtilsChromeExtension.logDebug("titlePopup != textTitlePopupToCheck");
            return false;
        }
    }
    //only for IG
    static isAddCommentAvailable() {
        if (document.querySelector('[aria-label="Add a comment…"]') !== null) {
            return true;
        }
        return false;
    }
    //only for IG
    static isCommentsLoading() {
        if (document.querySelector("svg[aria-label='Loading...']") !== null) {
            return true;
        }
        return false;
    }
    //TODO
    /*
    CHECK IF THIS BUG IS STILL HERE:
    bug on IG, even if comments are finished
    still can click on load more comments and it just load again the 2 last comments (duplicate), infinite
    */
    //only for IG
    static clickOnLoadMoreComments() {
        UtilsChromeExtension.logDebug("--- clickOnLoadMoreComments()");
        try {
            //TODO LOAD COMMENTS
            document.querySelector('[aria-label="Load more comments"]').click();
            UtilsChromeExtension.logDebug("=== clickOnLoadMoreComments() true");
            return true;
        } catch (err) {
            UtilsChromeExtension.logDebug("ERR clickOnLoadMoreComments() " + err);
            UtilsChromeExtension.logDebug("=== clickOnLoadMoreComments() false");
            return false;
        }
    }

    static async unfollow(elementButton) {
        try {
            elementButton.click(); //on IG, open a small popup then we can unfollow but on twitter it just unfollow
        } catch (error) {
            console.log("unfollow() error: " + error);
            return false;
        }
        //for (var s = 0; s < 1000; s++) { }
        await UtilsChromeExtension.sleep(2000);
        let buttonUnfollow = SocialNetworkExtension.findUnfollowButton();
        if (typeof buttonUnfollow !== 'undefined') {
            buttonUnfollow.click();
            return true;
        } else {
            console.log("unfollow() cannot find Unfollow button");
            return false;
        }
    }
    static async follow(elementButton) {
        try {
            elementButton.click();
            return true;
        } catch (error) {
            console.log("follow() error: " + error);
            return false;
        }
    }
    //only for IG
    /*let messagePopupWhenBanned = "This action was blocked. Please try again later. We restrict certain content and actions to protect our community. Tell us if you think we made a mistake.";
    let messageButton1WhenBanned = "Report a Problem";
    let messageButton2WhenBanned = "OK";
    */
    static isActionBlocked() {
        let popups = document.querySelectorAll("[role='presentation'][role='dialog']");
        for (let i = 0; i < popups.length; i++) {
            let text = popups[i].innerText;
            //var banned = false;
            if (text !== null && typeof text !== "undefined") {
                if (text.includes(stringTitlePopupWhenBanned)) {
                    //banned = true;
                    return true;
                }
            }
            //usually it's the 0, but if a popup is already opened (by example the popup Followers), it'll be 1
            //document.querySelectorAll("[role='presentation']")[0].querySelector("h3"); = <h3 class="_7UhW9     LjQVu     qyrsm KV-D4        uL8Hv         ">Action Blocked</h3>
            /*var h3ActionBlocked = popups[i].querySelector("h3");
            if(h3ActionBlocked !== null){
            	if(h3ActionBlocked.textContent == "Action Blocked"){
            		alert("you're banned");
            	}
            }
            */
        }
        return false;
    }
}
