from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "ChatGPT-US-Sign-Glass-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.0.2" not in text:
    raise SystemExit("expected canonical ChatGPT Glass Theme v2.0.2")

text = text.replace("@version      2.0.2", "@version      2.0.3", 1)
text = text.replace(
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized fixed-layer parallax, brighter smoky sidebar glass, a stronger frosted conversation rail, brighter menus, and a cutout geometric cursor.",
    "US Sign-inspired ChatGPT theme with rotating Bing UHD wallpaper, optimized parallax, truly translucent sidebar glass, a dedicated frosted center reading rail, brighter menus, and a cutout geometric cursor.",
    1,
)
text = text.replace("window.__chatgptUsSignGlassThemeV202", "window.__chatgptUsSignGlassThemeV203")

old_vars = '''      --sidebar-surface-primary: rgba(27, 43, 58, 0.46) !important;\n      --sidebar-surface-secondary: rgba(34, 51, 68, 0.42) !important;\n      --sidebar-surface-tertiary: rgba(42, 60, 78, 0.38) !important;'''
new_vars = '''      --sidebar-surface-primary: rgba(29, 45, 61, 0.18) !important;\n      --sidebar-surface-secondary: rgba(34, 52, 69, 0.14) !important;\n      --sidebar-surface-tertiary: rgba(42, 60, 78, 0.12) !important;'''
if old_vars not in text:
    raise SystemExit("sidebar variable anchor not found")
text = text.replace(old_vars, new_vars, 1)

old_rail = '''    /* v2.0.2: stronger single-layer conversation frost for readability.\n       Keep one blur layer only; nested messages/code remain paint-only. */\n    [data-testid="conversation-turn-list"] {\n      position: relative !important;\n      background: rgba(12, 25, 38, 0.32) !important;\n      background-image: linear-gradient(180deg, rgba(171, 215, 248, 0.035), rgba(255,255,255,0.010)) !important;\n      border-left: 1px solid rgba(196, 226, 251, 0.070) !important;\n      border-right: 1px solid rgba(196, 226, 251, 0.070) !important;\n      box-shadow: inset 0 1px 0 rgba(255,255,255,0.025), 0 0 48px rgba(0,0,0,0.08) !important;\n      -webkit-backdrop-filter: blur(16px) saturate(126%) !important;\n      backdrop-filter: blur(16px) saturate(126%) !important;\n    }'''
new_rail = '''    /* v2.0.3: ChatGPT changes the conversation list wrapper frequently.\n       Do not depend on it for the visual frost; the dedicated fixed reading\n       rail below owns the one center backdrop-filter layer. */\n    [data-testid="conversation-turn-list"] {\n      position: relative !important;\n      background: transparent !important;\n      background-image: none !important;\n      border-color: transparent !important;\n      box-shadow: none !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }\n\n    #us-chatgpt-center-glass {\n      position: fixed !important;\n      top: 48px !important;\n      bottom: 0 !important;\n      left: calc(var(--us-chat-sidebar-edge, 0px) + ((100vw - var(--us-chat-sidebar-edge, 0px)) / 2)) !important;\n      width: min(860px, calc(100vw - var(--us-chat-sidebar-edge, 0px) - 52px)) !important;\n      transform: translateX(-50%) !important;\n      pointer-events: none !important;\n      z-index: 1 !important;\n      background: rgba(10, 21, 32, 0.30) !important;\n      background-image: linear-gradient(180deg, rgba(183, 220, 249, 0.042), rgba(255,255,255,0.010)) !important;\n      border-left: 1px solid rgba(195, 225, 249, 0.075) !important;\n      border-right: 1px solid rgba(195, 225, 249, 0.075) !important;\n      box-shadow: 0 0 60px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.028) !important;\n      -webkit-backdrop-filter: blur(22px) saturate(124%) !important;\n      backdrop-filter: blur(22px) saturate(124%) !important;\n    }\n\n    body {\n      z-index: auto !important;\n    }\n\n    body > #__next,\n    body > #root {\n      position: relative !important;\n      z-index: 2 !important;\n    }'''
if old_rail not in text:
    raise SystemExit("conversation rail anchor not found")
text = text.replace(old_rail, new_rail, 1)

