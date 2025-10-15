/*
  Universal Product Filtering (vanilla JS)
  - Works across pages that have category buttons (.filter-btn) and product items (.product or .card)
  - Uses data-category="fresh|frozen|pickled|grains" OR a category class on each product element
  - Highlights the active button and applies a smooth fade when hiding/showing
*/
(function(){
  'use strict';

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  function getCategoryFromEl(el){
    if(!el) return '';
    var d = (el.getAttribute && el.getAttribute('data-category')) || (el.dataset && el.dataset.category) || '';
    d = (d||'').trim().toLowerCase();
    if(d) return d;
    // fallback to class names
    var cats = ['all','fresh','frozen','pickled','grains'];
    for(var i=0;i<cats.length;i++){ if(el.classList && el.classList.contains(cats[i])) return cats[i]; }
    return '';
  }

  function setActive(category){
    $all('.filter-btn').forEach(function(btn){
      var isActive = getCategoryFromEl(btn)===category;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.setAttribute('aria-pressed', String(isActive));
    });
  }

  function showItem(el){
    if(!el) return;
    el.classList.remove('is-hidden');
    el.style.display = '';
    el.style.opacity = '1';
  }
  function hideItem(el){
    if(!el) return;
    el.classList.add('is-hidden');
    el.style.opacity = '0';
    // display:none is handled via CSS .is-hidden { display:none !important; }
  }

  function applyFilter(category, opts){
    var options = Object.assign({ updateHash: true, scroll: true }, opts||{});
    var items = $all('.product, .card');
    if(!items.length) return;
    for(var i=0;i<items.length;i++){
      var item = items[i];
      var itemCat = getCategoryFromEl(item);
      var show = (category==='all' || itemCat===category);
      if(show) showItem(item); else hideItem(item);
      item.setAttribute('aria-hidden', String(!show));
    }
    setActive(category);
    // Optional: update hash/scroll if a catalog section exists (only when allowed)
    var catalog = $('#catalog');
    if(catalog){
      if(options.updateHash){
        var base = '#catalog';
        var next = (category && category!=='all') ? (base + '/' + category) : base;
        if(location.hash !== next){ location.hash = next; }
      }
      if(options.scroll){
        try{ catalog.scrollIntoView({ behavior: 'smooth', block: 'start' }); }catch(_){/* no-op */}
      }
    }
  }

  function bind(){
    document.addEventListener('click', function(ev){
      var btn = ev.target && ev.target.closest ? ev.target.closest('.filter-btn') : null;
      if(!btn) return;
      var cat = getCategoryFromEl(btn) || 'all';
      applyFilter(cat, { updateHash: true, scroll: true });
    });
    window.addEventListener('hashchange', function(){
      var m = (location.hash||'').match(/^#catalog(?:\/([a-z-]+))?$/);
      var cat = m ? (m[1]||'all') : 'all';
      applyFilter(cat, { updateHash: false, scroll: true });
    });
  }

  function init(){
    bind();
    var hasCatalogHash = /^#catalog(?:\/([a-z-]+))?$/.test(location.hash||'');
    var m = (location.hash||'').match(/^#catalog(?:\/([a-z-]+))?$/);
    var cat = hasCatalogHash ? (m[1]||'all') : 'all';
    // If URL has #catalog, honor and scroll; otherwise, do not change hash or scroll on load
    applyFilter(cat, { updateHash: hasCatalogHash, scroll: hasCatalogHash });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
