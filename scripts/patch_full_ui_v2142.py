from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
s = p.read_text()

if '@version      2.1.41' not in s:
    raise SystemExit('Expected Full UI v2.1.41')

s = s.replace('@version      2.1.41', '@version      2.1.42', 1)
s = s.replace(
    'Stable SquareCoil frosted-glass UI with softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with refined sidebar transparency/alignment, softer semantic project states, red Urgent priority, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

needle = '\n  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'
if needle not in s:
    raise SystemExit('Could not find final style close')

css = r'''

    /* =========================================================
       v2.1.42 LEFT SIDEBAR GLASS + ALIGNMENT POLISH
       Main navigation only. Keep Menu Cleanup responsible for what is shown;
       this block owns paint/alignment and collapsed separator containment.
    ========================================================= */

    html body #sidebar_left {
      background:
        radial-gradient(circle at 7% 8%, rgba(76, 165, 230, 0.105), transparent 36%),
        linear-gradient(180deg,
          rgba(7, 25, 41, 0.54) 0%,
          rgba(5, 18, 31, 0.48) 48%,
          rgba(3, 13, 23, 0.52) 100%) !important;
      background-color: rgba(5, 18, 30, 0.50) !important;
      border-right-color: rgba(156, 208, 250, 0.085) !important;
      box-shadow:
        8px 0 26px rgba(0, 0, 0, 0.075),
        inset -1px 0 0 rgba(255, 255, 255, 0.020),
        inset 0 1px 0 rgba(125, 192, 244, 0.020) !important;
      -webkit-backdrop-filter: blur(13px) saturate(130%) !important;
      backdrop-filter: blur(13px) saturate(130%) !important;
    }

    /* Give every top-level nav item one predictable icon/text/badge rhythm. */
    html body #sidebar_left .sidebar-menu > li > a,
    html body #sidebar_left .nav.sidebar-menu > li > a {
      display: grid !important;
      grid-template-columns: 22px minmax(0, 1fr) auto !important;
      align-items: center !important;
      column-gap: 10px !important;
      min-width: 0 !important;
      padding-left: 14px !important;
      padding-right: 12px !important;
      line-height: 1.25 !important;
    }

    html body #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    html body #sidebar_left .sidebar-menu > li > a > span:first-child:not(.sidebar-title):not(.label):not(.badge) {
      grid-column: 1 !important;
      justify-self: center !important;
      align-self: center !important;
      width: 22px !important;
      min-width: 22px !important;
      margin: 0 !important;
      padding: 0 !important;
      text-align: center !important;
      vertical-align: middle !important;
    }

    html body #sidebar_left .sidebar-menu > li > a > .sidebar-title {
      grid-column: 2 !important;
      min-width: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: 1.25 !important;
    }

    html body #sidebar_left .sidebar-menu > li > a > :is(.label, .badge),
    html body #sidebar_left .sidebar-menu > li > a > .sidebar-title + :is(.label, .badge) {
      grid-column: 3 !important;
      justify-self: end !important;
      align-self: center !important;
      margin: 0 !important;
    }

    /* Section separators must always size from the live sidebar width. Native
       fixed-width HR/divider rules were visibly protruding after collapse. */
    html body #sidebar_left hr,
    html body #sidebar_left .sidebar-menu > hr,
    html body #sidebar_left .sidebar-menu > li.divider,
    html body #sidebar_left .sidebar-menu > li.sidebar-divider,
    html body #sidebar_left .sidebar-menu > li.nav-divider {
      box-sizing: border-box !important;
      width: auto !important;
      max-width: none !important;
      height: 1px !important;
      margin-left: 18px !important;
      margin-right: 18px !important;
      padding: 0 !important;
      overflow: hidden !important;
      background: rgba(214, 233, 248, 0.095) !important;
      border: 0 !important;
      border-top: 0 !important;
      box-shadow: none !important;
    }

    /* Common AdminDesigns collapsed states. Keep icon and separators centered
       without forcing any title visibility that SquareCoil already manages. */
    body.sb-l-m #sidebar_left .sidebar-menu > li > a,
    body.sidebar-collapsed #sidebar_left .sidebar-menu > li > a,
    body.sidebar-mini #sidebar_left .sidebar-menu > li > a,
    html.sb-l-m body #sidebar_left .sidebar-menu > li > a {
      grid-template-columns: minmax(0, 1fr) !important;
      column-gap: 0 !important;
      padding-left: 0 !important;
      padding-right: 0 !important;
      justify-items: center !important;
    }

    body.sb-l-m #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    body.sidebar-collapsed #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    body.sidebar-mini #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ),
    html.sb-l-m body #sidebar_left .sidebar-menu > li > a > :is(
      .fa,
      .glyphicon,
      .glyphicons,
      .imoon,
      [class^="icon-"],
      [class*=" icon-"]
    ) {
      grid-column: 1 !important;
      width: 24px !important;
      min-width: 24px !important;
      margin: 0 !important;
      justify-self: center !important;
    }

    body.sb-l-m #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider),
    body.sidebar-collapsed #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider),
    body.sidebar-mini #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider),
    html.sb-l-m body #sidebar_left :is(hr, .sidebar-divider, .nav-divider, li.divider) {
      width: auto !important;
      max-width: none !important;
      margin-left: 9px !important;
      margin-right: 9px !important;
    }
'''

s = s.replace(needle, css + needle, 1)
s = s.rstrip() + '\n'
p.write_text(s)

installer = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme-v2.1.42.user.js'
installer.write_text(s)
