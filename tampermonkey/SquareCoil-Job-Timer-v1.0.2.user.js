// ==UserScript==
// @name         SquareCoil Job Timer Manager
// @namespace    us-sign-squarecoil-tools
// @version      1.0.2
// @description  Job Timer with docked top tabs, per-job time colors, compact collapse, and the v1.0.1 shared archive.
// @match        https://ussignandmill.squarecoil.net/*
// @run-at       document-end
// @grant        none
// @noframes
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/82cc8d7c86bfe8d0175f21f1427e878185c140ca/tampermonkey/SquareCoil-Job-Timer-v1.0.0.user.js
// @require      https://raw.githubusercontent.com/Wakeup-gif/test_repo/13914a24592e255739fa1d67bae5cdc6d6cb8a89/tampermonkey/SquareCoil-Job-Timer-v1.0.1.user.js
// @updateURL    https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// @downloadURL  https://raw.githubusercontent.com/Wakeup-gif/test_repo/main/tampermonkey/SquareCoil-Job-Timer.user.js
// ==/UserScript==

(() => {
  'use strict';
  const V='1.0.2', ROOT='ussign-job-timer', KEY='ussign-squarecoil-job-timer-v1';
  let raf=0, mo=null, ticker=0;
  window.__squareCoilJobTimerUiVersion=V;

  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const elapsed=(s,k,n=Date.now())=>{const c=s?.contexts?.[k];if(!c)return 0;let ms=Math.max(0,+c.accumulatedMs||0);if(s?.active?.key===k)ms+=Math.max(0,n-(+s.active.startedAt||n));return ms};
  const clock=ms=>{const t=Math.max(0,Math.floor((+ms||0)/1000)),h=Math.floor(t/3600),m=Math.floor(t%3600/60),x=t%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(x).padStart(2,'0')}`};
  const level=(s,ms)=>{const m=ms/60000,y=Math.max(1,+s?.settings?.yellow||60),o=Math.max(y,+s?.settings?.orange||120),r=Math.max(o,+s?.settings?.red||240);return m>=r?3:m>=o?2:m>=y?1:0};
  const displayKey=s=>{const k=s?.ui?.selectedKey;if(k&&s?.contexts?.[k]&&!s?.ui?.hiddenKeys?.includes?.(k))return k;return s?.active?.key||s?.pending?.key||null};

  function refineTabs(root,s){
    const shell=root.querySelector('.jt-shell'),bar=root.querySelector('.jt-tabs');
    if(!shell||!bar)return;
    if(bar.parentElement!==shell||shell.firstElementChild!==bar)shell.insertBefore(bar,shell.firstChild);
    const now=Date.now();
    bar.querySelectorAll('.jt-tab[data-key]').forEach(tab=>{
      const k=tab.dataset.key;if(!s?.contexts?.[k])return;
      const ms=elapsed(s,k,now),lvl=level(s,ms);
      tab.classList.remove('jt-tab-level-0','jt-tab-level-1','jt-tab-level-2','jt-tab-level-3');
      tab.classList.add(`jt-tab-level-${lvl}`);
      if(!tab.querySelector(':scope>.jt-tab-dot')){const d=document.createElement('i');d.className='jt-tab-dot';tab.insertBefore(d,tab.firstChild)}
      let t=tab.querySelector(':scope>.jt-tab-time');
      if(!t){t=document.createElement('b');t.className='jt-tab-time';tab.insertBefore(t,tab.querySelector(':scope>.jt-x')||null)}
      const text=clock(ms);if(t.textContent!==text)t.textContent=text;
    });
  }

  function refineHeader(root,s){
    const h=root.querySelector('.jt-shell>header'),box=h?.querySelector(':scope>div');if(!box)return;
    const k=displayKey(s),c=k?s?.contexts?.[k]:null,ms=k?elapsed(s,k):0;
    const label=c?(c.type==='job'?c.projectId:(c.shortLabel||c.label||'General')):'No active job';
    if(!box.classList.contains('jt-head-v102')){box.className='jt-head-v102';box.innerHTML='<span class="jt-brand"><i>◴</i><span>Job Timer</span></span><span class="jt-head-context"></span><b data-role="compact-time"></b>'}
    const ctx=box.querySelector('.jt-head-context'),time=box.querySelector('[data-role="compact-time"]');
    if(ctx&&ctx.textContent!==String(label))ctx.textContent=label;
    const text=clock(ms);if(time&&time.textContent!==text)time.textContent=text;
  }

  function refine(){const root=document.getElementById(ROOT);if(!root)return;const s=load();if(!s)return;root.dataset.uiVersion=V;refineTabs(root,s);refineHeader(root,s)}
  const schedule=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(refine)};
  function watch(){const root=document.getElementById(ROOT);if(!root)return false;mo?.disconnect();mo=new MutationObserver(schedule);mo.observe(root,{subtree:true,childList:true});schedule();if(!ticker)ticker=setInterval(refine,1000);return true}

  if(!document.getElementById('ussign-job-timer-ui-v102')){
    const css=document.createElement('style');css.id='ussign-job-timer-ui-v102';css.textContent=`
#${ROOT}{width:min(500px,calc(100vw - 24px));padding-top:39px}
#${ROOT} .jt-shell{position:relative;overflow:visible!important;border-radius:16px}
#${ROOT} section{padding:11px 10px}
#${ROOT} .jt-tabs{position:absolute!important;left:16px;right:16px;top:-39px;z-index:8;display:flex!important;align-items:flex-end;gap:3px;height:40px;overflow-x:auto!important;overflow-y:hidden;margin:0!important;padding:3px 2px 0!important;scrollbar-width:none}
#${ROOT} .jt-tabs::-webkit-scrollbar{display:none}
#${ROOT} .jt-tab{--tc:123,170,242;position:relative;flex:0 0 auto;min-width:92px;max-width:182px;height:37px!important;display:flex;align-items:center;gap:7px;margin:0!important;padding:7px 8px 7px 11px!important;border:1px solid rgba(var(--tc),.25)!important;border-bottom-color:rgba(255,255,255,.07)!important;border-radius:13px 13px 0 0!important;background:linear-gradient(180deg,rgba(var(--tc),.11),rgba(var(--tc),.025)),rgba(8,9,12,.88)!important;color:rgba(var(--tc),.94)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)!important;transform:none!important}
#${ROOT} .jt-tab:hover{background:linear-gradient(180deg,rgba(var(--tc),.16),rgba(var(--tc),.045)),rgba(9,10,13,.94)!important;border-color:rgba(var(--tc),.36)!important}
#${ROOT} .jt-tab.jt-selected{z-index:4;height:40px!important;transform:translateY(1px)!important;color:#f8fafc!important;background:linear-gradient(180deg,rgba(var(--tc),.13),rgba(var(--tc),.03)),rgba(12,13,16,.99)!important;border-color:rgba(var(--tc),.38)!important;border-bottom-color:rgba(12,13,16,.99)!important;box-shadow:0 -6px 18px rgba(0,0,0,.18),inset 0 1px 0 rgba(255,255,255,.045)!important}
#${ROOT} .jt-tab-level-0{--tc:123,170,242}#${ROOT} .jt-tab-level-1{--tc:217,185,105}#${ROOT} .jt-tab-level-2{--tc:226,146,85}#${ROOT} .jt-tab-level-3{--tc:221,105,105}
#${ROOT} .jt-tab-dot{width:7px;height:7px;flex:0 0 7px;border-radius:50%;background:rgb(var(--tc));box-shadow:0 0 0 4px rgba(var(--tc),.11)}
#${ROOT} .jt-tab>span{min-width:0;max-width:78px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11.5px;font-weight:780;color:inherit}
#${ROOT} .jt-tab-time{margin-left:auto;white-space:nowrap;color:rgba(var(--tc),.92);font:700 10.5px/1 ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums}
#${ROOT} .jt-x{width:18px;height:18px;flex:0 0 18px;padding:0;border:0;border-radius:50%;background:transparent;color:rgba(var(--tc),.56)}#${ROOT} .jt-x:hover{background:rgba(var(--tc),.12);color:#fff}
#${ROOT} .jt-shell>header{min-height:55px;display:flex;align-items:center;gap:10px;padding:10px 11px 10px 15px;border-bottom:1px solid rgba(255,255,255,.075)}
#${ROOT}.jt-collapsed .jt-shell>header{min-height:58px;border-bottom:0}
#${ROOT} .jt-shell>header>i{display:none}
#${ROOT} .jt-head-v102{min-width:0;flex:1;display:grid;grid-template-columns:minmax(100px,1fr) auto;align-items:center;gap:13px}
#${ROOT} .jt-brand{display:flex;align-items:center;gap:8px;color:rgba(215,221,230,.78);font-size:13px;font-weight:650;white-space:nowrap}#${ROOT} .jt-brand>i{color:#7baaf2;font-size:18px;font-style:normal}
#${ROOT} .jt-head-context{display:none;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#f4f6f9;font-size:12.5px;font-weight:740}
#${ROOT} .jt-head-v102>[data-role="compact-time"]{justify-self:end;color:#f7f9fb;font:760 16px/1 ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums}
#${ROOT}.jt-collapsed .jt-head-v102{grid-template-columns:auto minmax(70px,1fr) auto}#${ROOT}.jt-collapsed .jt-head-context{display:block;padding-left:12px;border-left:1px solid rgba(255,255,255,.08)}#${ROOT}.jt-collapsed .jt-head-v102>[data-role="compact-time"]{padding-left:13px;border-left:1px solid rgba(255,255,255,.08)}
#${ROOT} .jt-shell>header>button{flex:0 0 34px;width:34px;height:34px;border-radius:10px}
#${ROOT} .jt-main,#${ROOT} .jt-empty{border-radius:13px!important}
@media(max-width:640px){#${ROOT}{width:calc(100vw - 16px);padding-top:37px}#${ROOT} .jt-tabs{left:9px;right:9px;top:-37px;height:38px}#${ROOT} .jt-tab{min-width:80px;max-width:145px;height:35px!important}#${ROOT} .jt-tab.jt-selected{height:38px!important}#${ROOT} .jt-tab-time{font-size:9.5px}#${ROOT}.jt-collapsed .jt-brand>span{display:none}}
`;
    document.documentElement.appendChild(css);
  }

  let tries=0;const wait=setInterval(()=>{if(watch()||++tries>=60)clearInterval(wait)},150);
  window.addEventListener('storage',e=>{if(e.key===KEY)schedule()});
})();
