// ==UserScript==
// @name         ChatGPT - US Sign Dark Glass Theme
// @namespace    us-sign-full-modules
// @version      2.1.9
// @description  Modern graphite glass for ChatGPT with matched darker navigation/reading glass, 10% faster cinematic panning, and the fresh today-only Bing UHD pool.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.3.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.5.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.7.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme-v2.1.8.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/ChatGPT-US-Sign-Glass-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__chatgptUsSignDarkGlassThemeV219) return;
  window.__chatgptUsSignDarkGlassThemeV219 = true;

  const root = document.documentElement;
  if (!root) return;

  const CINEMATIC_RATE = 1.10;
  const MATCHED_PANEL_ALPHA = 0.55;

  root.dataset.usSignTheme = "dark-glass-cinematic-contrast-speed";
  root.dataset.usSignThemeVersion = "2.1.9";
  root.dataset.usWallpaperSpeed = `${CINEMATIC_RATE.toFixed(2)}x`;
  root.dataset.usPanelDarkness = `${Math.round(MATCHED_PANEL_ALPHA * 100)}%`;

  GM_addStyle(String.raw`
    /* v2.1.9: the conversation reading glass and left navigation now use the
       same graphite density. The prior sidebar base alpha was ~0.46; 0.55 is
       approximately a 20% increase in opacity/darkness while remaining glass. */
    #stage-slideover-sidebar,
    #us-reading-glass {
      background-color: rgba(8, 8, 11, ${MATCHED_PANEL_ALPHA}) !important;
      background-image: linear-gradient(
        180deg,
        rgba(255,255,255,0.030) 0%,
        rgba(255,255,255,0.010) 42%,
        rgba(255,255,255,0.004) 100%
      ) !important;
    }

    /* Keep the same tonal processing so the two large glass planes read as a
       matched system. Blur radii remain slightly different for their jobs. */
    #stage-slideover-sidebar {
      -webkit-backdrop-filter: blur(18px) saturate(116%) brightness(88%) !important;
      backdrop-filter: blur(18px) saturate(116%) brightness(88%) !important;
    }

    #us-reading-glass {
      -webkit-backdrop-filter: blur(20px) saturate(116%) brightness(88%) !important;
      backdrop-filter: blur(20px) saturate(116%) brightness(88%) !important;
    }

    @media (max-width: 768px) {
      #us-reading-glass {
        -webkit-backdrop-filter: blur(14px) saturate(112%) brightness(88%) !important;
        backdrop-filter: blur(14px) saturate(112%) brightness(88%) !important;
      }
    }
  `);

  /* v2.1.5 uses Web Animations for each long pan leg and a matching timeout
     for its early waypoint handoff. Speeding only the animation would make the
     image finish before the handoff timer. These wrappers accelerate both by
     exactly the same 1.10x factor, and only for .us-cine-layer motion. */
  const nativeAnimate = Element.prototype.animate;
  const nativeSetTimeout = window.setTimeout.bind(window);
  const boostedAnimations = new WeakSet();
  let expectingCinematicHandoff = 0;

  function boostAnimation(animation) {
    if (!animation || boostedAnimations.has(animation)) return animation;
    boostedAnimations.add(animation);

    try {
      const baseRate = Number(animation.playbackRate) || 1;
      if (typeof animation.updatePlaybackRate === "function") {
        animation.updatePlaybackRate(baseRate * CINEMATIC_RATE);
      } else {
        animation.playbackRate = baseRate * CINEMATIC_RATE;
      }
    } catch (_) {}

    return animation;
  }

  Element.prototype.animate = function patchedUsCinematicAnimate(keyframes, options) {
    const animation = nativeAnimate.call(this, keyframes, options);

    if (this?.classList?.contains("us-cine-layer")) {
      boostAnimation(animation);
      expectingCinematicHandoff += 1;

      queueMicrotask(() => {
        if (expectingCinematicHandoff > 0) expectingCinematicHandoff -= 1;
      });
    }

    return animation;
  };

  window.setTimeout = function patchedUsCinematicTimeout(callback, delay, ...args) {
    const numericDelay = Number(delay);

    /* The v2.1.5 handoff timeout is scheduled synchronously immediately after
       its .us-cine-layer animation and normally falls in this long-leg range. */
    if (
      expectingCinematicHandoff > 0 &&
      Number.isFinite(numericDelay) &&
      numericDelay >= 35000 &&
      numericDelay <= 90000
    ) {
      expectingCinematicHandoff -= 1;
      return nativeSetTimeout(callback, numericDelay / CINEMATIC_RATE, ...args);
    }

    return nativeSetTimeout(callback, delay, ...args);
  };

  function boostAnyExistingCinematicAnimations() {
    document.querySelectorAll(".us-cine-layer").forEach((layer) => {
      try {
        layer.getAnimations().forEach(boostAnimation);
      } catch (_) {}
    });
  }

  function contrastSpeedDebug() {
    const reading = document.getElementById("us-reading-glass");
    const sidebar = document.getElementById("stage-slideover-sidebar");
    const activeLayer = document.querySelector('.us-cine-layer[data-active="true"]');
    const activeAnimations = activeLayer ? activeLayer.getAnimations() : [];

    const panelSnapshot = (element) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        backgroundImage: style.backgroundImage,
        backdropFilter: style.backdropFilter
      };
    };

    return {
      version: root.dataset.usSignThemeVersion,
      cinematicRate: CINEMATIC_RATE,
      panelDarknessAlpha: MATCHED_PANEL_ALPHA,
      readingGlass: panelSnapshot(reading),
      sidebar: panelSnapshot(sidebar),
      activeAnimationPlaybackRates: activeAnimations.map((animation) => animation.playbackRate)
    };
  }

  window.__usContrastSpeedDebug = contrastSpeedDebug;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boostAnyExistingCinematicAnimations, { once: true });
  } else {
    boostAnyExistingCinematicAnimations();
  }

  window.addEventListener("pageshow", boostAnyExistingCinematicAnimations, { passive: true });
})();
