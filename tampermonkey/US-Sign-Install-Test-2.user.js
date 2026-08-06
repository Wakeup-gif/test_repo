// ==UserScript==
// @name         US Sign Install Test 2
// @namespace    https://ussignandmill.squarecoil.net/
// @version      1.0.0
// @description  Confirms Tampermonkey installation and execution on SquareCoil.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// ==/UserScript==

(function () {
  "use strict";

  const id = "us-sign-install-test-2";
  if (document.getElementById(id)) return;

  const badge = document.createElement("div");
  badge.id = id;
  badge.textContent = "Tampermonkey test active";
  badge.style.cssText = [
    "position:fixed",
    "right:16px",
    "bottom:16px",
    "z-index:2147483647",
    "padding:10px 14px",
    "border:1px solid rgba(255,255,255,.22)",
    "border-radius:8px",
    "background:#151a20",
    "color:#f4f6f8",
    "font:600 13px/1.2 system-ui,sans-serif",
    "box-shadow:0 10px 28px rgba(0,0,0,.35)"
  ].join(";");

  document.body.appendChild(badge);
  console.log("US Sign Install Test 2 executed successfully.");
})();
