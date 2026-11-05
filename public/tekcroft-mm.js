
/* ══════════════════════════════════════════════════════════════════════
   SERVICES MEGA MENU
   SERVICES is the single source of truth — the panel, the hero copy and
   the burger accordion are all built from it.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
if (window.__tekcroftMm) return;
window.__tekcroftMm = true;
var SERVICES = [
  { title:"SEO Services", href:"/services/seo-services", icon:"chart", img:"seo",
    items:[
      {name:"Ecommerce SEO Services", href:"/services/ecommerce-seo-services", note:"Rankings for product and category pages.", img:"seoEcommerce"},
      {name:"SEO Audit Services", href:"/services/seo-audit-services", note:"Find what is holding the site back.", img:"seoAudit"},
      {name:"On-Page SEO Services", href:"/services/on-page-seo-services", note:"Titles, content and internal links.", img:"seoOnpage"},
      {name:"Technical SEO Services", href:"/services/technical-seo-services", note:"Crawling, speed and indexing fixes.", img:"seoTechnical"},
      {name:"AI SEO Services", href:"/services/ai-seo-services", note:"Get cited inside AI answers.", img:"seoAi"}
    ]},
  { title:"Local SEO Services", href:"/services/local-seo-services", icon:"pin", img:"localSeo",
    items:[
      {name:"Google Business Profile Optimization Services", href:"/services/google-business-profile-optimization-services", note:"Turn the listing into calls and visits.", img:"localGbp"},
      {name:"Franchise SEO Services", href:"/services/franchise-seo-services", note:"One system across every location.", img:"localFranchise"}
    ]},
  { title:"Web and App Development Services", href:"/services/web-and-app-development-services", icon:"code", img:"web",
    items:[
      {name:"Web Design and Development Services", href:"/services/web-design-and-development-services", note:"Sites built to convert, not just to look good.", img:"webDesign"},
      {name:"Custom Software Development Services", href:"/services/custom-software-development-services", note:"Custom platforms and internal tools.", img:"webSoftware"},
      {name:"Mobile App Development Services", href:"/services/mobile-app-development-services", note:"iOS and Android, one codebase.", img:"webMobile"}
    ]},
  { title:"Artificial Intelligence Services", href:"/services/artificial-intelligence-services", icon:"chip", img:"ai",
    items:[
      {name:"AI Development Services", href:"/services/ai-development-services", note:"Models wired into your own stack.", img:"aiDev"},
      {name:"AI Chatbot Development Services", href:"/services/ai-chatbot-development-services", note:"Answer customers day and night.", img:"aiChatbot"},
      {name:"AI Agent Development Services", href:"/services/ai-agent-development-services", note:"Run multi-step work end to end.", img:"aiAgent"}
    ]}
];

var BG = {
  seo:{src:"/images/mm-seo-ee25d585e6.webp", alt:"SEO specialists reviewing search performance dashboards for TekCroft SEO services", title:"SEO Services"},
  seoEcommerce:{src:"/images/mm-seo-ecommerce-5f6d7e2d51.webp", alt:"Team reviewing ecommerce SEO analytics and product category rankings on a desktop dashboard", title:"Ecommerce SEO Services"},
  seoAudit:{src:"/images/mm-seo-audit-785fcd27e0.webp", alt:"Specialists reviewing an SEO audit report with crawl and ranking findings on screen", title:"SEO Audit Services"},
  seoOnpage:{src:"/images/mm-seo-onpage-a9c4c0846e.webp", alt:"Marketer optimizing on-page SEO titles, content structure, and internal links", title:"On-Page SEO Services"},
  seoTechnical:{src:"/images/mm-seo-technical-82e8b4c729.webp", alt:"Engineer fixing technical SEO issues for crawling, speed, and indexing", title:"Technical SEO Services"},
  seoAi:{src:"/images/mm-seo-ai-04b7222b1b.webp", alt:"Team analyzing AI search visibility and citation opportunities for AI SEO", title:"AI SEO Services"},
  local:{src:"/images/mm-local-cat-59ce54437b.webp", alt:"Local SEO specialists mapping neighborhood rankings and location strategy", title:"Local SEO Services"},
  localSeo:{src:"/images/mm-local-b28a2a8554.webp", alt:"Local SEO team planning map-based rankings and service-area visibility", title:"Local SEO Services"},
  localGbp:{src:"/images/mm-local-gbp-93ba89bfb1.webp", alt:"Specialist optimizing a Google Business Profile listing for calls and visits", title:"Google Business Profile Optimization Services"},
  localFranchise:{src:"/images/mm-local-franchise-88dcef3e9a.webp", alt:"Franchise SEO planners aligning multi-location search strategy across sites", title:"Franchise SEO Services"},
  web:{src:"/images/mm-web-cat-11f5aab015.webp", alt:"Web and app team collaborating on product and application development", title:"Web and App Development Services"},
  webDesign:{src:"/images/mm-web-9b5da82227.webp", alt:"Designers and developers building a conversion-focused website interface", title:"Web Design and Development Services"},
  webSoftware:{src:"/images/mm-web-software-c140d05592.webp", alt:"Engineers building custom software platforms and internal business tools", title:"Custom Software Development Services"},
  webMobile:{src:"/images/mm-web-mobile-95ffa25bf8.webp", alt:"Mobile app developers shipping iOS and Android from one shared codebase", title:"Mobile App Development Services"},
  ai:{src:"/images/mm-ai-cat-0d34cc0d0a.webp", alt:"AI team collaborating on intelligent products and automation systems", title:"Artificial Intelligence Services"},
  aiDev:{src:"/images/mm-ai-dev-e69aa64fea.webp", alt:"Engineers wiring AI models into a production software stack", title:"AI Development Services"},
  aiChatbot:{src:"/images/mm-ai-chatbot-556d22b637.webp", alt:"Team building an AI chatbot that answers customers around the clock", title:"AI Chatbot Development Services"},
  aiAgent:{src:"/images/mm-ai-agent-e2a21e5ca1.webp", alt:"Specialists designing AI agents that run multi-step work end to end", title:"AI Agent Development Services"},
  team:{src:"/images/mm-team.webp", alt:"TekCroft team collaborating on digital services", title:"TekCroft Services"},
  keys:{src:"/images/mm-keys.webp", alt:"Local SEO planning with maps and location strategy", title:"Local SEO"},
  laptops:{src:"/images/mm-laptops.webp", alt:"Developers working on web and app projects", title:"Web and App Development Services"},
  devs:{src:"/images/mm-devs.webp", alt:"Engineers building software and AI systems", title:"Artificial Intelligence Services"},
  meeting:{src:"/images/mm-meeting.webp", alt:"Team meeting to plan TekCroft service delivery", title:"TekCroft Services"},
  table:{src:"/images/mm-table.webp", alt:"Workshop table with product and service planning materials", title:"TekCroft Services"},
  docs:{src:"/images/mm-docs.webp", alt:"Business profile and local listing optimization documents", title:"Google Business Profile Optimization Services"},
  mentor:{src:"/images/mm-mentor.webp", alt:"Consultant mentoring a client through a service plan", title:"TekCroft Services"}
};
var BG_IDLE = 'meeting';
var BG_KEYS = Object.keys(BG);

var ICONS = {
  chart:'<path d="M5 19V5"/><path d="M9.5 19v-6.5"/><path d="M14 19V9"/><path d="M18.5 19v-4"/>',
  pin:'<path d="M19.5 10.4c0 4.9-7.5 10.4-7.5 10.4S4.5 15.3 4.5 10.4a7.5 7.5 0 0 1 15 0Z"/><circle cx="12" cy="10.3" r="2.5"/>',
  code:'<path d="M8.6 8 4.4 12l4.2 4"/><path d="M15.4 8l4.2 4-4.2 4"/><path d="M13.2 5.6 10.8 18.4"/>',
  chip:'<rect x="7" y="7" width="10" height="10" rx="2.2"/><path d="M10 3.6v3.4M14 3.6v3.4M10 17v3.4M14 17v3.4M3.6 10H7M3.6 14H7M17 10h3.4M17 14h3.4"/>'
};
var DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
function ic(n){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[n]+'</svg>'; }
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

var panel = document.getElementById('mmPanel');
var btn   = document.getElementById('mmTrigger');
if(!panel || !btn) return;

/* ── one column per core service ── */
document.getElementById('mmCols').innerHTML = SERVICES.map(function(s){
  var gpAttrs = ' class="mm-gp" data-img="'+s.img+'" data-title="'+esc(s.title)+'"'
    + ' data-note="Everything under '+esc(s.title)+'."';
  var gp = s.href
    ? '<a'+gpAttrs+' href="'+s.href+'">'+esc(s.title)+'</a>'
    : '<span'+gpAttrs+' role="presentation">'+esc(s.title)+'</span>';
  return '<div class="mm-svc-col">'
    + gp
    + s.items.map(function(it){
        return '<a class="mm-row" href="'+it.href+'" data-img="'+it.img+'"'
          + ' data-title="'+esc(it.name)+'" data-note="'+esc(it.note)+'">'
          + '<span class="mm-dot">'+ic(s.icon)+'</span>'
          + '<span><span class="mm-n">'+esc(it.name)+'</span>'
          + '<span class="mm-dsc">'+esc(it.note)+'</span></span></a>';
      }).join('')
    + '</div>';
}).join('');

