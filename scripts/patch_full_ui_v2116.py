from pathlib import Path

p = Path('tampermonkey/US-Sign-Full-UI-Theme.user.js')
s = p.read_text(encoding='utf-8')

if '// @version      2.1.16' in s:
    raise SystemExit(0)
if '// @version      2.1.15' not in s:
    raise SystemExit('Expected Full UI Theme v2.1.15')

s = s.replace('// @version      2.1.15', '// @version      2.1.16', 1)
s = s.replace('Stable SquareCoil layout with Roxborough display typography, blue glass chrome, frosted Project Search panels, and corrected Task-page text contrast.', 'Stable SquareCoil layout with Roxborough display typography, blue glass chrome, frosted Project Search panels, corrected Task-page text contrast, and blurred Job Dashboard glass.', 1)

css = r'''

    /* v2.1.16 JOB DASHBOARD GLASS BLUR */
    html.us-sign-job-dashboard #customer-name,
    html.us-sign-job-dashboard #customer-info,
    html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) {
      background: linear-gradient(145deg, rgba(115,188,244,.040), transparent 34%), linear-gradient(180deg, rgba(7,16,28,.17), rgba(4,10,18,.11)) !important;
      background-color: rgba(7,15,26,.13) !important;
      border-color: rgba(216,238,255,.105) !important;
      box-shadow: 0 12px 30px rgba(0,0,0,.085), inset 0 1px 0 rgba(255,255,255,.042) !important;
      -webkit-backdrop-filter: blur(8px) saturate(120%) !important;
      backdrop-filter: blur(8px) saturate(120%) !important;
    }

    html.us-sign-job-dashboard #customer-info :is(.panel-heading,.panel-body,button,a.btn),
    html.us-sign-job-dashboard #content .tray-center > .pl15.pr15 > .well:has(.important-notes) :is(.panel,.panel-heading,.panel-body,input,textarea,button,a.btn) {
      -webkit-backdrop-filter: none !important;
      backdrop-filter: none !important;
    }
'''

marker = '\n    @media print {'
pos = s.rfind(marker)
if pos < 0:
    raise SystemExit('Print marker missing')
s = s[:pos] + css + s[pos:]

js = r'''

  function usSignMarkJobDashboard() {
    const hasCustomer = !!document.querySelector('#customer-info');
    const hasImportantNotes = !!document.querySelector('.important-notes');
    const isScope = !!document.querySelector('#ps-select, .us-sign-scope-enhanced');
    const isDesign = !!document.querySelector('#us-sign-design-actionbar, #us-sign-design-bottom-grid');
    if (hasCustomer && hasImportantNotes && !isScope && !isDesign) document.documentElement.classList.add('us-sign-job-dashboard');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', usSignMarkJobDashboard, { once: true });
  else usSignMarkJobDashboard();
  window.addEventListener('pageshow', usSignMarkJobDashboard);
'''

end = '\n})();'
pos = s.rfind(end)
if pos < 0:
    raise SystemExit('Script end missing')
s = s[:pos] + js + s[pos:]
p.write_text(s, encoding='utf-8')
