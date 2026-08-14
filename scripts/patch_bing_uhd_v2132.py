from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "tampermonkey" / "US-Sign-Full-UI-Theme.user.js"
text = TARGET.read_text(encoding="utf-8")

if "@version      2.1.31" not in text:
    raise SystemExit("expected canonical Full UI Theme v2.1.31")

text = text.replace("@version      2.1.31", "@version      2.1.32", 1)
text = text.replace(
    "rotating curated Bing wallpapers every 30 minutes with subtle pointer parallax, unified Job Dashboard",
    "rotating curated Bing UHD wallpapers every 30 minutes with subtle pointer parallax, unified Job Dashboard",
    1,
)

old_cache = "const US_SIGN_BING_CACHE_KEY = 'us-sign-bing-wallpaper-pool-v1';"
new_cache = "const US_SIGN_BING_CACHE_KEY = 'us-sign-bing-wallpaper-pool-v2';"
if old_cache not in text:
    raise SystemExit("Bing cache key anchor not found")
text = text.replace(old_cache, new_cache, 1)

old_endpoint = "const endpoint = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=${encodeURIComponent(market)}`;"
new_endpoint = "const endpoint = `https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=8&mkt=${encodeURIComponent(market)}&uhd=1&uhdwidth=3840&uhdheight=2160`;"
if old_endpoint not in text:
    raise SystemExit("Bing endpoint anchor not found")
text = text.replace(old_endpoint, new_endpoint, 1)

if "--us-wallpaper-size: auto 110vh;" not in text:
    raise SystemExit("parallax CSS overscan anchor not found")
text = text.replace("--us-wallpaper-size: auto 110vh;", "--us-wallpaper-size: auto 106vh;", 1)

if "ratio >= (16 / 9) ? '110vw auto' : 'auto 110vh'" not in text:
    raise SystemExit("parallax runtime overscan anchor not found")
text = text.replace(
    "ratio >= (16 / 9) ? '110vw auto' : 'auto 110vh'",
    "ratio >= (16 / 9) ? '106vw auto' : 'auto 106vh'",
    1,
)

text = text.replace(
    "Slight overscan plus pointer-driven background position.",
    "Reduced overscan plus pointer-driven background position for sharper UHD rendering.",
    1,
)

TARGET.write_text(text, encoding="utf-8")