/* ── the hero image stack ── */
function imgKeyForPath(pathname){
  var here = (pathname||'').replace(/\/+$/,'').toLowerCase();
  if(!here) return null;
  for(var i=0;i<SERVICES.length;i++){
    var s = SERVICES[i];
    try{ if(s.href && new URL(s.href, location.href).pathname.replace(/\/+$/,'').toLowerCase()===here) return s.img; }catch(e){}
    for(var j=0;j<s.items.length;j++){
      try{ if(new URL(s.items[j].href, location.href).pathname.replace(/\/+$/,'').toLowerCase()===here) return s.items[j].img; }catch(e){}
    }
  }
  return null;
}
var activeImg = imgKeyForPath(location.pathname);
if(activeImg && BG[activeImg]) BG_IDLE = activeImg;

var stack = panel.querySelector('.mm-stack');
stack.innerHTML = BG_KEYS.map(function(k){
  var meta = BG[k];
  return '<img src="'+meta.src+'" alt="'+esc(meta.alt)+'" title="'+esc(meta.title)+'" width="760" height="507" loading="lazy" decoding="async" data-key="'+k+'"'+(k===BG_IDLE?' data-on="true"':'')+'>';
}).join('');
function showBg(key){
  var want = key || BG_IDLE;
  [].slice.call(stack.children).forEach(function(img){
    img.setAttribute('data-on', img.dataset.key === want ? 'true' : 'false');
  });
}

