'use strict';
//same file for twitter and instagram extension
/**
content is loaded everytime the page is loaded/refreshed
version: 2
update: 9/6/2020
**/
let deleteElementToNotOverloadTheRAM = false;
const TEST_MODE = false;
var DEBUG = false;
const LOAD_ALL_ACCOUNTS_FIRST = true;

const NUMBER_TIME_TRY_AGAIN_IF_NO_MORE_ACCOUNTS = 5;
const TIME_HOURS_SLEEP_WHEN_ACTION_BLOCKED = 4; //* 60 * 60 * 1000; //4h, time in ms
const TIME_SLEEP_WHEN_SKIP_ACCOUNT = 1000; //ms

let TITLE_PREFIX_WHEN_BOT_IS_RUNNING = "[BOT STARTED]";
let TITLE_PREFIX_WHEN_BOT_IS_SLEEPING = "[BOT SLEEPING]";
let TITLE_PREFIX_WHEN_BOT_IS_STOPPED = "[BOT STOPPED]";
let mOriginalPageTitle = null;

let mMode = "FOLLOW"; //FOLLOW UNFOLLOW SCRAPE
let mIsScripRunning = false;
let isSleeping = false;
let isSleepingScrape = false;
let mShouldLongSleep = false;
let dateStartSleep = null;

let mLoopCount = 1;

let mNumberAccountsNeeded = 0;
let mCountAccounts = {};
mCountAccounts.followed = 0;
mCountAccounts.unfollowed = 0;
mCountAccounts.scraped = 0;
mCountAccounts.checked = 0;

let mAllAccountsInfosInArray;
let allUsernamesAndInfo = {};

let mElementCurrentAccount;
let mElementCurrentButtonToRequest;
let mAccountNameCurrentFollowed = "-";
let mAccountNameCurrentUnfollowed = "-";
let mWhitelistUsernamesArray = [];

let mConfiguration = {};
var mElementsAccounts = [];
/*********************************************************************************
  ON MESSAGE RECEIVED from popup.js
*********************************************************************************/
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        let message = request.message;
        UtilsChromeExtension.logDebug("content.js onMessage message=");
        UtilsChromeExtension.logDebug(message);

        if (message == "STOP") {
            /*********************************************************************************
              STOP
            *********************************************************************************/
            stopScript(false);

        } else if (message == "START") {
            /*********************************************************************************
              START
            *********************************************************************************/
            if (mOriginalPageTitle == null) {
                mOriginalPageTitle = document.title;
            }
            startScript();
        } else if (message == "refreshForPopup") {
            /*********************************************************************************
              refreshPopup
            *********************************************************************************/
            refreshPopup();
        } else {
            /*********************************************************************************
            get configuration from message
            *********************************************************************************/
            mConfiguration = message;
        }
    }
);

/*********************************************************************************
  stop script
*********************************************************************************/
function stopScript(fromContentScript = true) {
    let wasTheBotRunning = mIsScripRunning;
    mIsScripRunning = false;
    isSleeping = false;
    isSleepingScrape = false;
    if (fromContentScript) {
        let message = {};
        message['type'] = "STOP";
        UtilsChromeExtension.sendMessageToPopup(message);
    }
    /*********************************************************************************
     check if auto stop or manual stop
    *********************************************************************************/
    if (wasTheBotRunning) {
        document.title = TITLE_PREFIX_WHEN_BOT_IS_STOPPED + " " + mOriginalPageTitle;
        if (fromContentScript) {
            UtilsChromeExtension.logInfo("Bot stopped automatically.");
        } else {
            UtilsChromeExtension.logInfo("Bot stopped by the user.");
        }
        UtilsChromeExtension.logInfo("To avoid any problem, refresh the page before clicking on START.");
    }
    refreshPopup();
}

