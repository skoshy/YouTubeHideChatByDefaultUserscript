// ==UserScript==
// @name         YouTube Hide Chat by Default
// @namespace    https://skoshy.com
// @version      0.4.0
// @description  Hides chat on YouTube live streams by default
// @author       Stefan K.
// @match        https://*.youtube.com/*
// @updateURL    https://github.com/skoshy/YouTubeHideChatByDefaultUserscript/raw/master/userscript.user.js
// @grant        none
// @icon         https://youtube.com/favicon.ico
// ==/UserScript==

window.mut = [];

(function() {
  "use strict";
  const scriptId = "youtube-hide-chat-by-default";

  // configurable vars
  // - if youtube decides to use a new button type, add it here
  const buttonSelectors = ["paper-button", "ytd-toggle-button-renderer"];
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

  function log(...toLog) {
    console.log(`[${scriptId}]:`, ...toLog);
  }

  function getUrlSearchParams() {
    return new URLSearchParams(document.location.search.substring(1));
  }

  function isHideChatButton(node) {
    return hideChatTexts.includes(node.innerText.toUpperCase().trim());
  }

  function setAndGetNodeId(node, setIdTo) {
    const nodeIdString = `${scriptId}-id`;

    let originalNodeId = node.getAttribute(nodeIdString);

    const nodeId = setIdTo ? setIdTo : Math.random().toString();
    node.setAttribute(nodeIdString, nodeId);

    return { originalNodeId, nodeId };
  }


  let buttonObserver = {
      observer: null,
      node: null,
      debouncedTimeout: null,
  };

  function buttonObserverHandler(mutations) {
    clearTimeout(buttonObserver.debouncedTimeout);
    buttonObserver.debouncedTimeout = setTimeout(() => {
        if (isHideChatButton(buttonObserver.node)) {
            log(buttonObserver.node);
            const { nodeId, originalNodeId } = setAndGetNodeId(buttonObserver.node, getUrlSearchParams().get('v'));
            log('found hide chat button', nodeId, originalNodeId);
            return;
            if (originalNodeId === nodeId) return; // we've already automatically triggered hide chat
            buttonObserver.node.click();
        }
    }, 50);
  }

  function addedNodeHandler(node) {
    if (!(
        node.matches &&
        buttonSelectors.some(b => node.matches(b))
    )) {
      return;
    }

    const { nodeId, originalNodeId } = setAndGetNodeId(node, getUrlSearchParams().get('v'));
    // log(nodeId, originalNodeId);

    if (originalNodeId === nodeId) return; // we've already automatically triggered hide chat

    if (isHideChatButton(node)) {
      node.click();
      log(`Hid the chat by default`);

      if (!buttonObserver.observer) {
        buttonObserver.observer = new MutationObserver(buttonObserverHandler);
        buttonObserver.node = node;

        buttonObserver.observer.observe(node, {
          attributes: true,
          childList: true,
          subtree: true,
          characterData: true
        });
      }
    }
  }

  const bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      const newNodes = [];
      window.mut.push(mutation);

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

  bodyObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  });
})();