/* ── open, close, and the caret that points at the trigger ── */
var hideTimer = null, showTimer = null;
var titleEl = panel.querySelector('.mm-title'), noteEl = panel.querySelector('.mm-note');
/* Defaults live in JS so page HTML/source does not expose mega-menu copy as page content. */
var baseTitle = 'Everything we do, in one place';
var baseNote = 'Search, local, development and AI, pick a service to see what it covers.';

function placeCaret(){
  /* PERF: batch geometry reads before the CSS write */
  var box = panel.querySelector('.mm-panel').getBoundingClientRect();
  var r = btn.getBoundingClientRect();
  var x = (r.left + r.width / 2 - box.left) + 'px';
  panel.querySelector('.mm-caret').style.setProperty('--caret-x', x);
}
function reset(){
  showBg(activeImg || null);
  /* Keep copy out of the DOM while the panel is closed (not page content). */
  if(panel.hidden){
    if(titleEl) titleEl.textContent = '';
    if(noteEl) noteEl.textContent = '';
    return;
  }
  if(activeImg){
    var cur = panel.querySelector('.mm-row.is-current, .mm-gp[aria-current="page"]');
    if(cur){
      titleEl.textContent = cur.dataset.title || baseTitle;
      noteEl.textContent  = cur.dataset.note || baseNote;
      return;
    }
    if(BG[activeImg]){
      titleEl.textContent = BG[activeImg].title;
      noteEl.textContent  = baseNote;
      return;
    }
  }
  titleEl.textContent = baseTitle;
  noteEl.textContent  = baseNote;
}
function open(){
  clearTimeout(hideTimer);
  panel.hidden = false;
  btn.setAttribute('aria-expanded','true');
  placeCaret();
  reset();
}
function close(){
  clearTimeout(showTimer);
  panel.hidden = true;
  btn.setAttribute('aria-expanded','false');
  reset();
}
function closeSoon(){ clearTimeout(hideTimer); hideTimer = setTimeout(close, 180); }

/* Click navigates to /services; hover still opens the mega menu */
btn.addEventListener('click', function(e){ e.stopPropagation(); });
btn.addEventListener('mouseenter', function(){ clearTimeout(hideTimer); showTimer = setTimeout(open, 90); });
btn.addEventListener('mouseleave', function(){ clearTimeout(showTimer); closeSoon(); });

panel.addEventListener('mouseenter', function(){ clearTimeout(hideTimer); });
panel.addEventListener('mouseleave', closeSoon);
panel.addEventListener('click', function(e){ if(e.target.closest('a,[data-modal]')) close(); });

/* the photograph and the hero copy follow whatever is hovered */
var follow = function(e){
  var hit = e.target.closest('.mm-row,.mm-gp');
  if(!hit) return;
  showBg(hit.dataset.img);
  titleEl.textContent = hit.dataset.title;
  noteEl.textContent  = hit.dataset.note;
};
panel.addEventListener('mouseover', follow);
panel.addEventListener('focusin', follow);
panel.querySelector('.mm-svc-cols').addEventListener('mouseleave', reset);

