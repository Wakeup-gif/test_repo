# trigger: v2.1.31 Bing parallax release
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.1.30" not in text:
    raise SystemExit("expected canonical Full UI Theme v2.1.30")

text = text.replace("@version      2.1.30", "@version      2.1.31", 1)
text = text.replace(
    "rotating curated Bing wallpapers every 30 minutes, unified Job Dashboard",
    "rotating curated Bing wallpapers every 30 minutes with subtle pointer parallax, unified Job Dashboard",
    1,
)

css_anchor = '''  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
if css_anchor not in text:
    raise SystemExit("Bing CSS/JS boundary anchor not found")

css = r'''

    /* =========================================================
       v2.1.31 BING WALLPAPER PARALLAX
       Slight overscan plus pointer-driven background position. The runtime
       updates only CSS variables; touch and reduced-motion stay centered.
    ========================================================= */
    :root {
      --us-wallpaper-x: 50%;
      --us-wallpaper-y: 50%;
      --us-wallpaper-size: auto 110vh;
    }

    html,
    html body #main,
    html body #content_wrapper {
      background-position: var(--us-wallpaper-x) var(--us-wallpaper-y) !important;
      background-size: var(--us-wallpaper-size) !important;
    }

    @media (pointer: coarse), (prefers-reduced-motion: reduce) {
      :root {
        --us-wallpaper-x: 50%;
        --us-wallpaper-y: 50%;
      }
    }
'''

text = text.replace(css_anchor, css + "\n" + css_anchor, 1)

js_anchor = '''  usSignInitBingWallpapers();\n'''
if js_anchor not in text:
    raise SystemExit("Bing init anchor not found")

js = r'''

  // =========================================================
  // v2.1.31 SUBTLE POINTER PARALLAX
  // One passive pointer listener. RAF runs only while easing toward a target,
  // then stops. No permanent animation loop or DOM overlay.
  // =========================================================
  const US_SIGN_PARALLAX_X = 6;
  const US_SIGN_PARALLAX_Y = 4;
  const US_SIGN_PARALLAX_EASE = 0.14;
  let usSignParallaxTargetX = 50;
  let usSignParallaxTargetY = 50;
  let usSignParallaxCurrentX = 50;
  let usSignParallaxCurrentY = 50;
  let usSignParallaxRaf = 0;

  function usSignUpdateWallpaperOverscan() {
    if (!document.documentElement) return;
    const ratio = Math.max(1, window.innerWidth) / Math.max(1, window.innerHeight);
    document.documentElement.style.setProperty(
      '--us-wallpaper-size',
      ratio >= (16 / 9) ? '110vw auto' : 'auto 110vh'
    );
  }

  function usSignRenderParallax() {
    usSignParallaxRaf = 0;
    const dx = usSignParallaxTargetX - usSignParallaxCurrentX;
    const dy = usSignParallaxTargetY - usSignParallaxCurrentY;

    usSignParallaxCurrentX += dx * US_SIGN_PARALLAX_EASE;
    usSignParallaxCurrentY += dy * US_SIGN_PARALLAX_EASE;

    document.documentElement.style.setProperty('--us-wallpaper-x', `${usSignParallaxCurrentX.toFixed(3)}%`);
    document.documentElement.style.setProperty('--us-wallpaper-y', `${usSignParallaxCurrentY.toFixed(3)}%`);

    if (Math.abs(dx) > 0.025 || Math.abs(dy) > 0.025) {
      usSignParallaxRaf = window.requestAnimationFrame(usSignRenderParallax);
    }
  }

  function usSignRequestParallaxFrame() {
    if (!usSignParallaxRaf) {
      usSignParallaxRaf = window.requestAnimationFrame(usSignRenderParallax);
    }
  }

  function usSignCenterParallax() {
    usSignParallaxTargetX = 50;
    usSignParallaxTargetY = 50;
    usSignRequestParallaxFrame();
  }

  function usSignInitWallpaperParallax() {
    const motionQuery = window.matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)');
    usSignUpdateWallpaperOverscan();

    window.addEventListener('resize', usSignUpdateWallpaperOverscan, { passive: true });

    if (!motionQuery.matches) return;

    window.addEventListener('pointermove', (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;
      const nx = (event.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
      const ny = (event.clientY / Math.max(1, window.innerHeight)) * 2 - 1;

      // Positive background-position moves an oversized image opposite the pointer,
      // giving the glass a restrained depth/parallax effect.
      usSignParallaxTargetX = 50 + (nx * US_SIGN_PARALLAX_X);
      usSignParallaxTargetY = 50 + (ny * US_SIGN_PARALLAX_Y);
      usSignRequestParallaxFrame();
    }, { passive: true });

    document.addEventListener('mouseleave', usSignCenterParallax, { passive: true });
    window.addEventListener('blur', usSignCenterParallax, { passive: true });
  }

  usSignInitWallpaperParallax();
'''

text = text.replace(js_anchor, js_anchor + js, 1)
TARGET.write_text(text, encoding="utf-8")
