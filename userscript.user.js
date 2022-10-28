// ==UserScript==
// @name         YouTube Hide Chat by Default
// @namespace    https://skoshy.com
// @version      0.6.0
// @description  Hides chat on YouTube live streams by default
// @author       Stefan K.
// @match        https://*.youtube.com/*
// @updateURL    https://github.com/skoshy/YouTubeHideChatByDefaultUserscript/raw/master/userscript.user.js
// @grant        none
// @icon         https://youtube.com/favicon.ico
// ==/UserScript==

(function() {
  "use strict";
  const scriptId = "youtube-hide-chat-by-default";

  // configurable vars
  // - if youtube decides to use a new button type, add it here
  const buttonSelectors = ["paper-button", "ytd-toggle-button-renderer", "button"];
  // - for different languages for the HIDE CHAT text, add them here
  const hideChatTexts = [
    'HIDE CHAT', // english
    'HIDE CHAT REPLAY', // english, chat replay
    'OCULTAR CHAT', // spanish
    'MASQUER LA CONVERSATION PAR CHAT', // french
    'MASQUER LE CLAVARDAGE', // french canada
    'NASCONDI CHAT', // italian
    'OCULTAR CONVERSA', // portuguese
    'চ্চাট লুকুৱাওক', // bengali
    'च्याट लुकाउनुहोस्', // nepali
    'चैट छिपाएं', // hindi
    'チャットを非表示', // japanese
    '隐藏聊天记录', // zh-Hans-CN
    '隱藏即時通訊', // zh-Hant-TW and zh-Hant-HK
  ];

  const nodeIdString = `${scriptId}-id`;

  function log(...toLog) {
    console.log(`[${scriptId}]:`, ...toLog);
  }

  function getUrlSearchParams() {
    return new URLSearchParams(document.location.search.substring(1));
  }

  function isHideChatButton(node) {
    return hideChatTexts.includes(node.innerText.toUpperCase().trim());
  }

  function getNodeId(node) {
    let nodeId = node.getAttribute(nodeIdString);

    return nodeId;
  }

  function setAndGetNodeId(node, setIdTo) {
    const originalNodeId = getNodeId(node);

    const nodeId = setIdTo ? setIdTo : Math.random().toString();
    node.setAttribute(nodeIdString, nodeId);

    return { originalNodeId, nodeId };
  }

  function addedNodeHandler(node) {
    if (
      !node.matches ||
      !buttonSelectors.some(b => node.matches(b))
    ) {
      return;
    }

    if (isHideChatButton(node)) {
      const { nodeId, originalNodeId } = setAndGetNodeId(node, getUrlSearchParams().get('v'));

      if (originalNodeId === nodeId) return; // we've already automatically triggered hide chat

      log(`Hid the chat by default`, document.querySelector('yt-live-chat-message-input-renderer'));

      const tryToHideChatDetails = {
        interval: null,
        triedAttempts: 0,
      };

      tryToHideChatDetails.interval = setInterval(() => {
        tryToHideChatDetails.triedAttempts++;

        if (document.querySelector('ytd-live-chat-frame iframe')?.offsetHeight ?? 0 > 0) {
          log('Clicking again because live chat still there');
          node.click();
          tryToHideChatDetails.triedAttempts = 0;
        }

        if (tryToHideChatDetails.triedAttempts > 6) {
          clearInterval(tryToHideChatDetails.interval);
        }
      }, 250);

      return;
    }
  }

  const bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      const newNodes = [];

      mutation.addedNodes.forEach(addedNode => {
        newNodes.push(addedNode);

        // it might be text node or comment node which don't have querySelectorAll
        if (addedNode.querySelectorAll) {
          buttonSelectors.forEach(bs => {
            addedNode.querySelectorAll(bs).forEach((n) => {
              newNodes.push(n);
            });
          });
        }
      });

      newNodes.forEach(n => addedNodeHandler(n));
    });
  });

  setInterval(() =>
    Array.from(
      document.querySelectorAll(buttonSelectors.join(', '))
    ).forEach(n => addedNodeHandler(n))
  , 3000);

  bodyObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  });
})();