document.addEventListener('click', function(e){
  if(!panel.hidden && !e.target.closest('.mm') && e.target !== btn) close();
});
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape' && !panel.hidden){ close(); btn.focus(); }
});
window.addEventListener('resize', function(){ if(!panel.hidden) placeCaret(); });
window.addEventListener('scroll', function(){ if(!panel.hidden) placeCaret(); }, {passive:true});

/* ── Burger menu (card design) — rebuild .mnav; desktop .mm untouched ── */
var MX_ICONS = {
  chart:'<path d="M4 20V10M10 20V5M16 20v-7M21 20H3"/>',
  pin:'<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.4"/>',
  code:'<path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 6l-2 12"/>',
  chip:'<rect x="7" y="7" width="10" height="10" rx="2"/><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4"/>'
};
var MX_CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
function mxIc(n){
  return '<span class="mx-ic" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+(MX_ICONS[n]||MX_ICONS.chart)+'</svg></span>';
}

(function buildMobileNav(){
  var mnav = document.querySelector('.js-mnav');
  if(!mnav) return;
  /* Rebuild if not yet v2, or if an older v2 still has the inner logo/X bar */
  if(mnav.classList.contains('mnav-v2') && mnav.querySelector('.mx-scroll') && !mnav.querySelector('.mx-top')) return;

  /* Preserve page-specific destinations + CTA behaviour from the old markup */
  var oldLinks = [].slice.call(mnav.querySelectorAll(':scope > a'));
  function hrefAt(i, fallback){
    var a = oldLinks[i];
    return (a && a.getAttribute('href')) || fallback;
  }
  var homeHref = hrefAt(0, '/');
  var aboutHref = hrefAt(1, '/about-us');
  var servicesHref = hrefAt(2, '/services');
  var contactHref = hrefAt(3, '/contact-us');
  var oldCta = mnav.querySelector(':scope > .btn, :scope > button[data-jump], :scope > button[data-modal]');
  var ctaModal = oldCta && oldCta.hasAttribute('data-modal');
  var ctaAttrs = ctaModal ? ' data-modal' : ' data-jump';

  var cards = SERVICES.map(function(s, i){
    var items = s.items.filter(function(it){
      return String(it.name).toLowerCase() !== String(s.title).toLowerCase();
    });
    var subs = items.map(function(it){
      return '<a class="mx-sub" href="'+it.href+'">'+esc(it.name)+'</a>';
    }).join('');
    var mainHref = s.href || '';
    var mainInner = mxIc(s.icon)+'<span class="mx-t">'+esc(s.title)+'</span>';
    var mainEl = mainHref
      ? '<a class="mx-main" href="'+mainHref+'">'+mainInner+'</a>'
      : '<span class="mx-main mx-main--nolink">'+mainInner+'</span>';
    return '<div class="mx-svc" data-i="'+i+'">'
      + '<div class="mx-row">'
      + mainEl
      + '<button class="mx-tg" type="button" aria-expanded="false" aria-controls="mxdrop'+i+'" aria-label="Show '+esc(s.title)+'">'+MX_CHEV+'</button>'
      + '</div>'
      + '<div class="mx-drop" id="mxdrop'+i+'"><div>'+subs+'</div></div>'
      + '</div>';
  }).join('');

  mnav.classList.add('mnav-v2');
  /* No inner logo/X — site header burger closes the panel */
  mnav.innerHTML =
    '<div class="mx-scroll">'
    + '<a class="mx-link" href="'+homeHref+'">Home</a>'
    + '<a class="mx-link" href="'+aboutHref+'">About us</a>'
    + cards
    + '<a class="mx-link" href="'+servicesHref+'">Services</a>'
    + '<a class="mx-link" href="'+contactHref+'">Contact us</a>'
    + '</div>'
    + '<div class="mx-foot">'
    + '<button class="mx-cta" type="button"'+ctaAttrs+'>Get a Free Proposal</button>'
    + '</div>';

  function closeBurger(){
    if (typeof window.__tekcroftCloseMnav === 'function'){
      window.__tekcroftCloseMnav();
      return;
    }
    var burger = document.querySelector('.js-burger');
    mnav.classList.remove('open');
    if(burger){
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
  }

  mnav.addEventListener('click', function(e){
    var tg = e.target.closest('.mx-tg');
    if(tg && mnav.contains(tg)){
      e.preventDefault();
      e.stopPropagation();
      var card = tg.closest('.mx-svc');
      if(!card) return;
      var willOpen = !card.classList.contains('open');
      mnav.querySelectorAll('.mx-svc').forEach(function(c){
        c.classList.remove('open');
        var b = c.querySelector('.mx-tg');
        if(b) b.setAttribute('aria-expanded', 'false');
      });
      if(willOpen){
        card.classList.add('open');
        tg.setAttribute('aria-expanded', 'true');
      }
      return;
    }
    /* Links / CTA close the drawer (chevron already returned) */
    if(e.target.closest('a[href], .mx-cta, [data-jump], [data-modal]')){
      /* defer so navigation / jump handlers still see the click */
      setTimeout(closeBurger, 0);
    }
  });
})();
})();