/*********************************************************************************
start script
*********************************************************************************/
async function startScript() {
    /*********************************************************************************
    check if english language
    *********************************************************************************/
    if (SocialNetworkExtension.checkIfLanguageEnglishAndDisplayAlertIfNot() == false) {
        return;
    }
    mIsScripRunning = true;
    /*********************************************************************************
    get the elements (followers/following...)
    *********************************************************************************/
    mElementsAccounts = getAccountsOnPage(true);

    UtilsChromeExtension.logInfo("Bot started!");
    //   refreshbuttonsFollowAndFollowingAndRequested(); //3
    document.title = TITLE_PREFIX_WHEN_BOT_IS_RUNNING + " " + mOriginalPageTitle;
    if (mConfiguration['whitelistUsernames'] !== null) {
        mWhitelistUsernamesArray = mConfiguration['whitelistUsernames'].toLowerCase().split(",");
        UtilsChromeExtension.logDebug(mWhitelistUsernamesArray);
    }
    mCountAccounts.checked = 0;
    mNumberAccountsNeeded = 0;
    mCountAccounts.scraped = 0;
    let numberAccountsScrapedPreviously = 0;
    let countErrors = 0;
    let isAccountsPreloaded = false;
    /*********************************************************************************
    check MODE - preload accounts if can
    *********************************************************************************/
    if (mConfiguration['radioBoxFollow']) {
        mMode = "FOLLOW";
        mNumberAccountsNeeded = mConfiguration['inputNumberFollowUnfollowMax'];
        if (LOAD_ALL_ACCOUNTS_FIRST && SocialNetworkExtension.isPopupLikes !== true) {
            await scrollToLoadAllNeededAccounts(mNumberAccountsNeeded);
            isAccountsPreloaded = true;
        }
    } else if (mConfiguration['radioBoxUnfollow']) {
        mMode = "UNFOLLOW";
        mNumberAccountsNeeded = mConfiguration['inputNumberFollowUnfollowMax'];
        if (LOAD_ALL_ACCOUNTS_FIRST && SocialNetworkExtension.isPopupLikes !== true) {
            await scrollToLoadAllNeededAccounts(mNumberAccountsNeeded);
            isAccountsPreloaded = true;
        }
    } else if (mConfiguration['radioBoxScrape']) {
        mMode = "SCRAPE";
        mNumberAccountsNeeded = mConfiguration['inputNumberUsernamesScrapedMax'];
        isAccountsPreloaded = false; //doesn't make sense to preload them, else the sleep during scrape is useless
    }

    while (mIsScripRunning) {
        /*********************************************************************************
        check if we are blocked
        *********************************************************************************/
        if (SocialNetworkExtension.isActionBlocked()) {
            refreshPopup();
            document.title = "[BLOCKED]" + mOriginalPageTitle;
            UtilsChromeExtension.logInfo(`You have been temporary blocked by Instagram, the bot will now sleep for ${TIME_HOURS_SLEEP_WHEN_ACTION_BLOCKED} hours, then try again.`);
            await UtilsChromeExtension.sleep(TIME_HOURS_SLEEP_WHEN_ACTION_BLOCKED * 60 * 60 * 1000);
        }
        UtilsChromeExtension.logDebug("############ Loop count: " + mLoopCount++);

        switch (mMode) {
        case "FOLLOW":
            /*********************************************************************************
             FOLLOW
            *********************************************************************************/
        case "UNFOLLOW":
            /*********************************************************************************
             UNFOLLOW
            *********************************************************************************/
            /*********************************************************************************
             get 1 account
            *********************************************************************************/
            if (isAccountsPreloaded) {
                mElementCurrentAccount = mElementsAccounts[mCountAccounts.checked];
                mCountAccounts.checked++;
            } else {

            }
            if (typeof mElementCurrentAccount == "undefined" || mElementCurrentAccount == null) {
                mElementCurrentAccount.logInfo("There is no more account!");
                stopScript();
                return;
            }
            UtilsChromeExtension.scrollToView(mElementCurrentAccount);
            await UtilsChromeExtension.sleep(1000);
            let resultFollowOrUnfollow;
            let messageLog;
            if (mMode == "FOLLOW") {
                /*********************************************************************************
                 follow request
                *********************************************************************************/
                messageLog = "+1 Follow!";
                resultFollowOrUnfollow = await followAccount(mElementCurrentAccount);
            } else if (mMode == "UNFOLLOW") {
                /*********************************************************************************
                 unfollow request
                *********************************************************************************/
                messageLog = "+1 Unfollow!";
                resultFollowOrUnfollow = await unfollowAccount(mElementCurrentAccount);
            }
            isSleeping = false;
            if (resultFollowOrUnfollow == true) {
                let timeSleepForThisLoop = randomTimeBetweenFollow();
                UtilsChromeExtension.logInfo(messageLog);
                /*********************************************************************************
                 if reached limit, stop bot
                *********************************************************************************/
                if (mMode == "FOLLOW" && mConfiguration['inputNumberFollowUnfollowMax'] <= mCountAccounts.followed) {
                    stopScript();
                    return;
                } else if (mMode == "UNFOLLOW" && mConfiguration['inputNumberFollowUnfollowMax'] <= mCountAccounts.unfollowed) {
                    stopScript();
                    return;
                } else {
                    if (mShouldLongSleep) {
                        /*********************************************************************************
                        long sleep, when you reached X accounts
                        *********************************************************************************/
                        document.title = TITLE_PREFIX_WHEN_BOT_IS_SLEEPING + " " + mOriginalPageTitle;
                        // dateStartSleep = new Date().toLocaleTimeString();
                        dateStartSleep = UtilsChromeExtension.getTime();
                        isSleeping = true;
                        let minutesWord = parseInt(mConfiguration['inputNumberBreakTimeInMins']) == 1 ? "minute" : "minutes";
                        UtilsChromeExtension.logInfo("Start long sleep for " + (mConfiguration['inputNumberBreakTimeInMins']) + " " + minutesWord + ".");
                        refreshPopup();
                        await UtilsChromeExtension.sleep(mConfiguration['inputNumberBreakTimeInMins'] * 60 * 1000);
                        document.title = TITLE_PREFIX_WHEN_BOT_IS_RUNNING + " " + mOriginalPageTitle;
                    } else {
                        /*********************************************************************************
                        normal sleep between each request
                        *********************************************************************************/
                        let secondWord = parseInt((timeSleepForThisLoop / 1000)) == 1 ? "second" : "seconds";
                        UtilsChromeExtension.logInfo("The Bot will now wait " + (timeSleepForThisLoop / 1000) + " " + secondWord + ".");
                        refreshPopup();
                        await UtilsChromeExtension.sleep(timeSleepForThisLoop);
                    }
                }
            } else {
                /*********************************************************************************
                short sleep, because we skip if account already followed or unfollowed
                *********************************************************************************/
                await UtilsChromeExtension.sleep(TIME_SLEEP_WHEN_SKIP_ACCOUNT);
                if (mMode == "FOLLOW") {
                    UtilsChromeExtension.logInfo("Account already followed or in whitelist.");
                } else if (mMode == "UNFOLLOW") {
                    UtilsChromeExtension.logInfo("Account not followed or in whitelist, so the Bot do not unfollow.");
                }
            }
            break;
        case "SCRAPE":
            /*********************************************************************************
             SCRAPE
            *********************************************************************************/
            UtilsChromeExtension.logDebug("SCRAPE targetSocialNetwork=" + targetSocialNetwork);
            UtilsChromeExtension.logInfo("Loading accounts (scraping)...");
            refreshPopup();
            if (targetSocialNetwork == "instagram") {
                /*********************************************************************************
                 load account one by one - for instagram only
                *********************************************************************************/
                let scrollXAccounts = 10;
                let timeSleepPerAccount = 500;
                /*********************************************************************************
                 load comments
                *********************************************************************************/
                if (!SocialNetworkExtension.isPopupOpen()) {
                    if (SocialNetworkExtension.clickOnLoadMoreComments()) {
                        while (SocialNetworkExtension.isCommentsLoading()) {
                            UtilsChromeExtension.logInfo("Comments loading...");
                            await UtilsChromeExtension.sleep(5000);
                        }
                    } else {
                        UtilsChromeExtension.logInfo("Scrapping finished.");
                        refreshPopup();
                        stopScript();
                    }
                } else {
                    /*********************************************************************************
                    scroll down to get accounts
                    *********************************************************************************/
                    for (var i = 0; i < scrollXAccounts; i++) {
                        if (!mIsScripRunning) {
                            break;
                        }
                        await SocialNetworkExtension.scrollDownOneUsername(timeSleepPerAccount);
                    }
                }
            } else {
                /*********************************************************************************
                 load account one by one - twitter / tiktok
                *********************************************************************************/
                /*********************************************************************************
                scroll down to get accounts
                *********************************************************************************/
                let scrollXAccounts = 5;
                let timeSleepPerAccount = 100;
                //twitter
                for (var i = 0; i < scrollXAccounts; i++) {
                    if (!mIsScripRunning) {
                        break;
                    }
                    await SocialNetworkExtension.scrollDownOneUsername(timeSleepPerAccount);
                }
            }
            /*********************************************************************************
            add accounts to existing accounts list - because Likes mode on instagram delete the old one
            *********************************************************************************/
            let elements = getAccountsOnPage(false);
            if (elements) {
                mElementsAccounts = Array.from(new Set([...mElementsAccounts, ...elements]));
                let infosAccounts = extractInfosFromAccountsElements(mElementsAccounts);
                if (infosAccounts === false) {
                    UtilsChromeExtension.logInfo("Cannot get accounts infos, the Bot will try again few times then stop...");
                } else {
                    mAllAccountsInfosInArray = putAccountsInfosInArray(infosAccounts);
                    numberAccountsScrapedPreviously = mCountAccounts.scraped;
                    mCountAccounts.scraped = mAllAccountsInfosInArray.length;
                    if (mCountAccounts.scraped >= mConfiguration['inputNumberUsernamesScrapedMax']) {
                        /*********************************************************************************
                         if we reach our limit, can stop
                        *********************************************************************************/
                        mAllAccountsInfosInArray = mAllAccountsInfosInArray.slice(0, mConfiguration['inputNumberUsernamesScrapedMax']);
                        mCountAccounts.scraped = mAllAccountsInfosInArray.length;
                        refreshPopup();
                        stopScript();
                        break;
                    } else if (mCountAccounts.scraped !== 0 &&
                        mCountAccounts.scraped - numberAccountsScrapedPreviously >= mConfiguration['inputNumberSleepEveryXUsernamesScraped'] &&
                        !isSleepingScrape) {
                        /*********************************************************************************
                         if we got more accounts, sleep every X accounts scraped
                        *********************************************************************************/
                        isSleepingScrape = true;
                        UtilsChromeExtension.logInfo("The Bot will now wait " + mConfiguration['inputNumberSleepTimeScrapeSeconds'] + " seconds.");
                        refreshPopup();
                        await UtilsChromeExtension.sleep(mConfiguration['inputNumberSleepTimeScrapeSeconds'] * 1000);
                    } else {
                        /*********************************************************************************
                         if no problem, check if we loaded more accounts,
                         if not, we'll try again then STOP after x times
                        *********************************************************************************/
                        if (mCountAccounts.scraped == numberAccountsScrapedPreviously) {
                            countErrors++;
                            UtilsChromeExtension.logInfo(`Problem while scrapping, cannot load more accounts, maybe you got all the accounts?`);
                            if (checkIfTooManyErrorsAndStopScript(countErrors)) {
                                break;
                            }
                            UtilsChromeExtension.logInfo(`The Bot will try again ${NUMBER_TIME_TRY_AGAIN_IF_NO_MORE_ACCOUNTS - countErrors} time(s), then stop if cannot load more accounts.`);
                        }

                    }
                }

                isSleepingScrape = false;
                refreshPopup();
                SocialNetworkExtension.scrollToBottomOfList();
                await UtilsChromeExtension.sleep(1000);
            } else {
                countErrors++;
                if (checkIfTooManyErrorsAndStopScript(countErrors)) {
                    break;
                }
                UtilsChromeExtension.logInfo(`Cannot get accounts on the page, the Bot will try again ${NUMBER_TIME_TRY_AGAIN_IF_NO_MORE_ACCOUNTS - countErrors} times then stop...`);

            }

            break;
        default:

        }
    }
}

