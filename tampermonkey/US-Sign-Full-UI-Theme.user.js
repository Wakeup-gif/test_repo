// ==UserScript==
// @name         US Sign Full UI Theme
// @namespace    us-sign-full-modules
// @version      2.2.9
// @description  SquareCoil v2.2.7 visual system plus a dashboard.php?show=2-only refresh, with both required dependency layers loaded directly.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @connect      www.bing.com
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/a340786458402732f0f78d48face95c940adabf3/tampermonkey/US-Sign-Full-UI-Theme-v2.2.6.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/b0a89382eabdbcb873b3f8d20bcacb05ada7b63c/tampermonkey/US-Sign-Full-UI-Theme-v2.2.7.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/US-Sign-Full-UI-Theme.user.js
// ==/UserScript==

(function () {
  "use strict";

  if (window.__usSignFullUIThemeV229) return;
  window.__usSignFullUIThemeV229 = true;

  const root = document.documentElement;
  if (!root) return;

  root.dataset.usSignThemeVersion = "2.2.9";

  const params = new URLSearchParams(location.search);
  const isDesignDashboard = /\/dashboard\.php$/i.test(location.pathname) && params.get("show") === "2";
  if (!isDesignDashboard) return;

  root.classList.add("us-sign-dashboard-designs-v229");
  root.dataset.usSignDashboardRefresh = "designs-2026-live-dom-safe";

  GM_addStyle(String.raw`
    html.us-sign-dashboard-designs-v229 #content {
      padding-top: 22px !important;
      padding-right: 22px !important;
      padding-bottom: 54px !important;
      padding-left: 22px !important;
    }

    html.us-sign-dashboard-designs-v229 #content .mw1000.center-block.demo-block.mt30 {
      width: calc(100% - 24px) !important;
      max-width: 1180px !important;
      margin: 20px auto 0 !important;
    }

    html.us-sign-dashboard-designs-v229 #page-content,
    html.us-sign-dashboard-designs-v229 #db-designs {
      width: 100% !important;
      max-width: none !important;
    }

    html.us-sign-dashboard-designs-v229 :is(#widget-tasks,#widget-designs,#widget-estimates) {
      min-height: 94px !important;
      height: auto !important;
      margin-bottom: 12px !important;
      color: var(--us-text) !important;
      background-color: rgba(10,10,13,0.55) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,0.030),rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.080) !important;
      border-radius: 15px !important;
      box-shadow: 0 12px 34px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.035) !important;
      -webkit-backdrop-filter: blur(20px) saturate(118%) brightness(88%) !important;
      backdrop-filter: blur(20px) saturate(118%) brightness(88%) !important;
      overflow: hidden !important;
      transition: transform 160ms ease,border-color 160ms ease,background-color 160ms ease !important;
    }

    html.us-sign-dashboard-designs-v229 #widget-tasks {
      box-shadow: inset 3px 0 0 rgba(142,203,255,0.55),0 12px 34px rgba(0,0,0,0.16),inset 0 1px 0 rgba(255,255,255,0.035) !important;
    }

    html.us-sign-dashboard-designs-v229 #widget-designs {
      box-shadow: inset 3px 0 0 rgba(199,169,107,0.52),0 12px 34px rgba(0,0,0,0.16),inset 0 1px 0 rgba(255,255,255,0.035) !important;
    }

    html.us-sign-dashboard-designs-v229 #widget-estimates {
      box-shadow: inset 3px 0 0 rgba(196,122,122,0.50),0 12px 34px rgba(0,0,0,0.16),inset 0 1px 0 rgba(255,255,255,0.035) !important;
    }

    html.us-sign-dashboard-designs-v229 :is(#widget-tasks,#widget-designs,#widget-estimates) > div {
      min-height: 92px !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: center !important;
      padding: 14px 20px !important;
      background: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-dashboard-designs-v229 :is(#widget-tasks,#widget-designs,#widget-estimates) h2 {
      margin: 0 0 7px !important;
      color: #f5f7fa !important;
      font-size: 30px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      letter-spacing: -0.035em !important;
    }

    html.us-sign-dashboard-designs-v229 :is(#widget-tasks,#widget-designs,#widget-estimates) h5 {
      margin: 0 !important;
      color: rgba(213,218,225,0.82) !important;
      font-size: 12.5px !important;
      font-weight: 600 !important;
      line-height: 1.25 !important;
      letter-spacing: 0.01em !important;
    }

    html.us-sign-dashboard-designs-v229 :is(#widget-tasks,#widget-designs,#widget-estimates) .icon-bg {
      opacity: 0.11 !important;
      transform: scale(0.92) !important;
      transform-origin: center !important;
    }

    @media (hover:hover) and (pointer:fine) {
      html.us-sign-dashboard-designs-v229 :is(#widget-tasks,#widget-designs,#widget-estimates):hover {
        transform: translateY(-2px) !important;
        border-color: rgba(255,255,255,0.115) !important;
        background-color: rgba(12,12,15,0.60) !important;
      }
    }

    html.us-sign-dashboard-designs-v229 #page-content .panel.heading-border.panel-primary {
      position: relative !important;
      width: 100% !important;
      margin: 0 !important;
      color: var(--us-text-soft) !important;
      background-color: rgba(10,10,13,0.55) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.003)) !important;
      border: 1px solid rgba(255,255,255,0.080) !important;
      border-radius: 16px !important;
      box-shadow: 0 18px 44px rgba(0,0,0,0.18),inset 0 1px 0 rgba(255,255,255,0.032) !important;
      -webkit-backdrop-filter: blur(20px) saturate(118%) brightness(88%) !important;
      backdrop-filter: blur(20px) saturate(118%) brightness(88%) !important;
      overflow: hidden !important;
    }

    html.us-sign-dashboard-designs-v229 #page-content .panel-body.bg-light {
      width: 100% !important;
      padding: 22px 24px 24px !important;
      color: var(--us-text-soft) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      border: 0 !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
      overflow-x: auto !important;
      overflow-y: visible !important;
    }

    html.us-sign-dashboard-designs-v229 #multiple_location_id {
      width: min(340px,100%) !important;
      min-height: 38px !important;
      margin: 0 0 10px !important;
      padding: 8px 34px 8px 12px !important;
      color: #f2f4f7 !important;
      background-color: rgba(8,8,10,0.72) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,0.026),rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.090) !important;
      border-radius: 9px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.025) !important;
      font-size: 13px !important;
      font-weight: 550 !important;
    }

    html.us-sign-dashboard-designs-v229 #multiple_location_id:focus {
      border-color: rgba(142,203,255,0.42) !important;
      box-shadow: 0 0 0 3px rgba(142,203,255,0.08) !important;
      outline: none !important;
    }

    html.us-sign-dashboard-designs-v229 #multiple_location_id option {
      color: #f2f4f7 !important;
      background: #111216 !important;
    }

    html.us-sign-dashboard-designs-v229 #db-designs h3 {
      margin: 24px 0 10px !important;
      padding: 0 0 9px !important;
      color: #f3f5f8 !important;
      border-bottom: 1px solid rgba(255,255,255,0.075) !important;
      font-family: var(--us-font) !important;
      font-size: 15px !important;
      font-weight: 700 !important;
      line-height: 1.3 !important;
      letter-spacing: -0.012em !important;
    }

    html.us-sign-dashboard-designs-v229 :is(#inProgress,#nextJob,#onHold).design-list-container {
      width: 100% !important;
      margin: 0 0 18px !important;
      color: var(--us-text-soft) !important;
      background: rgba(255,255,255,0.018) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,0.012),rgba(255,255,255,0)) !important;
      border: 1px solid rgba(255,255,255,0.065) !important;
      border-radius: 12px !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.018) !important;
      overflow: hidden !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-dashboard-designs-v229 .design-list-container .clickableRowx,
    html.us-sign-dashboard-designs-v229 .design-list-container > .row {
      color: var(--us-text-soft) !important;
      background-color: transparent !important;
      background-image: none !important;
      border-bottom: 1px solid rgba(255,255,255,0.050) !important;
      box-shadow: none !important;
      transition: background-color 140ms ease !important;
    }

    html.us-sign-dashboard-designs-v229 .design-list-container > .row:last-child,
    html.us-sign-dashboard-designs-v229 .design-list-container .clickableRowx:last-child {
      border-bottom-color: transparent !important;
    }

    @media (hover:hover) and (pointer:fine) {
      html.us-sign-dashboard-designs-v229 .design-list-container .clickableRowx:hover,
      html.us-sign-dashboard-designs-v229 .design-list-container > .row:hover {
        background-color: rgba(255,255,255,0.040) !important;
      }
    }

    html.us-sign-dashboard-designs-v229 .design-list-container :is(.col0,.col1,.col2,.col3) {
      color: rgba(222,227,234,0.92) !important;
      line-height: 1.42 !important;
    }

    html.us-sign-dashboard-designs-v229 .design-list-container :is(.bold,strong,b) {
      color: #f3f5f8 !important;
      font-weight: 650 !important;
    }

    html.us-sign-dashboard-designs-v229 :is(.sort-btn,.existing-sort) {
      color: rgba(190,218,241,0.88) !important;
    }

    html.us-sign-dashboard-designs-v229 :is(.design-pop-icon,.fa-info-circle) {
      color: rgba(142,203,255,0.82) !important;
      opacity: 0.88 !important;
    }

    html.us-sign-dashboard-designs-v229 .expander,
    html.us-sign-dashboard-designs-v229 .expander1 {
      color: rgba(199,208,218,0.88) !important;
    }

    html.us-sign-dashboard-designs-v229 #db-designs .btn.btn-xs.btn-primary {
      margin: 0 0 14px !important;
      padding: 7px 11px !important;
      color: rgba(235,239,244,0.92) !important;
      background: rgba(255,255,255,0.055) !important;
      background-image: none !important;
      border: 1px solid rgba(255,255,255,0.075) !important;
      border-radius: 8px !important;
      box-shadow: none !important;
      font-size: 12px !important;
      font-weight: 600 !important;
    }

    html.us-sign-dashboard-designs-v229 #db-designs .btn.btn-xs.btn-primary:hover {
      background: rgba(255,255,255,0.090) !important;
      border-color: rgba(255,255,255,0.11) !important;
    }

    html.us-sign-dashboard-designs-v229 :is(#complete-tasks-form,#description-modal .modal-content,.show-materials-used-warning-modal-content,.popup-modal) {
      color: var(--us-text-soft) !important;
      background-color: rgba(10,10,13,0.86) !important;
      background-image: linear-gradient(180deg,rgba(255,255,255,0.030),rgba(255,255,255,0.004)) !important;
      border: 1px solid rgba(255,255,255,0.085) !important;
      border-radius: 14px !important;
      box-shadow: 0 24px 64px rgba(0,0,0,0.34) !important;
      -webkit-backdrop-filter: blur(20px) saturate(116%) brightness(88%) !important;
      backdrop-filter: blur(20px) saturate(116%) brightness(88%) !important;
    }

    html.us-sign-dashboard-designs-v229 #description-modal :is(.modal-header,.modal-body,.modal-footer),
    html.us-sign-dashboard-designs-v229 #complete-tasks-form > * {
      color: inherit !important;
      background: transparent !important;
      background-image: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    html.us-sign-dashboard-designs-v229 #page-content .panel-body.bg-light::-webkit-scrollbar {
      height: 8px !important;
    }

    html.us-sign-dashboard-designs-v229 #page-content .panel-body.bg-light::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.16) !important;
      border-radius: 999px !important;
    }

    @media (max-width:1100px) {
      html.us-sign-dashboard-designs-v229 #content .mw1000.center-block.demo-block.mt30 {
        width: 100% !important;
        max-width: none !important;
      }
    }

    @media (max-width:768px) {
      html.us-sign-dashboard-designs-v229 #content {
        padding: 14px 12px 40px !important;
      }

      html.us-sign-dashboard-designs-v229 :is(#widget-tasks,#widget-designs,#widget-estimates),
      html.us-sign-dashboard-designs-v229 #page-content .panel.heading-border.panel-primary {
        -webkit-backdrop-filter: blur(14px) saturate(114%) brightness(90%) !important;
        backdrop-filter: blur(14px) saturate(114%) brightness(90%) !important;
      }

      html.us-sign-dashboard-designs-v229 #page-content .panel-body.bg-light {
        padding: 16px !important;
      }
    }
  `);

  function dashboardDebug() {
    const snapshot = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return null;
      const style = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return {
        selector,
        rect: {
          x: Math.round(rect.x * 10) / 10,
          y: Math.round(rect.y * 10) / 10,
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10
        },
        backgroundColor: style.backgroundColor,
        backdropFilter: style.backdropFilter,
        borderRadius: style.borderRadius,
        overflow: style.overflow
      };
    };

    return {
      version: root.dataset.usSignThemeVersion,
      dashboardRefresh: root.dataset.usSignDashboardRefresh,
      path: location.pathname,
      show: params.get("show"),
      classActive: root.classList.contains("us-sign-dashboard-designs-v229"),
      baseLoaded: Boolean(window.__usSignFullUIThemeV227),
      workspace: snapshot("#content .mw1000.center-block.demo-block.mt30"),
      tasks: snapshot("#widget-tasks"),
      designs: snapshot("#widget-designs"),
      estimates: snapshot("#widget-estimates"),
      queuePanel: snapshot("#page-content .panel.heading-border.panel-primary"),
      queueBody: snapshot("#page-content .panel-body.bg-light"),
      inProgress: snapshot("#inProgress"),
      nextJob: snapshot("#nextJob"),
      onHold: snapshot("#onHold"),
      visibleRows: document.querySelectorAll(".design-list-container .clickableRowx").length
    };
  }

  window.__usSquareCoilDashboardDebug = dashboardDebug;
})();
