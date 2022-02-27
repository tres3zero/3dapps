'use strict';
//same file for twitter and instagram extension
//can't load fiels from local file (ex C://file), it works only for http / https so u need a web server
/**
version: 1
update: 6/6/2020
**/
import Translation from '/src/js/class/Translation.js';
const PATH_TRANSLATIONS = '/src/assets/localisation';
const AVAILABLE_LANGUAGES = ["en"];
let language = window.navigator.userLanguage || window.navigator.language; //can be "en" or "en-US"
language = (language != null) ? language.substring(0, 2) : "en";
let dictionnariesPath = [];
var mTranslation = new Translation(document);
if (typeof window !== "undefined") {
    window.mTranslation = mTranslation; //make it global, else we can't access variable declared here because it's a module
}
dictionnariesPath.push(PATH_TRANSLATIONS + '/translations-licensing.json');
dictionnariesPath.push(PATH_TRANSLATIONS + '/translations.json');
dictionnariesPath.push(PATH_TRANSLATIONS + '/translations-instagram.json');
dictionnariesPath.push(PATH_TRANSLATIONS + '/translations-instagram-twitter-extension.json');

loadFilesAndTranslate(AVAILABLE_LANGUAGES.includes(language) ? language : AVAILABLE_LANGUAGES[0]);

async function loadFilesAndTranslate(language = "en") {
    for (const translationPath of dictionnariesPath) {
        try {
            let response = await fetch(translationPath);
            // if (response.ok) {
            let dictionnary = await response.json();
            mTranslation.addDictionnary(dictionnary);
        } catch (error) {
            console.log("Cannot add dictionnary, error: " + error);
        }
    }
    mTranslation.translateAll(language);
}
/*
fetch('./assets/localisation/translations.json')
    .then(response => response.json())
    .then(obj => {
        mTranslation.addDictionnary(obj);
        mTranslation.translateAll();
    })
*/