function checkIfTooManyErrorsAndStopScript(nbErrors) {
    if (nbErrors >= NUMBER_TIME_TRY_AGAIN_IF_NO_MORE_ACCOUNTS) {
        UtilsChromeExtension.logInfo("It seems we do not have more accounts to load.");
        UtilsChromeExtension.logInfo("If the Bot does not work properly, contact me, you can find my email in the documentation or right click on the icon's extension, then click on 'Newsletter and Contact'.");
        refreshPopup();
        stopScript();
        return true;
    } else {
        return false;
    }
}

function getAccountsOnPage(stopScriptIfFail = true) {
    let elements = SocialNetworkExtension.getElementsContainingAccountsInfo();
    if (stopScriptIfFail && elements === false) {
        UtilsChromeExtension.logInfo("The Bot cannot get the accounts, are you on the right page, is the popup open? Please read the documentation.");
        stopScript();
    } else {
        return elements;
    }
}
/*********************************************************************************
get accounts infos from all elements containing accounts
*********************************************************************************/
function extractInfosFromAccountsElements(elementsAccounts) {
    let allUsernamesAndInfo = {};
    if (elementsAccounts == null || elementsAccounts.length == 0) {
        //    result.status = "FAIL";
        return false;
    }
    /*********************************************************************************
     for each element, we try to get username, profile pic, etc...
    *********************************************************************************/
    for (let i = 0; i < elementsAccounts.length; i++) {
        let elementCurrentInThisLoop = elementsAccounts[i];

        if (typeof elementCurrentInThisLoop !== 'undefined' || elementCurrentInThisLoop !== null) {
            let infoCurrentUser = SocialNetworkExtension.getUsernameAndImgSrcAndIfFollowed(elementCurrentInThisLoop);
            let usernameCurrent = infoCurrentUser['username'];
            if (usernameCurrent != null && usernameCurrent.length !== 0) {
                allUsernamesAndInfo[usernameCurrent] = infoCurrentUser;
            }
        }
    }
    return allUsernamesAndInfo;
}

