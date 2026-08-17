from pathlib import Path

root = Path(__file__).resolve().parents[1]
p = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme.user.js'
s = p.read_text()

if '@version      2.1.38' not in s:
    raise SystemExit('expected v2.1.38')

s = s.replace('@version      2.1.38', '@version      2.1.39', 1)
s = s.replace(
    'Stable SquareCoil frosted-glass UI with native-structure Status and true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    'Stable SquareCoil frosted-glass UI with semantic project states, native-structure Status, true transparent Clock Out glass, aligned top chrome, source-targeted Dashboard/Design glass, rotating Bing UHD wallpapers, and a cutout geometric cursor.',
    1,
)

css_marker = '''\n  `);\n\n  // =========================================================\n  // v2.1.30 CURATED BING WALLPAPER ROTATION'''
css = r'''

    /* =========================================================
       v2.1.39 SEMANTIC PROJECT UX
       Snapshot-grounded state hierarchy. Color now communicates workflow
       meaning instead of making every glass control equally prominent.
    ========================================================= */
    html.us-sign-semantic-project-ux {
      --us-state-blue: #91ceff;
      --us-state-blue-bg: rgba(53, 139, 214, 0.17);
      --us-state-blue-border: rgba(115, 190, 248, 0.28);
      --us-state-teal: #93e0dc;
      --us-state-teal-bg: rgba(57, 157, 153, 0.16);
      --us-state-teal-border: rgba(126, 213, 207, 0.27);
      --us-state-green: #9bd7ad;
      --us-state-green-bg: rgba(70, 145, 93, 0.18);
      --us-state-green-border: rgba(135, 207, 157, 0.28);
      --us-state-amber: #f1cf83;
      --us-state-amber-bg: rgba(196, 139, 42, 0.18);
      --us-state-amber-border: rgba(235, 181, 88, 0.30);
      --us-state-red: #f0a0a0;
      --us-state-red-bg: rgba(177, 67, 67, 0.18);
      --us-state-red-border: rgba(231, 120, 120, 0.31);
      --us-state-purple: #cdb8ff;
      --us-state-purple-bg: rgba(119, 89, 180, 0.16);
      --us-state-purple-border: rgba(181, 157, 230, 0.27);
    }

    /* Summary cells gain a restrained semantic rail. */
    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell {
      position: relative !important;
      border-radius: 8px !important;
      transition: background-color 120ms ease, border-color 120ms ease !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state] {
      padding-left: 10px !important;
      border: 1px solid transparent !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-cell[data-us-state]::before {
      content: "" !important;
      position: absolute !important;
      left: 2px !important;
      top: 9px !important;
      bottom: 9px !important;
      width: 2px !important;
      border-radius: 999px !important;
      background: currentColor !important;
      opacity: 0.76 !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-value[data-us-state] {
      display: inline-flex !important;
      align-items: center !important;
      min-height: 24px !important;
      padding: 3px 9px !important;
      border: 1px solid !important;
      border-radius: 999px !important;
      font-weight: 650 !important;
      line-height: 1.25 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.035) !important;
    }

    html.us-sign-semantic-project-ux [data-us-state="pending"] {
      color: var(--us-state-blue) !important;
      border-color: var(--us-state-blue-border) !important;
      background-color: var(--us-state-blue-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="submitted"] {
      color: var(--us-state-teal) !important;
      border-color: var(--us-state-teal-border) !important;
      background-color: var(--us-state-teal-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="success"] {
      color: var(--us-state-green) !important;
      border-color: var(--us-state-green-border) !important;
      background-color: var(--us-state-green-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="urgent"],
    html.us-sign-semantic-project-ux [data-us-state="due-today"],
    html.us-sign-semantic-project-ux [data-us-state="due-soon"] {
      color: var(--us-state-amber) !important;
      border-color: var(--us-state-amber-border) !important;
      background-color: var(--us-state-amber-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="overdue"],
    html.us-sign-semantic-project-ux [data-us-state="danger"] {
      color: var(--us-state-red) !important;
      border-color: var(--us-state-red-border) !important;
      background-color: var(--us-state-red-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="hold"] {
      color: var(--us-state-purple) !important;
      border-color: var(--us-state-purple-border) !important;
      background-color: var(--us-state-purple-bg) !important;
    }
    html.us-sign-semantic-project-ux [data-us-state="unset"] {
      color: rgba(190, 203, 216, 0.72) !important;
      border-color: rgba(190, 203, 216, 0.12) !important;
      background-color: rgba(255, 255, 255, 0.028) !important;
    }

    /* Pending banners read as workflow state, not plain white decoration. */
    html.us-sign-semantic-project-ux .alert[data-us-state="pending"] {
      color: #d8edff !important;
      background:
        linear-gradient(90deg, rgba(48, 137, 213, 0.21), rgba(18, 60, 96, 0.10)) !important;
      border: 1px solid rgba(111, 188, 248, 0.22) !important;
      border-left: 3px solid rgba(115, 193, 255, 0.72) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.035) !important;
      font-weight: 650 !important;
    }

    /* Utility actions stay quiet; primary/destructive actions become obvious. */
    html.us-sign-semantic-project-ux [data-us-action="utility"] {
      color: rgba(221, 230, 239, 0.86) !important;
      background: rgba(7, 15, 25, 0.18) !important;
      border-color: rgba(226, 242, 255, 0.10) !important;
    }
    html.us-sign-semantic-project-ux [data-us-action="utility"]:hover,
    html.us-sign-semantic-project-ux [data-us-action="utility"]:focus-visible {
      color: #fff !important;
      background: rgba(87, 161, 220, 0.12) !important;
      border-color: rgba(142, 205, 252, 0.22) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="primary"] {
      color: #eaf7ff !important;
      background: linear-gradient(180deg, rgba(44, 137, 208, 0.27), rgba(25, 98, 157, 0.19)) !important;
      border-color: rgba(112, 191, 249, 0.31) !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.055), 0 5px 16px rgba(0,0,0,0.08) !important;
    }
    html.us-sign-semantic-project-ux [data-us-action="primary"]:hover,
    html.us-sign-semantic-project-ux [data-us-action="primary"]:focus-visible {
      background: linear-gradient(180deg, rgba(60, 155, 228, 0.36), rgba(30, 108, 171, 0.26)) !important;
      border-color: rgba(137, 207, 255, 0.42) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="clock-in"] {
      color: #eaffef !important;
      background: linear-gradient(180deg, rgba(69, 145, 91, 0.25), rgba(40, 104, 58, 0.17)) !important;
      border-color: rgba(132, 207, 153, 0.27) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="danger"] {
      color: #ffdcdc !important;
      background: rgba(151, 55, 55, 0.12) !important;
      border-color: rgba(220, 105, 105, 0.24) !important;
    }
    html.us-sign-semantic-project-ux [data-us-action="danger"]:hover,
    html.us-sign-semantic-project-ux [data-us-action="danger"]:focus-visible {
      color: #fff0f0 !important;
      background: rgba(181, 61, 61, 0.24) !important;
      border-color: rgba(239, 127, 127, 0.40) !important;
    }

    html.us-sign-semantic-project-ux [data-us-action="warning"] {
      color: #f4e5bd !important;
      background: rgba(176, 130, 49, 0.16) !important;
      border-color: rgba(223, 177, 91, 0.27) !important;
    }

    /* The sidebar numbers are queue counts, not errors. Reserve red for danger. */
    html.us-sign-semantic-project-ux #badge-task-count,
    html.us-sign-semantic-project-ux #badge-design-count,
    html.us-sign-semantic-project-ux #badge-estimate-count {
      min-width: 20px !important;
      padding: 2px 6px !important;
      color: #d9eeff !important;
      background: rgba(54, 137, 205, 0.32) !important;
      border: 1px solid rgba(119, 190, 246, 0.22) !important;
      border-radius: 999px !important;
      box-shadow: none !important;
    }
    html.us-sign-semantic-project-ux #badge-task-count[data-us-zero="true"],
    html.us-sign-semantic-project-ux #badge-design-count[data-us-zero="true"],
    html.us-sign-semantic-project-ux #badge-estimate-count[data-us-zero="true"] {
      color: rgba(185, 200, 214, 0.70) !important;
      background: rgba(255,255,255,0.035) !important;
      border-color: rgba(210, 230, 246, 0.10) !important;
    }

    /* Small action controls were 29-30px in the audit. Give frequent actions a
       consistent 32px floor without enlarging the dense project rail links. */
    html.us-sign-semantic-project-ux #us-sign-design-actionbar :is(a, button, .btn),
    html.us-sign-semantic-project-ux #us-sign-job-copy-tools :is(a, button, .btn),
    html.us-sign-semantic-project-ux #us-sign-native-action-group :is(a, button, .btn),
    html.us-sign-semantic-project-ux #time-clock-clock-in-to-project-from-project,
    html.us-sign-semantic-project-ux #duplicate {
      min-height: 32px !important;
    }

    html.us-sign-semantic-project-ux #us-sign-design-summary .us-sign-djt-summary-label {
      color: rgba(174, 192, 208, 0.76) !important;
      font-weight: 600 !important;
    }
'''
if css_marker not in s:
    raise SystemExit('CSS marker not found')