old_sidebar = '''    nav,\n    aside,\n    [data-testid="left-sidebar"],\n    [data-testid="sidebar"],\n    [data-testid="navigation-sidebar"] {\n      color: var(--us-text-soft) !important;\n      background: rgba(27, 43, 58, 0.42) !important;\n      background-image: linear-gradient(180deg, rgba(169, 214, 248, 0.040), rgba(255,255,255,0.010)) !important;\n      border-color: rgba(182, 219, 247, 0.13) !important;\n      box-shadow: 10px 0 32px rgba(0, 0, 0, 0.14), inset -1px 0 0 rgba(255,255,255,0.025) !important;\n      -webkit-backdrop-filter: blur(18px) saturate(126%) !important;\n      backdrop-filter: blur(18px) saturate(126%) !important;\n    }'''
new_sidebar = '''    nav,\n    aside,\n    [data-testid="left-sidebar"],\n    [data-testid="sidebar"],\n    [data-testid="navigation-sidebar"] {\n      color: var(--us-text-soft) !important;\n      background: rgba(25, 40, 55, 0.20) !important;\n      background-image: linear-gradient(180deg, rgba(175, 216, 247, 0.028), rgba(255,255,255,0.006)) !important;\n      border-color: rgba(182, 219, 247, 0.11) !important;\n      box-shadow: 10px 0 32px rgba(0, 0, 0, 0.11), inset -1px 0 0 rgba(255,255,255,0.022) !important;\n      -webkit-backdrop-filter: blur(18px) saturate(124%) !important;\n      backdrop-filter: blur(18px) saturate(124%) !important;\n    }\n\n    nav [class*="bg-token-sidebar-surface"],\n    aside [class*="bg-token-sidebar-surface"],\n    [data-testid="left-sidebar"] [class*="bg-token-sidebar-surface"],\n    [data-testid="sidebar"] [class*="bg-token-sidebar-surface"],\n    [data-testid="navigation-sidebar"] [class*="bg-token-sidebar-surface"] {\n      background-color: rgba(34, 52, 70, 0.075) !important;\n      background-image: none !important;\n      -webkit-backdrop-filter: none !important;\n      backdrop-filter: none !important;\n    }'''
if old_sidebar not in text:
    raise SystemExit("sidebar glass anchor not found")
text = text.replace(old_sidebar, new_sidebar, 1)

insert_anchor = '''  initWallpapers();\n\n  const PARALLAX_X = 5;'''
insert_block = '''  initWallpapers();\n\n  /* v2.0.3 dedicated center glass rail. Keeping this as a stable theme-owned\n     layer avoids relying on ChatGPT's frequently changing conversation wrappers. */\n  function mountCenterGlassRail() {\n    if (!document.body) return false;\n    let rail = document.getElementById("us-chatgpt-center-glass");\n    if (!rail) {\n      rail = document.createElement("div");\n      rail.id = "us-chatgpt-center-glass";\n      rail.setAttribute("aria-hidden", "true");\n      document.body.prepend(rail);\n    }\n\n    const updateSidebarEdge = () => {\n      const candidates = Array.from(document.querySelectorAll(\n        'aside, [data-testid="left-sidebar"], [data-testid="sidebar"], [data-testid="navigation-sidebar"], nav'\n      ));\n      const sidebar = candidates\n        .map((node) => ({ node, rect: node.getBoundingClientRect() }))\n        .filter(({ rect }) => rect.width >= 170 && rect.width <= 420 && rect.height >= window.innerHeight * 0.55 && rect.left <= 8)\n        .sort((a, b) => b.rect.height - a.rect.height)[0];\n      const edge = sidebar ? Math.max(0, Math.round(sidebar.rect.right)) : 0;\n      document.documentElement.style.setProperty("--us-chat-sidebar-edge", `${edge}px`);\n      return sidebar?.node || null;\n    };\n\n    const sidebarNode = updateSidebarEdge();\n    window.addEventListener("resize", updateSidebarEdge, { passive: true });\n    if (sidebarNode && typeof ResizeObserver === "function") {\n      const ro = new ResizeObserver(updateSidebarEdge);\n      ro.observe(sidebarNode);\n    }\n    return true;\n  }\n\n  if (!mountCenterGlassRail()) {\n    window.addEventListener("DOMContentLoaded", mountCenterGlassRail, { once: true });\n  }\n\n  const PARALLAX_X = 5;'''
if insert_anchor not in text:
    raise SystemExit("center rail JS anchor not found")
text = text.replace(insert_anchor, insert_block, 1)

TARGET.write_text(text, encoding="utf-8")