/*********************************************************************************
 scroll down to load X accounts
 this doesn't work for the Likes popup because IG deleted the previous accounts loaded, not more than 17 accounts at a time...
*********************************************************************************/
async function scrollToLoadAllNeededAccounts(nbAccountsNeeded) {
    let loopExitCannotLoadAccounts = 0;
    let loopExitCannotLoadMoreAccount = 0;
    let previousNumberOfAccountsLoaded = 0;
    while (mIsScripRunning && (typeof mElementsAccounts == "undefined" || mElementsAccounts == null || mElementsAccounts.length < nbAccountsNeeded)) {
        UtilsChromeExtension.logInfo("Loading accounts (scrolling)...");
        refreshPopup();
        for (var i = 0; i < 4; i++) {
            await SocialNetworkExtension.scrollDownXUsernames(UtilsChromeExtension.getRandom(4, 6), 1500);
            if (!mIsScripRunning) {
                break;
            }
        }
        let elements = getAccountsOnPage(false);
        if (elements === false) {
            loopExitCannotLoadAccounts++;
            await UtilsChromeExtension.sleep(2000);
        } else {
            if (previousNumberOfAccountsLoaded == mElementsAccounts.length) {
                loopExitCannotLoadMoreAccount++;
                //await UtilsChromeExtension.sleep(2000);
            } else {
                UtilsChromeExtension.logInfo(mElementsAccounts.length + " accounts loaded.");
                previousNumberOfAccountsLoaded = mElementsAccounts.length;
                mElementsAccounts = elements;
            }
        }
        refreshPopup();
        if (mElementsAccounts.length >= nbAccountsNeeded) {
            return true;
        } else if (loopExitCannotLoadAccounts == 10) {
            UtilsChromeExtension.logInfo("Or there is a problem on the page, close the tab, refresh the extension and try again.");
            stopScript();
            return false;
        } else if (loopExitCannotLoadMoreAccount == 10) {
            UtilsChromeExtension.logInfo("It seems we do not have more accounts to load.");
            return true;
        }
    }
    return true;
}