/* ── Mega-menu footer CTA: label + arrow like primary buttons ── */
(function(){
  if(!document.getElementById('mm-foot-cta-fix')){
    var st = document.createElement('style');
    st.id = 'mm-foot-cta-fix';
    st.textContent = [
      '.mm-foot > div > span{display:block;margin-top:1px;font-size:12.5px;color:var(--muted);}',
      '.mm-foot .mm-cta,.mm-foot .mm-cta2{color:#fff!important;font-size:15px!important;font-weight:700!important;}',
      '.mm-foot .mm-cta .btn-label,.mm-foot .mm-cta2 .btn-label,.mm-foot .btn-label{display:inline!important;margin-top:0!important;color:#fff!important;font-size:15px!important;font-weight:700!important;}',
      '.mm-foot .mm-cta .arw,.mm-foot .mm-cta2 .arw,.mm-foot .arw{display:grid!important;place-items:center;flex-shrink:0;width:32px;height:32px;margin:-7px -9px -7px 0;border-radius:50%;border:1px solid currentColor;font-size:14px;color:#fff!important;transform:rotate(45deg);}',
      '.mm-foot .mm-cta:hover .arw,.mm-foot .mm-cta2:hover .arw{transform:rotate(90deg);background:var(--n0);color:var(--ink-plate)!important;border-color:transparent;}',
      'html[data-theme="dark"] .mm-foot .mm-cta,html[data-theme="dark"] .mm-foot .mm-cta2,html[data-theme="dark"] .mm-foot .btn-label,html[data-theme="dark"] .mm-foot .arw{color:#fff!important;}'
    ].join('');
    document.head.appendChild(st);
  }
  var cta = document.querySelector('.mm-foot .mm-cta, .mm-foot .mm-cta2');
  if(!cta) return;
  if(!cta.querySelector('.btn-label')){
    var text = (cta.textContent || '').replace(/\s+/g, ' ').trim();
    while(cta.firstChild) cta.removeChild(cta.firstChild);
    var lab = document.createElement('span');
    lab.className = 'btn-label';
    lab.textContent = text || 'Get a Free Proposal';
    cta.appendChild(lab);
  }
  if(!cta.querySelector('.arw')){
    var arw = document.createElement('span');
    arw.className = 'arw';
    arw.setAttribute('aria-hidden', 'true');
    arw.innerHTML = '&uarr;';
    cta.appendChild(arw);
  }
})();

/* === MEGA MENU DESIGN LAYERS (from mega-menu.html) === */
/* === mm-core-icons === */
(function(){
  [].forEach.call(document.querySelectorAll('#mmCols .mm-svc-col'),function(col){
    var gp=col.querySelector('.mm-gp'), d=col.querySelector('.mm-row .mm-dot'); if(!gp||!d||gp.querySelector('.mm-gi')) return;
    var t=document.createElement('span'); t.className='mm-gt'; while(gp.firstChild) t.appendChild(gp.firstChild); gp.appendChild(t); var i=document.createElement('span'); i.className='mm-gi'; i.setAttribute('aria-hidden','true'); i.innerHTML=d.innerHTML; gp.insertBefore(i,gp.firstChild);
  });
})();

/* === mm-current-js === */
(function(){
  var panel=document.getElementById('mmPanel'); if(!panel) return;
  function norm(p){ return (p||'').replace(/\/+$/,'').toLowerCase(); }
  var here=norm(location.pathname), forced=(panel.getAttribute('data-current')||'').toLowerCase().trim();
  var marked=false;
  [].forEach.call(panel.querySelectorAll('.mm-row'),function(a){
    var name=(a.querySelector('.mm-n')||a).textContent.toLowerCase().trim(), hit=false;
    try{ var u=new URL(a.getAttribute('href'),location.href); hit = here && here!=='' && norm(u.pathname)===here && !u.hash; }catch(e){}
    if(!hit && forced) hit = name===forced;
    if(hit){ a.classList.add('is-current'); a.setAttribute('aria-current','page');
      var col=a.closest('.mm-svc-col'), gp=col&&col.querySelector('.mm-gp'); if(gp) gp.classList.add('is-current-parent');
      var t=document.getElementById('mmTrigger'); if(t) t.classList.add('is-current-parent');
      marked=true; }
  });
  if(!marked){
    [].forEach.call(panel.querySelectorAll('.mm-gp'),function(gp){
      var hit=false;
      try{ var u=new URL(gp.getAttribute('href'),location.href); hit = here && here!=='' && norm(u.pathname)===here && !u.hash; }catch(e){}
      if(hit){ gp.classList.add('is-current-parent'); gp.setAttribute('aria-current','page');
        var t=document.getElementById('mmTrigger'); if(t) t.classList.add('is-current-parent'); }
    });
  }
})();


