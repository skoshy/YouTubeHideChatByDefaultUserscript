// ==UserScript==
// @name         YouTube Hide Chat by Default
// @namespace    https://skoshy.com
// @version      0.2.0
// @description  Hides chat on YouTube live streams by default
// @author       Stefan K.
// @match        https://*.youtube.com/*
// @updateURL    https://github.com/skoshy/YouTubeHideChatByDefaultUserscript/raw/master/userscript.user.js
// @grant        none
// ==/UserScript==

const scriptId = "youtube-hide-chat-by-default";
const buttonSelector = "paper-button";

(function() {
  "use strict";

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
    if (!node.matches || !node.matches(buttonSelector)) {
      return;
    }

    const { nodeId, hadNodeIdSet } = setAndGetNodeId(node);

    if (!hadNodeIdSet) {
      // this is a new element

      if (node.innerText === "HIDE CHAT") {
        node.click();
        log(`Hid the chat by default`);
      }
    }
  }

  var bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      mutation.addedNodes.forEach(addedNode => {
        addedNodeHandler(addedNode);

        // it might be text node or comment node which don't have querySelectorAll
        addedNode.querySelectorAll &&
          addedNode.querySelectorAll(buttonSelector).forEach(addedNodeHandler);
      });
    });
  });

  var bodyObserverConfig = {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  };

  bodyObserver.observe(document.body, bodyObserverConfig);
})();