/*********************************************************************************
 for each element, we try to get username and check if already followed or not
*********************************************************************************/
async function followAccount(elementAccount) {
    let isFollowSuccess = false;
    let elementCurrentButtonToRequest = SocialNetworkExtension.getCurrentButtonToRequest(elementAccount);
    let currentUsername = getUsername(elementAccount);
    if (currentUsername == null) {
        UtilsChromeExtension.logInfo("The Bot cannot get username, is the popup open?");
        stopScript();
        return;
    }
    mAccountNameCurrentFollowed = currentUsername;
    if (isUsernameInWhitelist(currentUsername)) {
        UtilsChromeExtension.logInfo(currentUsername + " is in the whitelist.");
    } else {
        /*********************************************************************************
         FOLLOW
        *********************************************************************************/
        if (SocialNetworkExtension.canClickOnFollow(elementCurrentButtonToRequest)) {
            if (TEST_MODE) {
                isFollowSuccess = true;
                UtilsChromeExtension.logInfo("[TEST MODE] fake click follow");
            } else {
                isFollowSuccess = await SocialNetworkExtension.follow(elementCurrentButtonToRequest);
            }
            //TODO if not followed?
            if (isFollowSuccess) {
                addUsernameInWhitelist(currentUsername);
                mCountAccounts.followed++;
                UtilsChromeExtension.logInfo("Follow: " + mAccountNameCurrentFollowed + " - " + mCountAccounts.followed + "/" + mConfiguration['inputNumberFollowUnfollowMax']);
            }
        } else {
            UtilsChromeExtension.logInfo("Cannot click on the button for account: " + mAccountNameCurrentFollowed);
        }
    }
    if (isFollowSuccess) {
        if (mCountAccounts.followed !== 0 && mCountAccounts.followed % mConfiguration['inputNumberBreakEveryXFollowsOrUnfollows'] == 0) {
            mShouldLongSleep = true;
        }
    }
    if (deleteElementToNotOverloadTheRAM) {
        deleteElement(mElementCurrentAccount);
    }
    refreshPopup();
    return isFollowSuccess;
}