/* ---------------- FAQ accordion ----------------
   One open at a time. Skip on the homepage (#tekcroft-root): Homepage.tsx
   wireFaq owns that accordion. Duplicate toggles cancel close-on-reclick. */
(function(){
  if (document.getElementById('tekcroft-root')) return;
  var list = document.querySelector('.faq-list');
  if(!list) return;
  list.addEventListener('click', function(e){
    var btn = e.target.closest('.faq-q');
    if(!btn) return;
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if(!panel) return;
    var isOpen = btn.getAttribute('aria-expanded') === 'true';
    list.querySelectorAll('.faq-q').forEach(function(b){
      b.setAttribute('aria-expanded','false');
      var p = document.getElementById(b.getAttribute('aria-controls'));
      if (p) p.dataset.open = 'false';
    });
    if(!isOpen){
      btn.setAttribute('aria-expanded','true');
      panel.dataset.open = 'true';
      var wrap = list.closest('.faq-wrap');
      if (wrap){
        var qs = Array.prototype.slice.call(list.querySelectorAll('.faq-q'));
        wrap.dataset.at = String(qs.indexOf(btn) + 1);
      }
    }
  });
})();


/* ---------------- reviews ----------------
   The same three reviews the rotating quote used, shown together. The row
   is a grid at full width and a snap track below that; the arrows and dots
   only appear where it actually scrolls. */
