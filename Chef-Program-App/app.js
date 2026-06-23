/* The Self-Taught Chef Program - app logic (vanilla JS, no build step) */
(function(){
  "use strict";
  var C = window.COURSE;
  var STORE = "chef_progress_v1";
  var totalLessons = C.modules.reduce(function(a,m){return a+m.lessons.length;},0);

  /* ---------- progress storage ---------- */
  function load(){
    try{ return JSON.parse(localStorage.getItem(STORE)) || {done:[]}; }
    catch(e){ return {done:[]}; }
  }
  function save(s){ try{ localStorage.setItem(STORE, JSON.stringify(s)); }catch(e){} }
  var state = load();
  function isDone(id){ return state.done.indexOf(id) !== -1; }
  function setDone(id,on){
    var i = state.done.indexOf(id);
    if(on && i===-1) state.done.push(id);
    if(!on && i!==-1) state.done.splice(i,1);
    save(state); refreshProgress();
  }
  function moduleDone(m){ return m.lessons.every(function(l){return isDone(l.id);}); }
  function doneCount(){ return state.done.length; }

  /* ---------- helpers ---------- */
  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){
    return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function $(sel,root){ return (root||document).querySelector(sel); }
  function moduleByN(n){ return C.modules.filter(function(m){return m.n===n;})[0]; }

  /* ---------- nav ---------- */
  function buildNav(){
    var nav = $("#nav");
    var html = "";
    html += navItem("home","home","Home","&#8962;");
    html += '<div class="section-label">Modules</div>';
    C.modules.forEach(function(m){
      var done = moduleDone(m);
      html += '<a class="navitem'+(done?" done":"")+'" data-route="module/'+m.n+'">'
        + '<span class="num">'+pad(m.n)+'</span>'
        + '<span>'+esc(shortTitle(m.title))+'</span>'
        + '<span class="check">&#10003;</span></a>';
    });
    html += '<div class="section-label">Resources</div>';
    html += navItem("downloads","downloads",'Downloads &amp; files','<span class="ico">&#8681;</span>');
    html += navItem("faculty","faculty","Video library",'<span class="ico">&#9658;</span>');
    html += navItem("about","about","Install &amp; about",'<span class="ico">&#9432;</span>');
    nav.innerHTML = html;
  }
  function navItem(route,key,label,ico){
    return '<a class="navitem" data-route="'+route+'">'+ico+'<span>'+label+'</span></a>';
  }
  function pad(n){ return (n<10?"0":"")+n; }
  function shortTitle(t){ return t.split(":")[0]; }

  function markActiveNav(route){
    var items = document.querySelectorAll("#nav .navitem");
    items.forEach(function(a){
      a.classList.toggle("active", a.getAttribute("data-route")===route);
    });
  }

  /* ---------- progress UI ---------- */
  function refreshProgress(){
    var pct = totalLessons ? Math.round(doneCount()/totalLessons*100) : 0;
    var bar = $("#progBar"), lbl = $("#pctLabel");
    if(bar) bar.style.width = pct+"%";
    if(lbl) lbl.textContent = pct+"%";
    // update nav done states
    C.modules.forEach(function(m){
      var a = document.querySelector('#nav .navitem[data-route="module/'+m.n+'"]');
      if(a) a.classList.toggle("done", moduleDone(m));
    });
  }

  /* ---------- views ---------- */
  function viewHome(){
    var done = doneCount();
    var pct = totalLessons? Math.round(done/totalLessons*100):0;
    var modsDone = C.modules.filter(moduleDone).length;
    var h = "";
    h += '<section class="hero"><div class="ring"></div>'
      + '<p class="eyebrow">FROM ZERO TO PRO</p>'
      + '<h1>'+esc(C.subtitle)+'</h1>'
      + '<p>'+esc(C.tagline)+'</p></section>';
    h += '<div class="cards">'
      + stat(pct+"%","Course complete")
      + stat(done+" / "+totalLessons,"Lessons done")
      + stat(modsDone+" / "+C.modules.length,"Modules finished")
      + '</div>';
    h += '<p class="muted">Pick up where you left off:</p>';
    var next = firstUnfinished();
    if(next){
      h += '<a class="btn" data-route="module/'+next.n+'" style="margin-bottom:18px">Continue &rarr; Module '+pad(next.n)+': '+esc(shortTitle(next.title))+'</a>';
    } else {
      h += '<div class="callout">You have completed every lesson. Time for the capstone - cook a three-course meal and keep a journal!</div>';
    }
    h += '<h2 class="section-h">How the program works</h2>';
    h += '<div class="howto">'
      + how(1,"Watch","Stream the free, credible video lessons linked in each module.")
      + how(2,"Study","Read each lesson, then review the slide deck for the module.")
      + how(3,"Cook","Do the homework. Reps build the skill - reading is not cooking.")
      + how(4,"Reflect","Check off each lesson and log dishes you want to keep.")
      + '</div>';
    h += '<h2 class="section-h">The 12 modules</h2>';
    h += '<div class="dl-grid">';
    C.modules.forEach(function(m){
      var d = moduleDone(m);
      h += '<a class="dl" data-route="module/'+m.n+'">'
        + '<span class="tag">MODULE '+pad(m.n)+(d?' &#10003;':'')+'</span>'
        + '<h3>'+esc(shortTitle(m.title))+'</h3>'
        + '<p>'+esc(m.summary)+'</p>'
        + '<span class="muted">'+m.lessons.length+' lessons &middot; '+m.weeks+'</span></a>';
    });
    h += '</div>';
    return h;
  }
  function stat(big,label){ return '<div class="stat"><b>'+big+'</b><span>'+label+'</span></div>'; }
  function how(n,t,p){ return '<div class="howstep"><span class="n">'+n+'</span><h3>'+t+'</h3><p>'+esc(p)+'</p></div>'; }
  function firstUnfinished(){
    for(var i=0;i<C.modules.length;i++){ if(!moduleDone(C.modules[i])) return C.modules[i]; }
    return null;
  }

  function viewModule(n){
    var m = moduleByN(n);
    if(!m) return "<p>Module not found.</p>";
    var h = "";
    h += '<div class="mhead"><div class="eyebrow">MODULE '+pad(m.n)+' &middot; '+esc(m.weeks)+'</div>'
       + '<h1>'+esc(m.title)+'</h1></div>';
    h += '<div class="bigidea"><b>Big idea:</b> '+esc(m.bigIdea)+'</div>';
    h += '<p class="muted">'+esc(m.summary)+'</p>';

    // objectives
    h += '<h2 class="section-h">What you\'ll be able to do</h2><ul class="objlist">';
    m.objectives.forEach(function(o){ h += '<li>'+esc(o)+'</li>'; });
    h += '</ul>';

    // slide deck (embedded PDF + download popup)
    h += '<h2 class="section-h">Module slide deck</h2>';
    h += deckViewer(m);

    // videos
    h += '<h2 class="section-h">Watch (free)</h2><ul class="videos">';
    m.videos.forEach(function(v){
      h += '<li><a href="'+esc(v.url)+'" target="_blank" rel="noopener">'
         + '<span class="play">&#9658;</span><span><span class="vt">'+esc(v.label)+'</span>'
         + '<span class="vu">'+esc(v.url)+'</span></span></a></li>';
    });
    h += '</ul>';

    // lessons
    h += '<h2 class="section-h">Lessons</h2>';
    m.lessons.forEach(function(l){ h += lessonCard(l); });

    // homework
    h += '<h2 class="section-h">Homework</h2><ul class="hw">';
    m.homework.forEach(function(hw,i){
      h += '<li><span class="hwn">'+(i+1)+'</span><span>'+esc(hw)+'</span></li>';
    });
    h += '</ul>';

    // mark complete
    var allDone = moduleDone(m);
    h += '<button class="complete-btn'+(allDone?" is-done":"")+'" data-action="toggleModule" data-n="'+m.n+'">'
       + (allDone? "&#10003; Module complete - tap to reopen" : "Mark this module complete")+'</button>';

    // prev / next
    h += '<div class="modnav">';
    if(m.n>1){ var p=moduleByN(m.n-1); h += '<a data-route="module/'+(m.n-1)+'"><small>&larr; Previous</small>Module '+pad(m.n-1)+': '+esc(shortTitle(p.title))+'</a>'; } else { h+='<span></span>'; }
    if(m.n<C.modules.length){ var nx=moduleByN(m.n+1); h += '<a data-route="module/'+(m.n+1)+'" style="text-align:right"><small>Next &rarr;</small>Module '+pad(m.n+1)+': '+esc(shortTitle(nx.title))+'</a>'; }
    h += '</div>';
    return h;
  }

  function deckViewer(m){
    var id = "deck"+m.n;
    var h = '<div class="deck-toolbar">'
      + '<span class="dt-title">Module '+pad(m.n)+' slides</span>'
      + '<span class="spacer"></span>'
      + '<a class="btn ghost" href="'+esc(m.deckPdf)+'" target="_blank" rel="noopener" title="Open full screen">&#8599; Full screen</a>'
      + '<div class="dropdown">'
        + '<button class="btn" data-action="toggleMenu" data-menu="'+id+'">&#8681; Download</button>'
        + '<div class="menu" id="'+id+'">'
          + '<a href="'+esc(m.deckPdf)+'" download><span class="mi">PDF</span><span>Download PDF<small>View anywhere - no PowerPoint needed</small></span></a>'
          + '<a href="'+esc(m.deckPptx)+'" download><span class="mi">PPTX</span><span>Download PowerPoint<small>Edit in PowerPoint, Keynote or Google Slides</small></span></a>'
        + '</div>'
      + '</div>'
      + '</div>';
    h += '<iframe class="deck-frame" src="'+esc(m.deckPdf)+'#view=FitH" title="Module '+m.n+' slides" loading="lazy"></iframe>';
    h += '<p class="deck-fallback">If the slides don\'t display above (some phone browsers can\'t embed PDFs), tap <b>Full screen</b> to open them, or use <b>Download</b>.</p>';
    return h;
  }

  function lessonCard(l){
    var done = isDone(l.id);
    var h = '<div class="lesson'+(done?" done":"")+'" data-lesson="'+esc(l.id)+'">';
    h += '<div class="lesson-head" data-action="toggleLesson">'
      + '<span class="lesson-check" data-action="toggleDone" title="Mark lesson done">&#10003;</span>'
      + '<span class="lesson-title">'+esc(l.title)+'<small>'+esc(l.obj)+'</small></span>'
      + '<span class="chev">&#9654;</span></div>';
    h += '<div class="lesson-body">';
    l.teach.forEach(function(p){ h += '<p class="teach">'+esc(p)+'</p>'; });
    h += '<div class="subh key">Key points</div><ul class="ul">';
    l.key.forEach(function(k){ h += '<li>'+esc(k)+'</li>'; });
    h += '</ul>';
    if(l.steps && l.steps.length){
      h += '<div class="subh steps">Technique, step by step</div><ul class="steps-ol">';
      l.steps.forEach(function(s,i){
        h += '<li><span class="sn">'+(i+1)+'</span><span><b>'+esc(s.name)+'.</b> <span>'+esc(s.detail)+'</span></span></li>';
      });
      h += '</ul>';
    }
    h += '<div class="subh avoid">Common mistakes</div><ul class="ul">';
    l.mistakes.forEach(function(k){ h += '<li>'+esc(k)+'</li>'; });
    h += '</ul>';
    h += '<div class="subh practice">Practice</div><div class="practice-box">'+esc(l.practice)+'</div>';
    h += '</div></div>';
    return h;
  }

  function viewDownloads(){
    var h = '<div class="mhead"><div class="eyebrow">RESOURCES</div><h1>Downloads &amp; files</h1></div>';
    h += '<p class="muted">Every course file, ready to keep. PDFs open in any browser; PPTX files open in PowerPoint, Keynote, or Google Slides.</p>';
    h += '<h2 class="section-h">Core materials</h2><div class="dl-grid">';
    C.materials.forEach(function(f){
      h += '<div class="dl"><span class="tag">PDF</span><h3>'+esc(f.title)+'</h3><p>'+esc(f.desc)+'</p>'
        + '<div class="row"><a class="btn" href="'+esc(f.file)+'" download>&#8681; Download</a>'
        + '<a class="btn ghost" href="'+esc(f.file)+'" target="_blank" rel="noopener">Open</a></div></div>';
    });
    h += '</div>';
    h += '<h2 class="section-h">Slide decks</h2><div class="dl-grid">';
    C.modules.forEach(function(m){
      h += '<div class="dl"><span class="tag">MODULE '+pad(m.n)+'</span><h3>'+esc(shortTitle(m.title))+'</h3>'
        + '<p>9-slide deck. View as PDF or edit the PPTX.</p>'
        + '<div class="row"><a class="btn" href="'+esc(m.deckPdf)+'" download>&#8681; PDF</a>'
        + '<a class="btn ghost" href="'+esc(m.deckPptx)+'" download>&#8681; PPTX</a></div></div>';
    });
    h += '</div>';
    return h;
  }

  function viewFaculty(){
    var h = '<div class="mhead"><div class="eyebrow">RESOURCES</div><h1>Your video library</h1></div>';
    h += '<p class="muted">Every linked teacher is free to watch and widely respected. Bookmark them.</p>';
    h += '<div class="faculty"><h2>The complete free faculty</h2><ul>';
    C.sources.forEach(function(s){
      h += '<li><a href="'+esc(s.url)+'" target="_blank" rel="noopener">'+esc(s.label)+'</a></li>';
    });
    h += '</ul></div>';
    return h;
  }

  function viewAbout(){
    var h = '<div class="mhead"><div class="eyebrow">ABOUT</div><h1>Install &amp; about</h1></div>';
    h += '<div class="callout"><b>Install this app:</b> on a phone, open the browser menu and choose <i>Add to Home Screen</i>. On a laptop, look for the install icon in the address bar. It then works offline like a normal app.</div>';
    h += '<h2 class="section-h">About this program</h2>';
    h += '<p class="muted">'+esc(C.title)+' - '+esc(C.subtitle)+'. A self-paced curriculum of '+totalLessons+' lessons across '+C.modules.length+' modules, built on free, highly credible video lessons (classically trained chefs, tested-recipe institutions, food-science educators, and USDA / FoodSafety.gov for safety). Your progress is saved on this device.</p>';
    h += '<h2 class="section-h">Your progress data</h2>';
    h += '<p class="muted">Progress is stored only in this browser, on this device. Clearing your browser data, or opening the app on a different device, starts fresh.</p>';
    h += '<button class="reset-link" data-action="reset">Reset all my progress</button>';
    h += '<h2 class="section-h">License &amp; credits</h2>';
    h += '<p class="muted">&copy; 2026 Tin Roof Tek, LLC. This program is licensed under '
       + '<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a> '
       + '(Attribution &mdash; NonCommercial &mdash; ShareAlike). All rights not granted by that license are reserved. '
       + 'For commercial use, please contact Tin Roof Tek, LLC. See the included LICENSE.md for full terms.</p>';
    h += '<p class="muted">Safety temperatures sourced from USDA FSIS and FoodSafety.gov. All linked video resources are free to access and remain the property of their owners.</p>';
    return h;
  }

  /* ---------- router ---------- */
  function render(){
    var route = (location.hash || "#/home").replace(/^#\/?/,"");
    if(!route) route = "home";
    var view = $("#view");
    var html;
    if(route.indexOf("module/")===0){
      html = viewModule(parseInt(route.split("/")[1],10));
    } else if(route==="downloads"){ html = viewDownloads(); }
    else if(route==="faculty"){ html = viewFaculty(); }
    else if(route==="about"){ html = viewAbout(); }
    else { route="home"; html = viewHome(); }
    view.innerHTML = html;
    markActiveNav(route.indexOf("module/")===0 ? route : route);
    window.scrollTo(0,0);
    closeDrawer();
  }

  /* ---------- events ---------- */
  function go(route){ location.hash = "#/"+route; }

  document.addEventListener("click", function(e){
    var t = e.target;
    // nav / route links
    var routeEl = t.closest("[data-route]");
    if(routeEl){ e.preventDefault(); go(routeEl.getAttribute("data-route")); return; }

    var act = t.closest("[data-action]");
    if(act){
      var a = act.getAttribute("data-action");
      if(a==="toggleMenu"){
        e.preventDefault();
        var menu = document.getElementById(act.getAttribute("data-menu"));
        var wasOpen = menu.classList.contains("open");
        closeMenus();
        if(!wasOpen) menu.classList.add("open");
        e.stopPropagation();
        return;
      }
      if(a==="toggleDone"){
        e.preventDefault(); e.stopPropagation();
        var lz = act.closest(".lesson");
        var id = lz.getAttribute("data-lesson");
        var nowDone = !isDone(id);
        setDone(id, nowDone);
        lz.classList.toggle("done", nowDone);
        // refresh complete button state if present
        syncModuleButton(lz);
        return;
      }
      if(a==="toggleLesson"){
        var lz2 = act.closest(".lesson");
        lz2.classList.toggle("open");
        return;
      }
      if(a==="toggleModule"){
        var n = parseInt(act.getAttribute("data-n"),10);
        var m = moduleByN(n);
        var makeDone = !moduleDone(m);
        m.lessons.forEach(function(l){ setDone(l.id, makeDone); });
        render();
        return;
      }
      if(a==="reset"){
        if(confirm("Reset all progress on this device? This cannot be undone.")){
          state = {done:[]}; save(state); refreshProgress(); render();
        }
        return;
      }
    }
    // click outside menus closes them
    closeMenus();
  });

  function syncModuleButton(lessonEl){
    // re-render module view lightly: simplest is full render
    var route = (location.hash||"").replace(/^#\/?/,"");
    if(route.indexOf("module/")===0){
      var btn = document.querySelector(".complete-btn");
      if(btn){
        var n = parseInt(btn.getAttribute("data-n"),10);
        var m = moduleByN(n);
        var all = moduleDone(m);
        btn.classList.toggle("is-done", all);
        btn.innerHTML = all ? "&#10003; Module complete - tap to reopen" : "Mark this module complete";
      }
    }
  }

  function closeMenus(){
    document.querySelectorAll(".menu.open").forEach(function(m){ m.classList.remove("open"); });
  }

  /* ---------- mobile drawer ---------- */
  function openDrawer(){ document.getElementById("app").classList.add("nav-open"); }
  function closeDrawer(){ document.getElementById("app").classList.remove("nav-open"); }
  document.getElementById("menuBtn").addEventListener("click", openDrawer);
  document.getElementById("scrim").addEventListener("click", closeDrawer);

  window.addEventListener("hashchange", render);

  /* ---------- install (Add to Home Screen) ---------- */
  var deferredPrompt = null;
  var installBtn = document.getElementById("installBtn");
  function isStandalone(){
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches)
        || window.navigator.standalone === true;
  }
  function showInstall(){ if(installBtn && !isStandalone()) installBtn.hidden = false; }
  function hideInstall(){ if(installBtn) installBtn.hidden = true; }
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault(); deferredPrompt = e; showInstall();
  });
  if(installBtn){
    installBtn.addEventListener("click", function(){
      if(deferredPrompt){
        deferredPrompt.prompt();
        if(deferredPrompt.userChoice){ deferredPrompt.userChoice.then(function(){ deferredPrompt=null; hideInstall(); }); }
        else { deferredPrompt=null; hideInstall(); }
      } else {
        // No native prompt (e.g. iOS Safari) - send them to the instructions
        go("about");
      }
    });
  }
  window.addEventListener("appinstalled", function(){ deferredPrompt=null; hideInstall(); });
  // Show a manual install button on iOS (no beforeinstallprompt there)
  (function(){
    var ua = window.navigator.userAgent || "";
    var isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    if(isIOS && !isStandalone()) showInstall();
  })();

  /* ---------- init ---------- */
  buildNav();
  refreshProgress();
  render();

  /* ---------- service worker ---------- */
  if("serviceWorker" in navigator){
    window.addEventListener("load", function(){
      navigator.serviceWorker.register("sw.js").catch(function(){});
    });
  }
})();
