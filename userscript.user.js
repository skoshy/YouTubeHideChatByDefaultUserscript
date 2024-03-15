// ==UserScript==
// @name         YouTube Hide Chat by Default
// @namespace    https://skoshy.com
// @version      0.7.1
// @description  Hides chat on YouTube live streams by default
// @author       Stefan K.
// @match        https://www.youtube.com/*
// @updateURL    https://github.com/skoshy/YouTubeHideChatByDefaultUserscript/raw/master/userscript.user.js
// @grant        GM.getValue
// @grant        GM.setValue
// @icon         https://youtube.com/favicon.ico
// ==/UserScript==

const scriptId = "youtube-hide-chat-by-default";

const UNIQUE_ID = (function getUniqueId() {
  if (window.top !== window.self) {
    const capturedUniqueId = new URL(window.location.href).searchParams.get(`${scriptId}-unique-id`);

    if (!capturedUniqueId) {
      throw new Error(`Unique ID was not properly passed to iFrame: ${window.location.href}`);
    }

    log('Running in an iFrame, grabbed unique ID from URL', capturedUniqueId, window.location.href);

    return capturedUniqueId;
  }

  return Math.floor(Math.random()*1000000);
})();

function log(...toLog) {
  console.log(`[${scriptId}]:`, ...toLog);
}

const StorageClass = (scriptId, uniqueId, allowedKeys) => {
  (async function updateSubStorageIds() {
    const subStorageKey = `${scriptId}_base_subStorageIds`;
    const subStorageIds = JSON.parse((await GM.getValue(subStorageKey)) || '{}');
    console.log({subStorageIds});
    await GM.setValue(subStorageKey, JSON.stringify({
      ...subStorageIds,
      [uniqueId]: {
        dateCreated: Date.now(),
      },
    }));
    const newSubStorageIds = (await GM.getValue(subStorageKey)) || {};
    console.log('Set the value for subStorageIds', newSubStorageIds);
  })();

  const setVal = async (key, val) => {
    if (!allowedKeys.includes(key)) {
      throw new Error('Key not allowed');
    }

    await GM.setValue(`${scriptId}_${uniqueId}_${key}`, val);
  }

  const getVal = async (key) => {
    if (!allowedKeys.includes(key)) {
      throw new Error('Key not allowed');
    }

    return GM.getValue(`${scriptId}_${uniqueId}_${key}`);
  };

  return { setVal, getVal };
};

const { setVal, getVal } = StorageClass(scriptId, UNIQUE_ID, ['lastVidThatHidChat']);

(function() {
  "use strict";

  // - if youtube decides to use a new button type, add it here
  const buttonSelectors = ["button"];
  const mutationObserverSelectors = [...buttonSelectors, 'iframe'];

  function getRootUrlSearchParams() {
    return new URL(window.location.href).searchParams;
  }

  function getCurrentVideoId() {
    const v = getRootUrlSearchParams().get('v');

    if (v) {
      return v;
    }

    // if not the parent frame, then get it from the passed in iframe url params
    return getRootUrlSearchParams().get(`${scriptId}-current-video-id`);
  }

  function findAncestorOfElement(el, findFunc) {
    let currentEl = el;

    while (currentEl?.parentElement) {
      const result = findFunc(currentEl.parentElement);

      if (result) {
        return currentEl.parentElement;
      }

      currentEl = currentEl.parentElement;
    }

    return undefined;
  }

  function isHideChatButton(node) {
    const youtubeLiveChatAppAncestor = findAncestorOfElement(node, (parentEl) => {
      return parentEl.tagName === 'YT-LIVE-CHAT-APP';
    });

    if (!youtubeLiveChatAppAncestor) {
      return false;
    }

    return (node.getAttribute('aria-label') === 'Close');
  }

  function addedNodeHandler(node) {
    if (!node.matches) return;

    if (node.matches('iframe')) {
      handleAddedIframe(node);
      return;
    }

    if (
      !buttonSelectors.some(b => node.matches(b))
    ) {
      return;
    }

    if (isHideChatButton(node)) {
      log(`Found a hide-chat button`, node);

      const currentVid = getCurrentVideoId();
      const lastVidThatHidChat = getVal('lastVidThatHidChat');

      if (lastVidThatHidChat === currentVid) {
        log(`Already automatically triggered to hide chat for this video`, { lastVidThatHidChat, currentVid });
        return;
      }

      log(`Attempting to hide the chat by default`, { lastVidThatHidChat, currentVid });

      setVal('lastVidThatHidChat', currentVid);

      node.click();
    }
  }

  function handleAddedIframe(node) {
    if (node.getAttribute(`${scriptId}-modified-src`)) {
      return;
    }

    const url = new URL(node.src);
    url.searchParams.set(`${scriptId}-unique-id`, UNIQUE_ID);
    url.searchParams.set(`${scriptId}-current-video-id`, getCurrentVideoId());
    log('New iFrame URL', url.toString());

    node.src = url.toString();
    node.setAttribute(`${scriptId}-modified-src`, true);
  }

  /*
  const bodyObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      const newNodes = [];

      mutation.addedNodes.forEach(addedNode => {
        newNodes.push(addedNode);

        // it might be text node or comment node which don't have querySelectorAll
        if (addedNode.querySelectorAll) {
          mutationObserverSelectors.forEach(bs => {
            addedNode.querySelectorAll(bs).forEach((n) => {
              newNodes.push(n);
            });
          });
        }
      });

      newNodes.forEach(n => addedNodeHandler(n));
    });
  });
  */

  setInterval(() =>
              Array.from(
    document.querySelectorAll(mutationObserverSelectors.join(', '))
  ).forEach(n => addedNodeHandler(n))
              , 3000);

  /*
  bodyObserver.observe(document, {
    attributes: true,
    childList: true,
    subtree: true,
    characterData: true
  });
  */

  log('Initialized', UNIQUE_ID, window.location.href);
})();