(function(){
  var track = document.getElementById('grTrack');
  if(!track) return;

  /* PLACEHOLDER REVIEWS — same status as the three the rotating quote
     carried: written for layout, not collected from clients. Replace every
     one of these with the real Google review before this goes live. */
  var GR = [
    { name:"Dana Whitfield", initials:"DW", guide:true,
      meta:"24 reviews \u00b7 6 photos", when:"2 weeks ago",
      text:"We had three agencies before this one. TekCroft is the first that could tell me, in one sentence, what my money bought last month.",
      tags:["SEO","Paid Media","B2B SaaS"], helpful:24 },
    { name:"Marcus Reyes", initials:"MR", guide:false,
      meta:"8 reviews \u00b7 2 photos", when:"1 month ago",
      text:"They rebuilt the site and then ranked it. Not having to referee between two vendors was worth the fee on its own.",
      tags:["Web Build","SEO"], helpful:18 },
    { name:"Priya Raman", initials:"PR", guide:false,
      meta:"11 reviews", when:"2 months ago",
      text:"The free review found a redirect chain that had been eating a third of our organic traffic for two years. They sent it before we paid them anything.",
      tags:["Technical SEO","Audit"], helpful:32 },
    { name:"Elena Fischer", initials:"EF", guide:true,
      meta:"31 reviews \u00b7 4 photos", when:"3 months ago",
      text:"Placeholder review. One strategist owns the account, the dashboard is live, and the monthly call is about decisions rather than screenshots.",
      tags:["Local SEO","Reporting"], helpful:15 },
    { name:"Tobias Lang", initials:"TL", guide:false,
      meta:"6 reviews", when:"4 months ago",
      text:"Placeholder review. Audit in week one, strategy in week two, campaigns live in week four, and nothing in between that we had to chase.",
      tags:["Onboarding","Paid Media"], helpful:9 },
    { name:"Amara Diallo", initials:"AD", guide:false,
      meta:"17 reviews \u00b7 1 photo", when:"5 months ago",
      text:"Placeholder review. They said no to two things we asked for and explained why, which is the part that made us trust the rest of it.",
      tags:["Ecommerce SEO","CRO"], helpful:21 }
  ];

  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.6 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17.42 6.62 20.25l1.03-6L3.3 10l6-.9z"/></svg>';
  function stars(n){
    var out = '';
    for (var i = 0; i < 5; i++) out += STAR;
    return '<span class="gr-stars" role="img" aria-label="Rated ' + n + ' out of 5">' + out + '</span>';
  }
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  track.innerHTML = GR.map(function(r){
    return '<article class="gr-card">'
      + '<div class="gr-top">'
      +   '<span class="gr-av" aria-hidden="true">' + esc(r.initials) + '</span>'
      +   '<span class="gr-who"><b>' + esc(r.name)
      +     (r.guide ? '<span class="gr-guide">Local Guide</span>' : '') + '</b>'
      +     '<span>' + esc(r.meta) + '</span></span>'
      +   '<span class="gr-kebab" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></span>'
      + '</div>'
      + '<div class="gr-meta">' + stars(5) + '<span class="gr-when">' + esc(r.when) + '</span></div>'
      + '<p class="gr-text">' + esc(r.text) + '</p>'
      + '<div class="gr-tags">' + r.tags.map(function(t){
            return '<span class="gr-tag">' + esc(t) + '</span>'; }).join('') + '</div>'
      + '<div class="gr-foot">'
      +   '<button type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10.5v9H4.5v-9Z"/><path d="M7 10.5 11 3a2 2 0 0 1 2 2v4h5.4a1.6 1.6 0 0 1 1.6 2l-1.5 7a2 2 0 0 1-2 1.5H7Z"/></svg>Helpful (' + r.helpful + ')</button>'
      +   '<button type="button">Share</button>'
      + '</div></article>';
  }).join('');

  /* the rating shown in the bar */
  var starSlot = document.getElementById('grBarStars');
  if (starSlot) starSlot.innerHTML = stars(4.8);

  /* arrows and dots — one page per card's worth of scroll */
  var prev = document.getElementById('grPrev'),
      next = document.getElementById('grNext'),
      dots = document.getElementById('grDots');
  if(!prev || !next || !dots) return;

  /* The controls belong to the content, not to the breakpoint: they show
     whenever there is more than one page of cards and hide when the row
     fits, at any width. */
  var nav = dots.parentElement;

  /* The gap is read off the track rather than hard-coded, so the step stays
     right as the layout's clamp() resolves differently at each width. */
  function step(){
    var card = track.firstElementChild;
    if(!card) return 1;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return Math.max(1, card.offsetWidth + gap);
  }
  function perView(){ return Math.max(1, Math.round(track.clientWidth / step())); }
  function pages(){ return Math.max(1, track.children.length - perView() + 1); }
  function at(){ return Math.round(track.scrollLeft / step()); }

  function paint(){
    /* PERF_MM_V2: read layout first, write later (avoids forced reflow) */
    var sw = track.scrollWidth, cw = track.clientWidth, sl = track.scrollLeft;
    var scrolls = sw - cw > 4;
    var stepW = 1;
    if (scrolls){
      var card = track.children[0];
      if (card){
        var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
        stepW = Math.max(1, card.offsetWidth + gap);
      }
    }
    nav.style.display = scrolls ? 'flex' : 'none';
    if(!scrolls) return;

    var pv = Math.max(1, Math.round(cw / stepW));
    var n = Math.max(1, track.children.length - pv + 1);
    var i = Math.min(Math.round(sl / stepW), n - 1);
    if (dots.children.length !== n){
      dots.innerHTML = '';
      for (var k = 0; k < n; k++){
        var b = document.createElement('button');
        b.className = 'gr-dot'; b.type = 'button';
        b.setAttribute('aria-label', 'Go to review ' + (k + 1));
        b.dataset.i = k;
        dots.appendChild(b);
      }
    }
    [].slice.call(dots.children).forEach(function(b, k){
      b.setAttribute('aria-current', k === i ? 'true' : 'false');
    });
    prev.disabled = i <= 0;
    next.disabled = i >= n - 1;
  }
  function go(dir){ track.scrollBy({ left: dir * step(), behavior:'smooth' }); }

  prev.addEventListener('click', function(){ go(-1); });
  next.addEventListener('click', function(){ go(1); });
  dots.addEventListener('click', function(e){
    var b = e.target.closest('.gr-dot'); if(!b) return;
    track.scrollTo({ left: b.dataset.i * step(), behavior:'smooth' });
  });
  track.addEventListener('scroll', paint, { passive:true });
  window.addEventListener('resize', paint);
  paint();
})();