async function unfollowAccount(elementAccount) {
    let isUnfollowSuccess = false;
    let elementCurrentButtonToRequest = SocialNetworkExtension.getCurrentButtonToRequest(elementAccount);
    let currentUsername = getUsername(elementAccount);
    if (currentUsername == null) {
        UtilsChromeExtension.logInfo("The Bot cannot get username, is the popup open?");
        stopScript();
        return;
    }
    mAccountNameCurrentUnfollowed = currentUsername;
    if (isUsernameInWhitelist(currentUsername)) {
        UtilsChromeExtension.logInfo(currentUsername + " is in the whitelist.");
    } else {
        /*********************************************************************************
         UNFOLLOW
        *********************************************************************************/
        if (SocialNetworkExtension.canClickOnUnfollow(elementCurrentButtonToRequest)) {
            if (TEST_MODE) {
                isUnfollowSuccess = true;
                UtilsChromeExtension.logInfo("[TEST MODE] fake click unfollow");
            } else {
                isUnfollowSuccess = await SocialNetworkExtension.unfollow(elementCurrentButtonToRequest);
            }
            if (isUnfollowSuccess) {
                mCountAccounts.unfollowed++;
                UtilsChromeExtension.logInfo("Unfollow: " + mAccountNameCurrentUnfollowed + " - " + mCountAccounts.unfollowed + "/" + mConfiguration['inputNumberFollowUnfollowMax']);
            }
        } else {
            UtilsChromeExtension.logInfo("Cannot click on the button for account: " + mAccountNameCurrentUnfollowed);
        }
    }
    return isUnfollowSuccess;
}

