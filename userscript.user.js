// ==UserScript==
// @name         YouTube Hide Chat by Default
// @namespace    https://skoshy.com
// @version      0.1.0
// @description  Hides chat on YouTube live streams by default
// @author       Stefan K.
// @match        https://*.youtube.com/watch*
// @grant        none
// ==/UserScript==

const MAX_TRIES = 30;

(function() {
    'use strict';

    let tries = 0;
    let interval = setInterval(() => {
        tries++;

        const button = document.querySelector('.ytd-live-chat-frame paper-button');
        if (button && button.innerText === 'HIDE CHAT') {
            console.log('Hid chat');
            button.click();
            clearInterval(interval);
        }

        if (tries > MAX_TRIES) {
            clearInterval(interval);
        }
    }, 500);
})();