/* ══════════════════════════════════════════════════════════════════════
   Burger menu scroll-lock + --nav-h sync (all pages)
   Open .mnav used to inflate nav.offsetHeight into --nav-h and leave the
   hero with a huge top pad. Measure the top bar only, and always clear
   any body lock styles when the menu closes.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  if (window.__tekcroftMnavChrome) return;
  window.__tekcroftMnavChrome = true;

  var mnav = document.querySelector('.js-mnav');
  var burger = document.querySelector('.js-burger');
  var savedY = 0;
  var locked = false;
  var wasOpen = !!(mnav && mnav.classList.contains('open'));
  var lastPath = location.pathname + location.search;
  var resizeTimer = 0;

  var measureQueued = false;
  function measureNavH(){
    if (measureQueued) return;
    measureQueued = true;
    requestAnimationFrame(function(){
      measureQueued = false;
      var nav = document.getElementById('nav') || document.querySelector('nav.nav');
      if (!nav) return;
      var bar = nav.querySelector('.nav-in');
      var cs = getComputedStyle(nav);
      var h = (bar ? bar.offsetHeight : 64)
        + (parseFloat(cs.paddingTop) || 0)
        + (parseFloat(cs.paddingBottom) || 0);
      document.documentElement.style.setProperty('--nav-h', Math.round(h) + 'px');
    });
  }

  function clearHeroInlineSizes(){
    var nodes = document.querySelectorAll('#hero-1, #hero-1.hs, .hs, header.hero, #top.hero');
    for (var i = 0; i < nodes.length; i++){
      var el = nodes[i];
      if (el.style.height) el.style.height = '';
      if (el.style.minHeight) el.style.minHeight = '';
      if (el.style.top) el.style.top = '';
      if (el.style.paddingTop && /px$/.test(el.style.paddingTop) && parseFloat(el.style.paddingTop) > 120){
        el.style.paddingTop = '';
      }
    }
  }

  function clearBodyLock(){
    var b = document.body;
    var h = document.documentElement;
    b.style.position = '';
    b.style.top = '';
    b.style.left = '';
    b.style.right = '';
    b.style.overflow = '';
    b.style.paddingRight = '';
    b.style.width = '';
    b.style.height = '';
    h.style.overflow = '';
    h.style.height = '';
    h.style.position = '';
    b.classList.remove('menu-open', 'no-scroll', 'mnav-open', 'nav-open');
    h.classList.remove('menu-open', 'no-scroll', 'mnav-open', 'nav-open');
  }

  function lockScroll(){
    if (locked) return;
    locked = true;
    savedY = window.scrollY || window.pageYOffset || 0;
    var gap = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (gap > 0) document.body.style.paddingRight = gap + 'px';
    /* Avoid position:fixed lock — it is what leaves a blank band if unlock fails.
       Still clear those props on unlock in case anything else set them. */
  }

  function unlockScroll(){
    clearBodyLock();
    if (locked){
      locked = false;
      window.scrollTo(0, savedY);
    }
    measureNavH();
    clearHeroInlineSizes();
  }

  function closeMenu(){
    if (!mnav) return;
    mnav.classList.remove('open');
    if (burger){
      burger.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
    }
    unlockScroll();
  }

  function onMenuOpenChange(open){
    if (open){
      lockScroll();
      measureNavH();
    } else {
      unlockScroll();
    }
  }

  if (mnav){
    new MutationObserver(function(){
      var open = mnav.classList.contains('open');
      if (open === wasOpen) return;
      wasOpen = open;
      onMenuOpenChange(open);
    }).observe(mnav, { attributes:true, attributeFilter:['class'] });
  }

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function(){
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function(){
      measureNavH();
      clearHeroInlineSizes();
      if (window.innerWidth > 1080) closeMenu();
    }, 100);
  });

  window.addEventListener('orientationchange', function(){
    setTimeout(function(){
      measureNavH();
      clearHeroInlineSizes();
      closeMenu();
    }, 100);
  });

  if (window.visualViewport){
    window.visualViewport.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){
        measureNavH();
        clearHeroInlineSizes();
      }, 100);
    });
  }

  /* Next.js client navigations / in-app link clicks */
  setInterval(function(){
    var now = location.pathname + location.search;
    if (now !== lastPath){
      lastPath = now;
      closeMenu();
      measureNavH();
      clearHeroInlineSizes();
    }
  }, 400);

  window.addEventListener('popstate', function(){
    closeMenu();
    measureNavH();
    clearHeroInlineSizes();
  });

  measureNavH();
  clearHeroInlineSizes();
  window.__tekcroftMeasureNavH = measureNavH;
  window.__tekcroftCloseMnav = closeMenu;

  /* In-page section scroll without writing # into the URL */
  if (!window.__tekcroftDataScroll) {
    window.__tekcroftDataScroll = true;
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target.closest("[data-scroll]");
        if (!el) return;
        e.preventDefault();
        var id = el.getAttribute("data-scroll");
        if (!id) return;
        if (id === "top") {
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
        var target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          return;
        }
        var form = document.querySelector(".hs:not([hidden]) form[data-lead]");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
      },
      true
    );
  }
})();