function isUsernameInWhitelist(username) {
    if (mWhitelistUsernamesArray == null || mWhitelistUsernamesArray.length < 1) {
        return false;
    } else {
        if (username == null) {
            return false;
        }
        return mWhitelistUsernamesArray.includes(username.toLowerCase()) ||
            mWhitelistUsernamesArray.includes("@" + username.toLowerCase()) ||
            mWhitelistUsernamesArray.includes(username.toLowerCase().replace("@", ""));
    }
}

function getUsername(liElement) {
    let infos = SocialNetworkExtension.getUsernameAndImgSrcAndIfFollowed(liElement);
    UtilsChromeExtension.logDebug("getUsername()");
    UtilsChromeExtension.logDebug(infos);
    return infos['username'];
}

function getUserImgSrc(liElement) {
    let infos = SocialNetworkExtension.getUsernameAndImgSrcAndIfFollowed(liElement);
    UtilsChromeExtension.logDebug("getUsername()");
    UtilsChromeExtension.logDebug(infos);
    return infos['imgSrc'];
}

function randomTimeBetweenFollow() {
    UtilsChromeExtension.logDebug("randomTimeBetweenFollow");
    UtilsChromeExtension.logDebug(mConfiguration);
    return Math.floor((Math.random() * (parseInt(mConfiguration['inputNumberDelaySecMax']) - parseInt(mConfiguration['inputNumberDelaySecMin'])))) * 1000 + parseInt(mConfiguration['inputNumberDelaySecMin']) * 1000;
}

function refreshPopup() {
    UtilsChromeExtension.logDebug("refreshPopup");
    let message = {};
    message['type'] = "refresh";
    message['follows'] = mCountAccounts.followed;
    message['unfollows'] = mCountAccounts.unfollowed;
    message['lastFollowedUsername'] = mAccountNameCurrentFollowed;
    message['lastUnFollowedUsername'] = mAccountNameCurrentUnfollowed;
    message['allUsernamesAndInfoInArray'] = mAllAccountsInfosInArray;
    message['nbUsernamesInfoScraped'] = mCountAccounts.scraped;
    message['logs'] = UtilsChromeExtension.getAllLogsInfo();
    if (isSleeping) {
        message['status'] = "SLEEPING";
        message['dateStartSleep'] = dateStartSleep;
    } else if (mIsScripRunning) {
        message['status'] = "STARTED";
    } else {
        message['status'] = "STOPPED";
    }
    UtilsChromeExtension.sendMessageToPopup(message);
}

function putAccountsInfosInArray(usernamesAndInfosArray) {
    let usernamesAndInfos = [];
    let count = 1;
    for (let key in usernamesAndInfosArray) {
        usernamesAndInfos.push(usernamesAndInfosArray[key]);
    }
    return usernamesAndInfos;
}

/*********************************************************************************
 ADD THE USERNAME ONLY IF AUTO WHITELIST IS CHECKED
*********************************************************************************/
function addUsernameInWhitelist(username) {
    let message = {};
    message['type'] = "whitelist";
    message['username'] = username;
    UtilsChromeExtension.sendMessageToPopup(message);
}

function getLastUsernameOfAccounts() {
    // let lastUsername = null;
    // try {
    //     lastUsername = getUsername(mElementsAccounts[mElementsAccounts.length - 1]);
    //     UtilsChromeExtension.logDebug("Last username of list:" + lastUsername);
    // } catch (error) {
    //     UtilsChromeExtension.logDebug("followOrUnfollowNextAccount getUsername error:" + error);
    // }
}
