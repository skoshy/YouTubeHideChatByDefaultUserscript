// ==UserScript==
// @name         YouTube Hide Chat by Default
// @namespace    https://skoshy.com
// @version      0.3.1
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
  const buttonSelectors = ["paper-button", "ytd-toggle-button-renderer"];
  // - for different languages for the HIDE CHAT text, add them here
  const hideChatTexts = [
    'HIDE CHAT', // english
    'HIDE CHAT REPLAY', // english - replay
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

  function setAndGetNodeId(node) {
    const nodeIdString = `${scriptId}-id`;

    let nodeId = node.getAttribute(nodeIdString);
    let hadNodeIdSet = true;

    // log("new node found", { nodeId, hadNodeIdSet, node });

    if (!nodeId) {
      hadNodeIdSet = false;
      nodeId = Math.random().toString();
      node.setAttribute(nodeIdString, nodeId);
    }

    return { nodeId, hadNodeIdSet };
  }

  function addedNodeHandler(node) {
    if (!(
        node.matches &&
        buttonSelectors.some(b => node.matches(b))
    )) {
      return;
    }

    const { nodeId, hadNodeIdSet } = setAndGetNodeId(node);

    if (!hadNodeIdSet) {
      // this is a new element

      if (hideChatTexts.includes(node.innerText.toUpperCase().trim())) {
        node.click();
        log(`Hid the chat by default`);
      }
    }
  }

  const bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(addedNode => {
        addedNodeHandler(addedNode);

        // it might be text node or comment node which don't have querySelectorAll
        if (addedNode.querySelectorAll) {
          buttonSelectors.forEach(bs => {
            addedNode.querySelectorAll(bs).forEach(addedNodeHandler);
          })
        }
      });
    });
  });

  bodyObserver.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  });
})();
