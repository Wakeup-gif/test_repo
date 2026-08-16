from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.13" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.13")

text = text.replace("@version      2.0.13", "@version      2.0.14", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with resilient 30-minute Bing UHD rotation, optimized parallax, translucent sidebar glass, snapshot-grounded #thread reading glass, native document stacking, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with snapshot-audited viewport glass, resilient Bing UHD rotation, low-overhead parallax, single-layer sidebar/composer frost, improved contrast, native layout, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV213", "window.__chatgptUsSignGlassThemeV214")

style_start = text.find("  GM_addStyle(String.raw`")
style_end_marker = "\n  `);\n\n  const ROTATE_MS"
style_end = text.find(style_end_marker, style_start)
if style_start == -1 or style_end == -1:
    raise SystemExit("theme style block not found")

new_style = r'''  GM_addStyle(String.raw`
    @import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;650;700&display=swap");

    :root,
    html.dark,
    html[data-theme="dark"] {
      --us-bg: rgba(9, 15, 23, 0.18);
      --us-bg-elevated: rgba(20, 31, 43, 0.62);
      --us-bg-soft: rgba(24, 37, 50, 0.46);
      --us-glass: rgba(18, 30, 43, 0.54);
      --us-glass-strong: rgba(14, 25, 37, 0.76);
      --us-glass-soft: rgba(255, 255, 255, 0.05);
      --us-hover: rgba(123, 194, 255, 0.12);
      --us-text: #f6f9fc;
      --us-text-soft: #eaf0f5;
      --us-text-muted: #b6c2ce;
      --us-accent: #9bd3ff;
      --us-accent-soft: rgba(72, 166, 244, 0.18);
      --us-border: rgba(184, 220, 249, 0.14);
      --us-border-strong: rgba(195, 227, 252, 0.22);
      --us-border-focus: rgba(111, 190, 255, 0.62);
      --us-shadow-sm: 0 5px 16px rgba(0, 0, 0, 0.18);
      --us-shadow-md: 0 16px 42px rgba(0, 0, 0, 0.24);
      --us-radius-sm: 8px;
      --us-radius-md: 12px;
      --us-radius-lg: 20px;
      --us-font: "Manrope", "Avenir Next", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      --us-wallpaper: url("https://www.bing.com/th?id=OBTQ.BTA9ACD46ADE4DF290D5640B661E6A5C8CF666B651507F76309661E06C8AA70FB2&rs=2&c=1");
      --us-wallpaper-transform: translate3d(0px, 0px, 0) scale(1.06);

      /* Keep incidental ChatGPT surfaces readable while the actual page/thread
         stay transparent over the wallpaper. */
      --main-surface-primary: rgba(17, 29, 42, 0.30) !important;
      --main-surface-secondary: rgba(23, 37, 51, 0.40) !important;
      --main-surface-tertiary: rgba(29, 45, 60, 0.48) !important;
      --sidebar-surface-primary: rgba(27, 43, 58, 0.12) !important;
      --sidebar-surface-secondary: rgba(38, 58, 76, 0.13) !important;
      --sidebar-surface-tertiary: rgba(48, 68, 86, 0.11) !important;
      --composer-surface: rgba(15, 28, 40, 0.70) !important;
      --composer-surface-primary: rgba(15, 28, 40, 0.70) !important;
      --composer-blue-bg: rgba(80, 165, 238, 0.14) !important;
      --message-surface: rgba(20, 34, 48, 0.30) !important;
      --text-primary: var(--us-text) !important;
      --text-secondary: var(--us-text-soft) !important;
      --text-tertiary: var(--us-text-muted) !important;
      --border-light: var(--us-border) !important;
      --border-medium: var(--us-border-strong) !important;
      --interactive-bg-secondary-default: rgba(255, 255, 255, 0.045) !important;
      --interactive-bg-secondary-hover: rgba(123, 194, 255, 0.10) !important;
    }

    html {
      min-height: 100% !important;
      color-scheme: dark !important;
      background: #081019 !important;
    }

    /* One compositor-friendly wallpaper plane. Mouse parallax only changes
       this transform variable once per pointer animation frame. */
    html::before {
      content: "" !important;
      position: fixed !important;
      inset: -4vh -4vw !important;
      z-index: 0 !important;
      pointer-events: none !important;
      background-image:
        radial-gradient(circle at 78% 0%, rgba(42, 135, 255, 0.12), transparent 38%),
        radial-gradient(circle at 14% 100%, rgba(100, 210, 255, 0.055), transparent 34%),
        linear-gradient(rgba(4, 8, 13, 0.20), rgba(6, 11, 17, 0.38)),
        var(--us-wallpaper) !important;
      background-position: center !important;
      background-size: auto, auto, auto, cover !important;
      background-repeat: no-repeat !important;
      transform: var(--us-wallpaper-transform) !important;
      transform-origin: center center !important;
      transition: transform 170ms cubic-bezier(.2,.7,.2,1) !important;
      will-change: transform !important;
      backface-visibility: hidden !important;
    }

    body,
    #__next,
    #root {
      min-height: 100% !important;
      color: var(--us-text) !important;
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
      font-family: var(--us-font) !important;
    }

    body {
      scrollbar-color: rgba(210, 231, 248, 0.20) transparent !important;
    }

    body,
    input,
    textarea,
    select,
    button {
      font-family: var(--us-font) !important;
    }

    /* Snapshot-grounded page ownership. Do not globally erase every
       bg-token-main-surface class: those small native surfaces are useful for
       contrast. Only the real page/scroll/thread canvas is transparent. */
    #main,
    #thread,
    [class~="group/scroll-root"] {
      background: transparent !important;
      background-color: transparent !important;
      background-image: none !important;
    }

    /* PERFORMANCE: the old rear rail was ~920px x 58,000px and carried a
       backdrop-filter across the entire conversation. This sticky pseudo-item
       is viewport bounded, so Chrome only maintains roughly one screen of
       frosted pixels while the thread scrolls underneath it. */
    #thread {
      position: relative !important;
      isolation: isolate !important;
    }

    #thread::before {
      content: "" !important;
      display: block !important;
      position: sticky !important;
      top: 60px !important;
      align-self: center !important;
      flex: 0 0 auto !important;
      box-sizing: border-box !important;
      width: min(920px, calc(100% - 56px)) !important;
      height: calc(100dvh - 152px) !important;
      margin-bottom: calc(-100dvh + 152px) !important;
      pointer-events: none !important;
      z-index: -1 !important;
      background: rgba(10, 23, 36, 0.64) !important;
      background-image: linear-gradient(180deg, rgba(198, 229, 252, 0.075), rgba(3, 10, 17, 0.035)) !important;
      border: 1px solid rgba(202, 230, 251, 0.16) !important;
      border-radius: 24px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.16), inset 0 1px 0 rgba(255,255,255,0.055) !important;
      -webkit-backdrop-filter: blur(16px) saturate(120%) !important;
      backdrop-filter: blur(16px) saturate(120%) !important;
    }

    /* ChatGPT's native footer fade was an 80% solid-black strip in the
       snapshot. Keep the fade, but make it atmospheric instead of a black bar. */
    #thread-bottom-container::after {
      background: linear-gradient(180deg, rgba(5, 12, 20, 0), rgba(5, 12, 20, 0.46)) !important;
      opacity: 1 !important;
    }

    /* One sidebar frost layer only. The previous generic nav/aside selector
       blurred both the visible 260px nav and the invisible 52px tiny rail. */
    #stage-slideover-sidebar {
      color: var(--us-text-soft) !important;
      background: rgba(22, 38, 53, 0.46) !important;
      background-image: linear-gradient(180deg, rgba(190, 222, 247, 0.040), rgba(255,255,255,0.008)) !important;
      border-inline-end: 1px solid rgba(190, 224, 250, 0.13) !important;
      box-shadow: 10px 0 32px rgba(0,0,0,0.12), inset -1px 0 0 rgba(255,255,255,0.025) !important;
      -webkit-backdrop-filter: blur(14px) saturate(116%) !important;
      backdrop-filter: blur(14px) saturate(116%) !important;
    }

    #stage-slideover-sidebar nav,
    #stage-sidebar-tiny-bar {
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    #stage-slideover-sidebar [class*="bg-token-sidebar-surface-primary"] {
      background-color: transparent !important;
      background-image: none !important;
    }

    #stage-slideover-sidebar a {
      border-radius: var(--us-radius-sm) !important;
    }

    #stage-slideover-sidebar a:hover,
    #stage-slideover-sidebar button:hover,
    #stage-slideover-sidebar [aria-current="page"] {
      background: var(--us-hover) !important;
    }

    /* Preserve ChatGPT's native sticky header geometry. Only paint the small
       action capsule that otherwise reads as a near-black island. */
    #page-header {
      color: var(--us-text) !important;
      background: transparent !important;
      background-image: none !important;
      box-shadow: none !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    #conversation-header-actions {
      background: rgba(20, 34, 48, 0.62) !important;
      border: 1px solid rgba(192, 224, 249, 0.16) !important;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.035) !important;
      -webkit-backdrop-filter: blur(12px) saturate(118%) !important;
      backdrop-filter: blur(12px) saturate(118%) !important;
    }

    #conversation-header-actions button:hover {
      background: rgba(123, 194, 255, 0.11) !important;
    }

    [data-message-author-role="assistant"],
    .markdown,
    .prose {
      color: var(--us-text-soft) !important;
    }

    [data-message-author-role="user"] {
      color: var(--us-text) !important;
    }

    .markdown h1,
    .markdown h2,
    .markdown h3,
    .markdown h4,
    .markdown h5,
    .markdown h6,
    .prose h1,
    .prose h2,
    .prose h3,
    .prose h4,
    .prose h5,
    .prose h6,
    .markdown strong,
    .markdown b,
    .prose strong,
    .prose b {
      color: var(--us-text) !important;
    }

    .markdown h1,
    .markdown h2,
    .markdown h3,
    .prose h1,
    .prose h2,
    .prose h3 {
      letter-spacing: -0.018em !important;
    }

    .markdown a,
    .prose a {
      color: var(--us-accent) !important;
      text-decoration-color: rgba(155, 211, 255, 0.50) !important;
      text-underline-offset: 2px !important;
    }

    .markdown hr,
    .prose hr {
      border-color: var(--us-border) !important;
    }

    blockquote {
      color: var(--us-text-soft) !important;
      border-color: rgba(155, 211, 255, 0.32) !important;
      background: rgba(13, 27, 41, 0.42) !important;
      border-radius: 0 var(--us-radius-sm) var(--us-radius-sm) 0 !important;
    }

    .markdown pre,
    .prose pre,
    [data-testid="code-block"] {
      color: #e8eff5 !important;
      background: rgba(5, 11, 18, 0.84) !important;
      border: 1px solid rgba(184, 220, 249, 0.15) !important;
      border-radius: var(--us-radius-md) !important;
      box-shadow: var(--us-shadow-sm) !important;
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }

    .markdown :not(pre) > code,
    .prose :not(pre) > code {
      color: #edf4fa !important;
      background: rgba(255, 255, 255, 0.09) !important;
      border: 1px solid rgba(190, 225, 255, 0.10) !important;
      border-radius: 5px !important;
      padding: 0.08em 0.32em !important;
    }

    .markdown table,
    .prose table {
      border: 1px solid var(--us-border) !important;
      border-radius: var(--us-radius-md) !important;
      background: rgba(10, 22, 34, 0.52) !important;
    }

    .markdown th,
    .prose th {
      color: var(--us-text) !important;
      background: rgba(255, 255, 255, 0.055) !important;
      border-color: var(--us-border) !important;
    }

    .markdown td,
    .prose td {
      color: var(--us-text-soft) !important;
      border-color: var(--us-border) !important;
    }

    /* Snapshot-grounded composer shell. Style the real 768px native surface,
       not the inner ProseMirror scroller, and avoid broad :has() selectors. */
    form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
      color: var(--us-text) !important;
      background: rgba(15, 28, 40, 0.70) !important;
      background-image: linear-gradient(180deg, rgba(201, 229, 250, 0.045), rgba(255,255,255,0.010)) !important;
      border: 1px solid rgba(195, 227, 252, 0.19) !important;
      box-shadow: 0 14px 38px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.040) !important;
      -webkit-backdrop-filter: blur(14px) saturate(120%) !important;
      backdrop-filter: blur(14px) saturate(120%) !important;
    }

    #prompt-textarea,
    textarea,
    [contenteditable="true"] {
      color: var(--us-text) !important;
      caret-color: var(--us-accent) !important;
      background: transparent !important;
    }

    #prompt-textarea::placeholder,
    textarea::placeholder {
      color: var(--us-text-muted) !important;
    }

    button[aria-label*="Send" i],
    button[data-testid*="send" i] {
      color: #07111b !important;
      background: linear-gradient(180deg, #e1f3ff, #a7d5f6) !important;
      border-color: rgba(218, 240, 255, 0.86) !important;
    }

    button[aria-label*="Send" i]:hover,
    button[data-testid*="send" i]:hover {
      background: linear-gradient(180deg, #f0f9ff, #bce0f8) !important;
    }

    /* Menus should be clearly readable, but only transient surfaces pay a
       modest blur cost. */
    [role="menu"],
    [data-radix-popper-content-wrapper] > div,
    [data-headlessui-state] [role="menu"],
    [data-radix-popper-content-wrapper] [role="listbox"],
    [data-radix-popper-content-wrapper] [data-radix-menu-content],
    [data-radix-popper-content-wrapper] [data-radix-select-content],
    [role="listbox"] {
      color: var(--us-text-soft) !important;
      background: rgba(28, 44, 59, 0.76) !important;
      background-image: linear-gradient(180deg, rgba(176, 218, 249, 0.055), rgba(255,255,255,0.012)) !important;
      border: 1px solid rgba(196, 226, 250, 0.20) !important;
      box-shadow: 0 18px 44px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.045) !important;
      -webkit-backdrop-filter: blur(12px) saturate(120%) !important;
      backdrop-filter: blur(12px) saturate(120%) !important;
    }

    [role="dialog"],
    [data-testid*="modal" i] {
      color: var(--us-text-soft) !important;
      background: rgba(24, 38, 52, 0.90) !important;
      border: 1px solid rgba(196, 226, 250, 0.20) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,0.32) !important;
      -webkit-backdrop-filter: blur(8px) saturate(112%) !important;
      backdrop-filter: blur(8px) saturate(112%) !important;
    }

    [role="menuitem"] {
      border-radius: var(--us-radius-sm) !important;
    }

    [role="menuitem"]:hover,
    [role="option"]:hover,
    [data-highlighted] {
      background: var(--us-hover) !important;
    }

    html,
    body {
      cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2222%22%20height%3D%2222%22%20viewBox%3D%220%200%2022%2022%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%224%22%20y1%3D%223%22%20x2%3D%2217%22%20y2%3D%2218%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23FFFFFF%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23DCEFFF%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M3%202.6L20%2010.7L7.7%2020Z%22%20fill%3D%22%236FA8D0%22%20opacity%3D%22.14%22%20transform%3D%22translate%28.55%20.7%29%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M3%202.6L20%2010.7L7.7%2020ZM8.05%207.65L14.5%2010.72L9.75%2014.65Z%22%20fill%3D%22url%28%23g%29%22%2F%3E%3C%2Fsvg%3E") 3 3, default !important;
    }

    a,
    button,
    [role="button"],
    [role="menuitem"],
    [role="option"],
    summary,
    label[for] {
      cursor: url("data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2227%22%20height%3D%2227%22%20viewBox%3D%220%200%2027%2027%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%225%22%20y1%3D%224%22%20x2%3D%2221%22%20y2%3D%2222%22%20gradientUnits%3D%22userSpaceOnUse%22%3E%3Cstop%20offset%3D%220%22%20stop-color%3D%22%23FFFFFF%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23D6ECFF%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Cpath%20d%3D%22M3.6%203L24.2%2012.9L9.3%2024Z%22%20fill%3D%22%236FA8D0%22%20opacity%3D%22.17%22%20transform%3D%22translate%28.7%20.85%29%22%2F%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M3.6%203L24.2%2012.9L9.3%2024ZM9.7%209.1L17.4%2012.85L11.65%2017.6Z%22%20fill%3D%22url%28%23g%29%22%2F%3E%3C%2Fsvg%3E") 4 3, pointer !important;
    }

    input,
    textarea,
    [contenteditable="true"],
    .markdown,
    .prose {
      cursor: text !important;
    }

    button:disabled,
    [aria-disabled="true"] {
      cursor: not-allowed !important;
    }

    ::-webkit-scrollbar {
      width: 9px;
      height: 9px;
    }

    ::-webkit-scrollbar-track {
      background: transparent !important;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(205, 229, 247, 0.18) !important;
      border: 2px solid transparent !important;
      background-clip: padding-box !important;
      border-radius: 999px !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(205, 229, 247, 0.30) !important;
      background-clip: padding-box !important;
    }

    ::selection {
      color: var(--us-text) !important;
      background: rgba(142, 203, 255, 0.30) !important;
    }

    @media (max-width: 768px) {
      #thread::before {
        top: 52px !important;
        width: calc(100% - 18px) !important;
        height: calc(100dvh - 132px) !important;
        margin-bottom: calc(-100dvh + 132px) !important;
        border-radius: 16px !important;
        background: rgba(10, 23, 36, 0.70) !important;
        -webkit-backdrop-filter: blur(10px) saturate(112%) !important;
        backdrop-filter: blur(10px) saturate(112%) !important;
      }

      form[class*="group/composer"] [class*="bg-(--composer-surface-primary)"] {
        border-radius: 18px !important;
      }
    }

    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      :root {
        --us-wallpaper-transform: translate3d(0px, 0px, 0) scale(1.06);
      }
      html::before {
        transition: none !important;
      }
    }
  `);'''

text = text[:style_start] + new_style + text[style_end + len("\n  `);"):]

parallax_start = text.find("  const PARALLAX_X = 5;")
parallax_end_marker = "  initParallax();"
parallax_end = text.find(parallax_end_marker, parallax_start)
if parallax_start == -1 or parallax_end == -1:
    raise SystemExit("legacy parallax block not found")
parallax_end += len(parallax_end_marker)

new_parallax = r'''  /* v2.0.14: one JS update per pointer animation frame. CSS handles the
     easing on the compositor; there is no recursive RAF easing loop. */
  const PARALLAX_X_PX = 14;
  const PARALLAX_Y_PX = 9;
  let parallaxRaf = 0;
  let pendingShiftX = 0;
  let pendingShiftY = 0;
  let lastPointerX = -9999;
  let lastPointerY = -9999;

  function commitParallax() {
    parallaxRaf = 0;
    document.documentElement.style.setProperty(
      "--us-wallpaper-transform",
      `translate3d(${pendingShiftX.toFixed(2)}px, ${pendingShiftY.toFixed(2)}px, 0) scale(1.06)`
    );
  }

  function queueParallax() {
    if (!parallaxRaf) parallaxRaf = window.requestAnimationFrame(commitParallax);
  }

  function centerParallax() {
    pendingShiftX = 0;
    pendingShiftY = 0;
    queueParallax();
  }

  function initParallax() {
    const motionQuery = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    if (!motionQuery.matches) return;

    window.addEventListener("pointermove", (event) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      if (Math.abs(event.clientX - lastPointerX) < 2 && Math.abs(event.clientY - lastPointerY) < 2) return;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;

      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;
      pendingShiftX = -(nx * PARALLAX_X_PX);
      pendingShiftY = -(ny * PARALLAX_Y_PX);
      queueParallax();
    }, { passive: true });

    document.addEventListener("mouseleave", centerParallax, { passive: true });
    window.addEventListener("blur", centerParallax, { passive: true });
  }

  initParallax();'''

text = text[:parallax_start] + new_parallax + text[parallax_end:]

# Guardrails against the specific regressions found in the visual snapshot.
required = [
    "@version      2.0.14",
    "#thread::before",
    "position: sticky !important",
    "height: calc(100dvh - 152px) !important",
    "#stage-slideover-sidebar",
    "#conversation-header-actions",
    "#thread-bottom-container::after",
    "--composer-surface-primary",
    "form[class*=\"group/composer\"] [class*=\"bg-(--composer-surface-primary)\"]",
    "PARALLAX_X_PX = 14",
]
for needle in required:
    if needle not in text:
        raise SystemExit(f"missing expected v2.0.14 content: {needle}")

for forbidden in [
    "position: absolute !important;\n      top: 0 !important;\n      bottom: 0 !important;\n      left: 50% !important;\n      width: min(920px",
    "div:has(> textarea#prompt-textarea)",
    "PARALLAX_EASE",
    "nav,\n    aside,",
    "[class*=\"bg-token-main-surface-primary\"],",
]:
    if forbidden in text:
        raise SystemExit(f"legacy expensive/broad rule remains: {forbidden}")

TARGET.write_text(text, encoding="utf-8")