s = s.replace(css_marker, css + css_marker, 1)

js_marker = '''\n\n  // v2.1.14: URL-scoped Project Search marker. No observer or polling.'''
js = r'''

  // =========================================================
  // v2.1.39 SEMANTIC PROJECT UX TAGGING
  // Bounded DOM-ready passes only. No MutationObserver and no recurring timer.
  // =========================================================
  function usSignSemanticStateFromText(text) {
    const value = String(text || '').trim().toLowerCase();
    if (!value) return '';
    if (/overdue|failed|rejected|cancel(?:led|ed)|blocked|critical/.test(value)) return 'danger';
    if (/urgent|high priority|rush/.test(value)) return 'urgent';
    if (/approved|complete(?:d)?|ready|released|installed/.test(value)) return 'success';
    if (/submitted|sent/.test(value)) return 'submitted';
    if (/on hold|hold|paused/.test(value)) return 'hold';
    if (/pending|in progress|review|open|awaiting|estimating/.test(value)) return 'pending';
    if (/not set|none|n\/a|tbd/.test(value)) return 'unset';
    return '';
  }

  function usSignParseShortDate(text) {
    const match = String(text || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) return null;
    const month = Number(match[1]);
    const day = Number(match[2]);
    const year = Number(match[3]);
    const date = new Date(year, month - 1, day, 12, 0, 0, 0);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function usSignDueState(text) {
    const due = usSignParseShortDate(text);
    if (!due) return '';
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
    const days = Math.round((due.getTime() - today.getTime()) / 86400000);
    if (days < 0) return 'overdue';
    if (days === 0) return 'due-today';
    if (days <= 3) return 'due-soon';
    return '';
  }

  function usSignApplyProjectSemanticUX() {
    const summary = document.querySelector('#us-sign-design-summary');
    const actionbar = document.querySelector('#us-sign-design-actionbar');
    if (!summary || !actionbar) return;

    document.documentElement.classList.add('us-sign-semantic-project-ux');

    summary.querySelectorAll('.us-sign-djt-summary-cell').forEach((cell) => {
      const label = (cell.querySelector('.us-sign-djt-summary-label')?.textContent || '').trim().toLowerCase();
      const valueEl = cell.querySelector('.us-sign-djt-summary-value');
      if (!valueEl) return;
      const value = (valueEl.textContent || '').trim();
      let state = '';

      if (label === 'due date') state = usSignDueState(value);
      else if (label === 'priority' || label === 'status' || label === 'hours') state = usSignSemanticStateFromText(value);

      cell.removeAttribute('data-us-state');
      valueEl.removeAttribute('data-us-state');
      if (state) {
        cell.dataset.usState = state;
        valueEl.dataset.usState = state;
      }
    });

    document.querySelectorAll('.alert').forEach((alert) => {
      const text = (alert.textContent || '').replace(/\s+/g, ' ').trim();
      alert.removeAttribute('data-us-state');
      if (/^pending\b/i.test(text)) alert.dataset.usState = 'pending';
      else {
        const state = usSignSemanticStateFromText(text);
        if (state) alert.dataset.usState = state;
      }
    });

    const tagAction = (el, action) => {
      if (el) el.dataset.usAction = action;
    };

    actionbar.querySelectorAll('a, button, .btn').forEach((el) => {
      const text = (el.textContent || el.value || '').replace(/\s+/g, ' ').trim().toLowerCase();
      if (!text) return;
      if (/delete|remove/.test(text)) tagAction(el, 'danger');
      else if (/^new$|^\+$|create|add/.test(text)) tagAction(el, 'primary');
      else tagAction(el, 'utility');
    });

    document.querySelectorAll('#us-sign-job-copy-tools button, #us-sign-job-copy-tools a').forEach((el) => tagAction(el, 'utility'));
    document.querySelectorAll('#us-sign-native-action-group a, #us-sign-native-action-group button').forEach((el) => {
      const text = (el.textContent || '').trim().toLowerCase();
      tagAction(el, /delete|remove/.test(text) ? 'danger' : 'utility');
    });

    tagAction(document.querySelector('#delete-design'), 'danger');
    tagAction(document.querySelector('#time-clock-clock-in-to-project-from-project'), 'clock-in');
    tagAction(document.querySelector('#clockout'), 'warning');
    tagAction(document.querySelector('#duplicate'), 'utility');

    document.querySelectorAll('#badge-task-count, #badge-design-count, #badge-estimate-count').forEach((badge) => {
      const count = Number.parseInt((badge.textContent || '').trim(), 10);
      badge.dataset.usZero = Number.isFinite(count) && count === 0 ? 'true' : 'false';
    });
  }

  function usSignScheduleProjectSemanticUX() {
    [0, 120, 350, 800, 1600, 2800].forEach((delay) => window.setTimeout(usSignApplyProjectSemanticUX, delay));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', usSignScheduleProjectSemanticUX, { once: true });
  } else {
    usSignScheduleProjectSemanticUX();
  }
  window.addEventListener('pageshow', usSignScheduleProjectSemanticUX);
'''
if js_marker not in s:
    raise SystemExit('JS marker not found')
s = s.replace(js_marker, js + js_marker, 1)

p.write_text(s)
installer = root / 'tampermonkey' / 'US-Sign-Full-UI-Theme-v2.1.39.user.js'
installer.write_text(s)
