from pathlib import Path
import re
p=Path(__file__).resolve().parents[1]/'tampermonkey/US-Sign-Project-Scope-Workspace.user.js'
s=p.read_text()
if '@version      1.2.1' not in s: raise SystemExit('expected v1.2.1')
s=s.replace('@version      1.2.1','@version      1.2.2',1)
s=s.replace('Preserves the working Scope layout while explicitly leaving Project Status/Milestones on its native three-column structure.','Preserves native Status and repairs the live Scope editor around its actual SquareCoil DOM with compact controls and true glass.',1)
css=r'''

    /* v1.2.2 LIVE SCOPE PANEL REPAIR */
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced){display:grid!important;grid-template-columns:minmax(0,1fr) minmax(360px,560px)!important;grid-template-areas:"title controls" "form form"!important;gap:10px 12px!important;align-items:center!important;padding:12px!important;background:linear-gradient(145deg,rgba(118,188,244,.05),transparent 34%),linear-gradient(180deg,rgba(8,18,30,.25),rgba(4,11,20,.18))!important;background-color:rgba(7,16,27,.22)!important;border:1px solid var(--us-ws-line)!important;border-radius:var(--us-ws-radius)!important;box-shadow:var(--us-ws-shadow)!important}
    @supports ((-webkit-backdrop-filter:blur(1px)) or (backdrop-filter:blur(1px))){html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced){-webkit-backdrop-filter:blur(12px) saturate(128%)!important;backdrop-filter:blur(12px) saturate(128%)!important}html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) :is(.row,[class*="col-"],.btn-group,button,input,select,.cke,.cke_chrome,.cke_inner,.cke_top,.cke_contents,.cke_bottom){-webkit-backdrop-filter:none!important;backdrop-filter:none!important}}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>strong:first-of-type{grid-area:title!important;display:block!important;margin:0!important;color:var(--us-ws-text)!important;font-size:14px!important;font-weight:650!important;line-height:1.25!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>strong:first-of-type+br{display:none!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child{grid-area:controls!important;display:block!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8,html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8>.col-md-10{position:static!important;float:none!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8>.col-md-10>.row{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:7px!important;align-items:center!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child>.col-md-8>.col-md-10>.row>[class*="col-"]{position:static!important;float:none!important;width:auto!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) :is(.btn-group,button.multiselect){width:100%!important;margin:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) button.multiselect{display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:34px!important;padding:7px 10px!important;color:var(--us-ws-soft)!important;background:rgba(5,13,23,.32)!important;border:1px solid var(--us-ws-line-strong)!important;border-radius:var(--us-ws-radius-sm)!important;font-size:11px!important;text-align:left!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) #insert-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;min-width:74px!important;min-height:34px!important;margin:0!important;padding:7px 12px!important;font-size:11px!important;font-weight:600!important;white-space:nowrap!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>.row:first-child .multiselect-container.dropdown-menu{position:absolute!important;z-index:2147483000!important;top:calc(100% + 5px)!important;right:0!important;left:auto!important;width:min(560px,calc(100vw - 40px))!important;max-height:min(54vh,420px)!important;overflow:auto!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form{grid-area:form!important;display:flex!important;flex-direction:column!important;gap:8px!important;width:100%!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>br{display:none!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) :is(.cke,.cke_chrome,.cke_inner){width:100%!important;margin:0!important;background:linear-gradient(180deg,rgba(10,22,35,.40),rgba(4,10,18,.32))!important;border:1px solid var(--us-ws-line)!important;border-radius:10px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;overflow:hidden!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_top{min-height:38px!important;padding:5px 7px!important;background:linear-gradient(180deg,rgba(255,255,255,.038),rgba(92,170,232,.016))!important;border:0!important;border-bottom:1px solid var(--us-ws-line)!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_contents{height:clamp(220px,26vh,300px)!important;min-height:220px!important;max-height:300px!important;background:rgba(4,10,18,.32)!important;border:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced) .cke_bottom{display:none!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type{display:grid!important;grid-template-columns:auto minmax(0,1fr) auto!important;gap:10px!important;align-items:center!important;width:100%!important;margin:0!important;padding:8px 0 0!important;border-top:1px solid var(--us-ws-line)!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type>.col-md-4{position:static!important;float:none!important;width:auto!important;margin:0!important;padding:0!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type>.col-md-4:nth-child(2){justify-self:center!important;color:var(--us-ws-muted)!important;font-size:10.5px!important;text-align:center!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type>.col-md-4:last-child{justify-self:end!important}
    html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced)>form>.row:last-of-type :is(.btn,input.btn,a.btn){min-height:30px!important;height:auto!important;margin:0!important;padding:5px 9px!important;font-size:10.5px!important;line-height:18px!important}
    @media(max-width:820px){html body:has(#pmlt) .well:has(#ps-select):not(.us-sign-scope-enhanced){grid-template-columns:minmax(0,1fr)!important;grid-template-areas:"title" "controls" "form"!important}}
'''
if 'v1.2.2 LIVE SCOPE PANEL REPAIR' in s: raise SystemExit('already patched')
m=re.search(r'\n  `\);',s)
if not m: raise SystemExit('style end not found')
s=s[:m.start()]+css+s[m.start():]
p.write_text(s)
