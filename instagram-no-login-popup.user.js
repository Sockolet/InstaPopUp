// ==UserScript==
// @name         Instagram: hide login pop-up
// @namespace    instapopup
// @version      1.0.0
// @description  Hides the "log in" modal that appears when scrolling a public profile and restores scrolling.
// @match        https://www.instagram.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const HIDDEN_ATTR = 'data-nologin-hidden';
  const ROOT_ATTR = 'data-nologin-active';

  // Keeps the page scrollable while a login dialog has been hidden.
  const style = document.createElement('style');
  style.textContent = `
    [${HIDDEN_ATTR}] { display: none !important; }
    html[${ROOT_ATTR}], html[${ROOT_ATTR}] body { overflow: auto !important; }
  `;
  document.documentElement.appendChild(style);

  // Login pop-ups are short cards whose only content is a few "Sign up"/"Log in" actions
  // (buttons or links), so they are matched by structure and work in any UI language.
  // The cookie-consent dialog and post viewers have long text or post content and are left alone.
  const isLoginDialog = (dialog) => {
    if (
      dialog.querySelector(
        'input[name="password"], a[href*="/accounts/login"], a[href*="/accounts/emailsignup"]'
      )
    ) {
      return true;
    }
    return (
      dialog.innerText.length < 300 &&
      !dialog.querySelector('input, textarea, select, article, video') &&
      [...dialog.querySelectorAll('[role="button"], a[href]')].filter((b) => b.innerText.trim())
        .length >= 2
    );
  };

  // Climb to the outermost wrapper (dim backdrop included) that adds no text or media
  // beyond the dialog itself, so page content is never hidden with it.
  function overlayRoot(dialog) {
    const textLen = dialog.innerText.length;
    const mediaCount = dialog.querySelectorAll('img, video').length;
    let node = dialog;
    for (let p = node.parentElement; p; p = node.parentElement) {
      if (
        p === document.body ||
        p === document.documentElement ||
        p.matches('main, article, [role="main"]') ||
        p.querySelector('main, article, [role="main"]') ||
        p.innerText.length > textLen + 20 ||
        p.querySelectorAll('img, video').length !== mediaCount
      ) {
        break;
      }
      node = p;
    }
    return node;
  }

  function sweep() {
    // The real login page must keep working.
    if (location.pathname.startsWith('/accounts/')) return;

    let hidden = false;
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {
      if (dialog.closest(`[${HIDDEN_ATTR}]`)) {
        hidden = true;
      } else if (isLoginDialog(dialog)) {
        overlayRoot(dialog).setAttribute(HIDDEN_ATTR, '');
        hidden = true;
      }
    }
    // Drop the scroll unlock once no hidden dialog remains in the DOM.
    const stillHidden = document.querySelector(`[${HIDDEN_ATTR}]`);
    document.documentElement.toggleAttribute(ROOT_ATTR, hidden || !!stillHidden);
  }

  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      sweep();
    });
  };

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
  schedule();

  // Instagram answers a thumbnail click with a login wall instead of the post. The post's
  // own page is public, so open it directly.
  document.addEventListener(
    'click',
    (e) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      const link = e.target instanceof Element && e.target.closest('a[href]');
      if (!link || link.closest('[role="dialog"]')) return;
      const url = new URL(link.getAttribute('href'), location.href);
      if (url.origin === location.origin && /\/(p|reel|tv)\/[^/]+/.test(url.pathname)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        location.assign(url.href);
      }
    },
    true
  );
})();
