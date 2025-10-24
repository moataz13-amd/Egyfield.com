  // Google Translate integration
  let _gtLoaded = false;
  function loadGoogleTranslate(){
    if(_gtLoaded) return;
    // Hidden container for Google widget
    if(!document.getElementById('google_translate_element')){
      const div = document.createElement('div');
      div.id = 'google_translate_element';
      div.style.position='fixed'; div.style.right='-9999px'; div.style.bottom='-9999px';
      document.body.appendChild(div);
    }
// Observe catalog grid for changes and re-run detailsButtonsInit when cards are added/modified
function observeCatalogForDetails(){
  const grid = document.querySelector('.grid');
  if(!grid || grid.__detailsObserverAttached) return;
  const mo = new MutationObserver(()=>{ try{ detailsButtonsInit(); }catch(_){} });
  mo.observe(grid, { childList: true, subtree: true });
  grid.__detailsObserverAttached = true;
}
// Insert a semantic navigation bar for separate catalog pages (all.html, fresh.html, etc.)
function ensureCatalogPageNav(){
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  // Avoid duplicates
  if(document.querySelector('.catalog-page-nav')) return;

  const nav = document.createElement('nav');
  nav.className = 'catalog-page-nav';
  nav.setAttribute('aria-label','Product categories');
  const ul = document.createElement('ul'); ul.setAttribute('role','tablist');
  const items = [
    {href:'all.html', key:'filter_all', label:'All'},
    {href:'fresh.html', key:'filter_fresh', label:'Fresh'},
    {href:'frozen.html', key:'filter_frozen', label:'Frozen'},
    {href:'pickled.html', key:'filter_pickled', label:'Pickled'},
    {href:'grains.html', key:'filter_grains', label:'Grains'}
  ];
  items.forEach(it=>{
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = it.href;
    a.setAttribute('role','tab');
    a.setAttribute('data-i18n', it.key);
    a.textContent = (L[lang] && L[lang][it.key]) ? L[lang][it.key] : it.label;
    const isActive = page===it.href.toLowerCase();
    if(isActive){
      a.classList.add('active');
      a.setAttribute('aria-selected','true');
    } else {
      a.setAttribute('aria-selected','false');
    }
    li.appendChild(a); ul.appendChild(li);
  });
  nav.appendChild(ul);

  // Insert into the page near the top of main content
  const main = document.querySelector('main');
  const firstSection = main ? main.querySelector('.section') : null;
  if(firstSection){
    firstSection.insertBefore(nav, firstSection.firstChild);
  } else if (main) {
    main.insertBefore(nav, main.firstChild);
  } else {
    document.body.insertBefore(nav, document.body.firstChild);
  }
}
function fixHomeLink(){
  const inProducts = /\/products\//.test(location.pathname);
  const links = document.querySelectorAll('a');
  links.forEach(a=>{
    const key = a.getAttribute('data-i18n')||'';
    const href = a.getAttribute('href')||'';
    const isHome = key==='home' || href.endsWith('index.html') || href==='#home' || href==='index.html';
    if(!isHome) return;
    // Normalize to explicit index.html path for reliable navigation
    const correct = inProducts ? '../index.html' : 'index.html';
    a.setAttribute('href', correct);
  });
}
function ensureHomeLink(){
  const inProducts = /\/products\//.test(location.pathname);
  const home = document.querySelector('header nav a[data-i18n="home"], header .lang-toggle a[data-i18n="home"]');
  const logoLink = document.querySelector('header .nav .logo');
  if(!home) return;
  const correct = inProducts ? '../index.html' : 'index.html';
  home.setAttribute('href', correct);
  // Force navigation to the TOP of homepage and clear any hash like #catalog
  home.addEventListener('click', (e)=>{
    try{ e.preventDefault(); e.stopPropagation(); }catch(_){ }
    try { sessionStorage.setItem('force_home_top', '1'); } catch(_) {}
    const targetHref = correct.split('#')[0];
    // Clear any existing hash on the current URL by replacing state to a hashless path relative to current dir
    try { history.replaceState(null, '', targetHref); } catch(_) {}
    // Navigate explicitly using the same relative href (works in file:, local server paths, etc.)
    window.location.href = targetHref;
    // Fallback: ensure scroll top in case navigation is prevented by environment
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch(_) { window.scrollTo(0,0); }
  }, { capture: true });

  // Apply same behavior to clicking the logo link
  if (logoLink) {
    logoLink.setAttribute('href', correct);
    logoLink.addEventListener('click', (e)=>{
      try{ e.preventDefault(); e.stopPropagation(); }catch(_){ }
      try { sessionStorage.setItem('force_home_top', '1'); } catch(_) {}
      const targetHref = correct.split('#')[0];
      try { history.replaceState(null, '', targetHref); } catch(_) {}
      window.location.href = targetHref;
      try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch(_) { window.scrollTo(0,0); }
    }, { capture: true });
  }
}
    // Global init callback
    window.googleTranslateElementInit = function(){
      /* global google */
      try{ new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'ar,en', autoDisplay: false}, 'google_translate_element'); }catch(e){}
    };
    const s = document.createElement('script');
    s.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(s);
    _gtLoaded = true;
  }
  function setGoogleLang(lang){
    loadGoogleTranslate();
    // Try to switch when widget becomes available
    let tries = 0;
    const maxTries = 50; // ~10s
    const tick = setInterval(()=>{
      tries++;
      const sel = document.querySelector('select.goog-te-combo');
      if(sel){
        sel.value = lang;
        sel.dispatchEvent(new Event('change'));
        clearInterval(tick);
      } else if (tries >= maxTries) {
        clearInterval(tick);
      }
    }, 200);
  }
  // Ensure common elements have data-i18n so setLang can translate them
  function ensureI18nAttributes(){
    const navLinks = document.querySelectorAll('header nav a, header .lang-toggle a');
    navLinks.forEach(a=>{
      const k = a.getAttribute('data-i18n');
      if(k) return;
      const href = (a.getAttribute('href')||'').split('?')[0];
      if(href.endsWith('index.html')) a.setAttribute('data-i18n','home');
      else if(href.endsWith('products.html')) a.setAttribute('data-i18n','products');
      else if(href.endsWith('about.html')) a.setAttribute('data-i18n','about');
      else if(href.endsWith('certificates.html')) a.setAttribute('data-i18n','certs');
      else if(href.endsWith('articles.html')) a.setAttribute('data-i18n','articles');
      else if(href.endsWith('contact.html')) a.setAttribute('data-i18n','contact');
    });
    // RFQ buttons/links
    document.querySelectorAll("a[href*='contact.html?product=']").forEach(a=>{
      if(!a.getAttribute('data-i18n')) a.setAttribute('data-i18n','request_quote');
    });
  }
const L = {
  ar: {
    home:"الرئيسية", products:"المنتجات", about:"من نحن", certs:"الشهادات", articles:"المقالات", contact:"اتصل بنا",
    show_more: "عرض المزيد",
    show_less: "عرض أقل",
    hero_h1:"مورد مصري موثوق للخضروات والفواكه — جاهزون للتصدير الآن",
    hero_p:"EgyField تقدم تعبئة بمعايير الاتحاد الأوروبي، شحن سريع، وتسعير FOB/CIF تنافسي.",
    hero_cta:"اطلب عرض سعر الآن",
    kpi1:"+80 منتج", kpi2:"+12 دولة", kpi3:"+50 عميل",
    products_h2:"كتالوج المنتجات",
    filter_all:"الكل", filter_fresh:"طازج", filter_frozen:"مجمد", filter_pickled:"مخللات", filter_grains:"حبوب",
    contact_h2:"طلب عرض سعر", contact_p:"املأ البيانات وسنتواصل خلال 24 ساعة.",
    form_name:"اسم الشركة", form_email:"البريد الإلكتروني", form_country:"الدولة",
    form_product:"المنتج", form_qty:"الكمية (طن)", form_msg:"رسالتك", form_submit:"إرسال الطلب",
    footer:"© EgyField. جميع الحقوق محفوظة.",
    about_h2:"عن إيجي فيلد", about_p:"تأسست إيجي فيلد في عام 2015 وتوسعت عالميًا في 2018. ننمو عبر الجودة والثقة والقيمة، ونبني شراكات قوية بينما نقدم منتجات وخدمات مميزة.",
    certs_h2:"شهادات الجودة",
    thanks:"تم استلام طلبك. سنتواصل خلال 24 ساعة.",
    request_quote:"اطلب عرض سعر",
    view_details:"عرض التفاصيل",
    login_h2:"تسجيل الدخول",
    email_label:"البريد الإلكتروني",
    password_label:"كلمة المرور",
    login_btn:"تسجيل الدخول",
    register_h2:"إنشاء حساب",
    register_btn:"تسجيل",
    have_account:"لديك حساب؟",
    no_account:"ليس لديك حساب؟",
    reset:"استعادة",
    register:"تسجيل",
    login:"تسجيل الدخول"
  },
  en: {
    home:"Home", products:"Products", about:"About", certs:"Certificates", articles:"Articles", contact:"Contact",
    show_more: "Show More",
    show_less: "Show Less",
    hero_h1:"Trusted Egyptian supplier of fresh & frozen produce — export-ready",
    hero_p:"EgyField delivers EU-grade packing, fast shipping, and competitive FOB/CIF pricing.",
    hero_cta:"Request a Quote",
    kpi1:"+80 products", kpi2:"+12 countries", kpi3:"+50 clients",
    products_h2:"Product Catalog",
    filter_all:"All", filter_fresh:"Fresh", filter_frozen:"Frozen", filter_pickled:"Pickled", filter_grains:"Grains",
    contact_h2:"Request a Quote", contact_p:"Fill the form and we'll reply within 24h.",
    form_name:"Company Name", form_email:"Email", form_country:"Country",
    form_product:"Product", form_qty:"Quantity (MT)", form_msg:"Message", form_submit:"Send Request",
    footer:"© EgyField. All rights reserved.",
    about_h2:"About EgyField", about_p:"Founded in 2015, expanded globally in 2018. We grow through quality, trust, and value—building strong partnerships and delivering unique products and services.",
    certs_h2:"Certifications",
    thanks:"Your request has been received. We'll reach out within 24 hours.",
    request_quote:"Request Quote",
    view_details:"View Details",
    login_h2:"Login",
    email_label:"Email",
    password_label:"Password",
    login_btn:"Login",
    register_h2:"Register",
    register_btn:"Register",
    have_account:"Already have an account?",
    no_account:"Don't have an account?",
    reset:"Reset",
    register:"Register",
    login:"Login"
  }
};

// Ensure Request Quote button is present on product pages
function ensureProductRequestQuote(){
  if(!/\/products\//.test(location.pathname)) return;
  const slug = location.pathname.split('/').pop().replace(/\.html$/, '');
  const href = `../contact.html?product=${slug}`; // always one level up from /products/
  const main = document.querySelector('main'); if(!main) return;
  const firstSection = main.querySelector('.section'); if(!firstSection) return;
  let actions = firstSection.querySelector('.actions-row');
  if(!actions){
    actions = document.createElement('div');
    actions.className='actions-row';
    const after = firstSection.firstChild && firstSection.firstChild.nextSibling ? firstSection.firstChild.nextSibling : firstSection.firstChild;
    firstSection.insertBefore(actions, after);
  }
  const exists = Array.from(actions.querySelectorAll('a')).some(a=> (a.getAttribute('href')||'').includes('contact.html?product='));
  if(exists) return;
  const a = document.createElement('a');
  a.className='btn-outline';
  a.href = href;
  a.setAttribute('data-i18n','request_quote');
  a.textContent = (L[lang] && L[lang].request_quote) ? L[lang].request_quote : 'Request Quote';
  actions.appendChild(a);
}
// Map of homepage card IDs to existing product detail pages
const ProductPages = {
  'broccoli':'products/broccoli.html',
  'cabbage-green':'products/cabbage-green.html',
  'cabbage-red':'products/cabbage-red.html',
  'cantaloupe-melon':'products/cantaloupe-melon.html',
  'carrots':'products/carrots.html',
  'cauliflower':'products/cauliflower.html',
  'cucumbers':'products/cucumbers.html',
  'eggplant':'products/eggplant.html',
  'figs':'products/figs.html',
  'fresh-herbs-mix-parsley-dill-coriander':'products/fresh-herbs-mix-parsley-dill-coriander.html',
  'garlic':'products/garlic.html',
  'grapes-green':'products/grapes-green.html',
  'grapes-red':'products/grapes-red.html',
  'green-beans':'products/green-beans.html',
  'guava':'products/guava.html',
  'lemons':'products/lemons.html',
  'lettuce':'products/lettuce.html',
  'mangoes':'products/mangoes.html',
  'okra':'products/okra.html',
  'oranges':'products/oranges.html',
  'peppers-hot':'products/peppers-hot.html',
  'peppers-sweet':'products/peppers-sweet.html',
  'tomatoes':'products/tomatoes.html',
  'potatoes':'products/potatoes.html',
  'red-onions':'products/red-onions.html',
  'white-onions':'products/white-onions.html',
  'spinach':'products/spinach.html',
  'watermelon':'products/watermelon.html',
  'pomegranates':'products/pomegranates.html',
  // Frozen
  'frozen-artichoke-hearts':'products/frozen-artichoke-hearts.html',
  'frozen-broccoli':'products/frozen-broccoli.html',
  'frozen-carrots':'products/frozen-carrots.html',
  'frozen-cauliflower':'products/frozen-cauliflower.html',
  'frozen-chili-paste':'products/frozen-chili-paste.html',
  'frozen-corn-kernels':'products/frozen-corn-kernels.html',
  'frozen-eggplant-slices':'products/frozen-eggplant-slices.html',
  'frozen-garlic-paste':'products/frozen-garlic-paste.html',
  'frozen-green-beans':'products/frozen-green-beans.html',
  'frozen-guava-pulp':'products/frozen-guava-pulp.html',
  'frozen-herbs-mix-parsley-dill-coriander':'products/frozen-herbs-mix-parsley-dill-coriander.html',
  'frozen-lemon-juice-cubes':'products/frozen-lemon-juice-cubes.html',
  'frozen-mango-chunks':'products/frozen-mango-chunks.html',
  'frozen-mixed-vegetables':'products/frozen-mixed-vegetables.html',
  'frozen-molokhia-leaves':'products/frozen-molokhia-leaves.html',
  'frozen-okra':'products/frozen-okra.html',
  'frozen-onion-cubes':'products/frozen-onion-cubes.html',
  'frozen-peas':'products/frozen-peas.html',
  'frozen-pepper-strips-hot':'products/frozen-pepper-strips-hot.html',
  'frozen-pepper-strips-sweet':'products/frozen-pepper-strips-sweet.html',
  'frozen-pomegranate-seeds':'products/frozen-pomegranate-seeds.html',
  'frozen-spinach':'products/frozen-spinach.html',
  'frozen-strawberry':'products/frozen-strawberry.html',
  'frozen-tomato-paste-cubes':'products/frozen-tomato-paste-cubes.html',
  'frozen-zucchini-slices':'products/frozen-zucchini-slices.html',
  // Pickled
  'pickled-artichokes':'products/pickled-artichokes.html',
  'pickled-black-olives':'products/pickled-black-olives.html',
  'pickled-cabbage-red':'products/pickled-cabbage-red.html',
  'pickled-cabbage-white':'products/pickled-cabbage-white.html',
  'pickled-carrots':'products/pickled-carrots.html',
  'pickled-chili-mix':'products/pickled-chili-mix.html',
  'pickled-cucumber':'products/pickled-cucumbers.html',
  'pickled-garlic':'products/pickled-garlic.html',
  'pickled-green-beans':'products/pickled-green-beans.html',
  'pickled-green-olives':'products/pickled-green-olives.html',
  'pickled-guava':'products/pickled-guava.html',
  'pickled-lemon':'products/pickled-lemon.html',
  'pickled-mango-slices':'products/pickled-mango-slices.html',
  'pickled-onion':'products/pickled-onion.html',
  // Grains
  'grains-rice':'products/grains-rice.html',
  'grains-wheat':'products/grains-wheat.html',
  'grains-barley':'products/grains-barley.html',
  'grains-corn':'products/grains-corn.html',
  'grains-oats':'products/grains-oats.html'
};

function detailsButtonsInit(){
  // Do not inject View Details buttons on About page, Articles listing, or inside any /articles/ page
  try {
    const pathname = (location.pathname || '').toLowerCase();
    const last = (pathname.split('/').pop() || '').toLowerCase();
    const isAbout = last === 'about.html' || last === 'about';
    // articles listing can be articles.html, /articles, or /articles/
    const isArticlesList = last === 'articles.html' || last === 'articles' || /\/articles\/?$/.test(pathname);
    // any nested article detail pages under /articles/
    const inArticlesDir = /(^|\/)articles\//.test(pathname);
    if (isAbout || isArticlesList || inArticlesDir) return;
  } catch(_) {}
  const cards = document.querySelectorAll('.card');
  cards.forEach(card=>{
    // Skip article cards that already link to articles
    try {
      const aWrap = card.closest('a.card');
      if (aWrap) {
        const href = (aWrap.getAttribute('href')||'');
        // match relative or absolute links to articles directory
        if (/(^|\/)articles\//.test(href)) return; // don't modify article cards
      }
    } catch(_) {}
    const body = card.querySelector('.body'); if(!body) return;
    let actions = body.querySelector('.actions-row');
    if(!actions){ actions = document.createElement('div'); actions.className='actions-row'; body.appendChild(actions); }
    // Determine slug
    let slug = card.id || '';
    if(!slug){
      const rfq = actions.querySelector("a[href*='contact.html?product=']");
      if(rfq){
        const href = rfq.getAttribute('href')||'';
        const m = href.match(/product=([^&]+)/);
        if(m) slug = m[1];
      }
    }
    // Fallback: derive from <h3> text
    if(!slug){
      const h3 = body.querySelector('h3');
      if(h3){ slug = h3.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''); }
    }
    if(!slug) return; // cannot determine
    const inProducts = /\/products\//.test(location.pathname);
    let mapped = ProductPages[slug] || (`products/${slug}.html`);
    // If we're already under /products/, make the link relative without the leading directory
    if(inProducts && mapped.startsWith('products/')){
      mapped = mapped.replace(/^products\//,'');
    }
    const link = mapped;
    // Avoid duplicate by checking if a View Details button already exists
    const exists = actions.querySelector("a[data-i18n='view_details']");
    if(exists) return;
    const a = document.createElement('a');
    a.className = 'btn-outline';
    a.href = link;
    a.setAttribute('data-i18n','view_details');
    a.textContent = (L[lang] && L[lang].view_details) ? L[lang].view_details : 'View Details';
    actions.appendChild(a);
  });
}
let lang = 'en'; // default English for B2B
function setLang(x){ lang=x; localStorage.setItem('lang',x);
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k = el.getAttribute('data-i18n');
    const val = (L[lang] && L[lang][k]) ? L[lang][k] : null;
    if(!val) return;
    const tag = el.tagName;
    if(tag==='INPUT' || tag==='TEXTAREA'){
      el.setAttribute('placeholder', val);
    } else if(tag==='SELECT'){
      // skip for now
    } else {
      el.textContent = val;
    }
  });
  // Override KPI counts at runtime (without changing i18n content)
  // Show +1500 clients for KPI #3 in both languages
  const kpi3El = document.querySelector('.kpis [data-i18n="kpi3"], [data-i18n="kpi3"].kpi, .kpi [data-i18n="kpi3"], [data-i18n="kpi3"].kpi-value');
  if(kpi3El){
    kpi3El.textContent = (lang==='ar') ? '+50 عميل' : '+50 clients';
  }
  // Auto-translate product quote links
  document.querySelectorAll("a[href^='contact.html?product=']").forEach(a=>{
    if(L[lang] && L[lang].request_quote) a.textContent = L[lang].request_quote;
  });
  document.dir = (lang==='ar')?'rtl':'ltr';
  document.documentElement.setAttribute('lang', lang);
  // Update language buttons active state
  document.querySelectorAll('header button[data-lang]').forEach(b=>{
    const isActive = b.getAttribute('data-lang')===lang;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
  });
}
function ensureLangButtons(){
  const nav = document.querySelector('header #navbar, header .lang-toggle');
  if(!nav) return;
  let arBtn = nav.querySelector('button[data-lang="ar"]');
  let enBtn = nav.querySelector('button[data-lang="en"]');
  if(!arBtn){
    arBtn = document.createElement('button');
    arBtn.textContent = 'AR';
    arBtn.setAttribute('data-lang','ar');
    arBtn.type = 'button';
    arBtn.addEventListener('click', ()=>setLang('ar'));
    nav.appendChild(arBtn);
  }
  if(!enBtn){
    enBtn = document.createElement('button');
    enBtn.textContent = 'EN';
    enBtn.setAttribute('data-lang','en');
    enBtn.type = 'button';
    enBtn.addEventListener('click', ()=>setLang('en'));
    nav.appendChild(enBtn);
  }
  // sync active state
  document.querySelectorAll('header button[data-lang]').forEach(b=>{
    const isActive = b.getAttribute('data-lang')===lang;
    b.classList.toggle('active', isActive);
    b.setAttribute('aria-pressed', String(isActive));
  });
}

function initLang(){ const saved=localStorage.getItem('lang'); if(saved) lang=saved; setLang(lang); }
function navActive(){
  const p = location.pathname.split('/').pop()||'index.html';
  const inArticles = /\/articles\//.test(location.pathname);
  const pageKey = (
    p==='index.html' ? 'home' :
    p==='products.html' ? 'products' :
    p==='about.html' ? 'about' :
    p==='certificates.html' ? 'certs' :
    (p==='articles.html' || inArticles) ? 'articles' :
    p==='contact.html' ? 'contact' : ''
  );
  document.querySelectorAll('header nav a').forEach(a=>{
    const href = a.getAttribute('href')||'';
    const key = a.getAttribute('data-i18n')||'';
    if(href===p || (pageKey && key===pageKey)){
      a.classList.add('active');
    }
  });
}

// Ensure Articles link exists in navs across all pages
function ensureArticlesLink(){
  const nav = document.querySelector('header #navbar, header .lang-toggle');
  if(!nav) return;
  // Already exists?
  const exists = nav.querySelector("a[href$='articles.html']");
  if(exists) return;

  // Find Contact link to insert before it
  const contactLink = nav.querySelector("a[href$='contact.html']");
  const inProducts = /\/products\//.test(location.pathname);
  const prefix = inProducts ? '../' : '';

  const a = document.createElement('a');
  a.href = prefix + 'articles.html';
  a.setAttribute('data-i18n','articles');
  a.textContent = (L[lang] && L[lang].articles) ? L[lang].articles : 'Articles';

  if(contactLink && contactLink.parentNode===nav){
    nav.insertBefore(a, contactLink);
  } else {
    nav.appendChild(a);
  }
}
function fixCatalogLink(){
  // Disabled: do not rewrite any links to #catalog to avoid unexpected scrolling from Home
  return;
}
function ensureBrandLeft(){
  const nav = document.querySelector('header .nav');
  if(!nav) return;
  if(nav.querySelector('.brand-left')) return; // already present
  const logo = nav.querySelector('.logo');
  const nameText = logo?.querySelector('span')?.textContent?.trim() || 'EgyField';
  const badgeText = (logo?.querySelector('.badge')?.textContent?.trim()) || 'EXPORT';
  const div = document.createElement('div');
  div.className = 'brand-left';
  const name = document.createElement('span'); name.className='brand-name'; name.textContent=nameText;
  const badge = document.createElement('span'); badge.className='brand-badge'; badge.textContent=badgeText;
  div.appendChild(name); div.appendChild(badge);
  nav.insertBefore(div, nav.firstChild);
}
function ensureLogoImage(){
  const logo = document.querySelector('header .nav .logo'); if(!logo) return;
  const hasImg = !!logo.querySelector('img');
  if(hasImg) return;
  const inProducts = /\/products\//.test(location.pathname);
  const src = (inProducts? '../' : '') + 'logo.png';
  const img = document.createElement('img');
  img.src = src; img.alt = 'EgyField logo'; img.style.height = '36px'; img.style.marginRight='10px'; img.style.borderRadius='0px';
  logo.insertBefore(img, logo.firstChild);
}
// Ensure theme assets (CSS + JS) and toggle button exist on page
function ensureThemeAssets(){
  // CSS
  const hasThemeCss = Array.from(document.styleSheets || []).some(s=> (s.href||'').includes('/assets/theme.css'))
    || !!document.querySelector("link[href$='assets/theme.css'], link[href$='/assets/theme.css']");
  if(!hasThemeCss){
    const link = document.createElement('link');
    link.rel='stylesheet';
    const prefix = /\/products\//.test(location.pathname) ? '../' : '';
    link.href = prefix + 'assets/theme.css';
    document.head.appendChild(link);
  }
  // JS
  const hasThemeJs = !!document.querySelector("script[src$='assets/theme.js'], script[src$='/assets/theme.js']");
  if(!hasThemeJs){
    const s = document.createElement('script');
    const prefix = /\/products\//.test(location.pathname) ? '../' : '';
    s.src = prefix + 'assets/theme.js';
    document.body.appendChild(s);
  }
}
function ensureThemeToggle(){
  const existing = document.getElementById('theme-toggle');
  let btn = existing;
  if(!btn){
    btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.setAttribute('aria-pressed','false');
    btn.title = 'Switch theme';
    const icon = document.createElement('span'); icon.setAttribute('data-icon',''); icon.textContent='☀️';
    const text = document.createElement('span'); text.setAttribute('data-text',''); text.textContent='Light';
    btn.appendChild(icon); btn.appendChild(document.createTextNode(' ')); btn.appendChild(text);
  } else if (btn.parentElement) {
    // Detach from current parent (e.g., navbar)
    btn.parentElement.removeChild(btn);
  }
  btn.classList.add('theme-fab');
  document.body.appendChild(btn);
}
// Ensure a consistent, toggleable mobile navbar across all pages (including product pages)
function ensureMobileMenuScaffold(){
  const headerNavContainer = document.querySelector('header .nav');
  if(!headerNavContainer) return;

  // Ensure a #navbar element exists (convert legacy .lang-toggle nav if needed)
  let navbar = document.getElementById('navbar');
  if(!navbar){
    // Prefer converting an existing nav with links under header
    const legacyNav = headerNavContainer.querySelector('nav.lang-toggle, header nav');
    if(legacyNav){
      legacyNav.id = 'navbar';
      navbar = legacyNav;
    }
  }

  // If still no navbar, create an empty one to avoid JS/CSS assumptions breaking
  if(!navbar){
    navbar = document.createElement('nav');
    navbar.id = 'navbar';
    headerNavContainer.appendChild(navbar);
  }

  // Ensure a hamburger button exists
  let toggleBtn = headerNavContainer.querySelector('button.menu-toggle');
  if(!toggleBtn){
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'menu-toggle';
    toggleBtn.type = 'button';
    toggleBtn.textContent = '☰';
    toggleBtn.addEventListener('click', toggleMenu);
    // Insert before navbar for better layout
    headerNavContainer.insertBefore(toggleBtn, navbar);
  }

  // Auto-close menu when any header link is clicked (use capture to run early)
  if(!navbar.__closeOnClickBound){
    navbar.addEventListener('click', (e)=>{
      const a = e.target.closest && e.target.closest('a');
      if(!a) return;
      try{ document.getElementById('navbar')?.classList.remove('show'); }catch(_){}
    }, true);
    navbar.__closeOnClickBound = true;
  }

  // Also close menu when clicking dynamically injected "View Details" buttons
  if(!document.__closeOnViewDetailsBound){
    document.addEventListener('click', (e)=>{
      const el = e.target.closest && e.target.closest("a[data-i18n='view_details'], a.btn-outline[data-i18n='view_details']");
      if(!el) return;
      try{ document.getElementById('navbar')?.classList.remove('show'); }catch(_){ }
    }, true);
    document.__closeOnViewDetailsBound = true;
  }
}
// Global menu toggle for mobile across all pages
function closeNavbar(){ try{ document.getElementById('navbar')?.classList.remove('show'); }catch(_){} }
function toggleMenu(){
  const nav = document.getElementById('navbar');
  if(nav){ nav.classList.toggle('show'); }
}
function rfqInit(){
  const f = document.getElementById('rfq'); if(!f) return;
  const urlParams = new URLSearchParams(location.search);
  const qp = urlParams.get('product'); if(qp){ const sel=f.querySelector('select[name=product]'); if(sel) sel.value=qp; }
  
  f.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const d = Object.fromEntries(new FormData(f).entries());
    const payload = {
      timestamp: new Date().toISOString(),
      company: d.name || '',
      country: d.country || '',
      product: d.product || '',
      quantity_mt: d.qty || '',
      email: d.email || '',
      message: d.msg || ''
    };
    const GOOGLE_APPS_SCRIPT_WEBHOOK_URL = 'PUT_YOUR_GOOGLE_APPS_SCRIPT_WEBHOOK_URL_HERE';
    const FORMSPREE_URL = 'https://formspree.io/f/PUT_YOUR_FORM_ID';
    try{
      if(GOOGLE_APPS_SCRIPT_WEBHOOK_URL && !GOOGLE_APPS_SCRIPT_WEBHOOK_URL.includes('PUT_YOUR')){
        await fetch(GOOGLE_APPS_SCRIPT_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else if(FORMSPREE_URL && !FORMSPREE_URL.includes('PUT_YOUR')){
        const formData = new FormData();
        Object.keys(payload).forEach(k=>formData.append(k,payload[k]));
        await fetch(FORMSPREE_URL, { method: 'POST', body: formData });
      } else {
        const log = JSON.parse(localStorage.getItem('rfq_log')||'[]');
        log.push(payload); localStorage.setItem('rfq_log', JSON.stringify(log));
      }
    }catch(err){
      console.error('RFQ webhook error', err);
    }
    location.href='thanks.html';
  });

}
function filterInit(){
  const buttons = document.querySelectorAll('.filter-btn');
  if(!buttons.length) return;
  const catalog = document.getElementById('catalog');
  const getCat = el => ((el?.getAttribute?.('data-category')) || el?.dataset?.category || '').trim().toLowerCase();
  
  function applyFilter(category, opts){
    const options = Object.assign({ updateHash: true, scroll: true }, opts||{});
    // toggle active UI
    buttons.forEach(b=>{
      const isActive = getCat(b)===category;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
      b.setAttribute('aria-selected', String(isActive));
    });
    
    // filter cards
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index)=>{
      const cc = getCat(card);
      const show = (category==='all' || cc===category);
      if(show){
        card.classList.remove('is-hidden');
        // Only show first 8 cards, others will be shown by show more
        if (index < 8) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      } else {
        card.classList.add('is-hidden');
        card.style.display = 'none';
      }
    });
    
    // Update show more button state after filtering
    const showMoreBtn = document.querySelector('.show-more-btn');
    if (showMoreBtn) {
      const visibleCards = Array.from(cards).filter(card => !card.classList.contains('is-hidden'));
      if (visibleCards.length <= 8) {
        showMoreBtn.classList.add('hidden');
      } else {
        showMoreBtn.classList.remove('hidden');
      }
    }
    // update hash so links can be shared (only when allowed)
    if(options.updateHash){
      const base = '#catalog';
      const hash = category && category!=='all' ? `${base}/${category}` : base;
      if(location.hash !== hash){ location.hash = hash; }
    }
    // scroll to catalog (only when allowed)
    if(options.scroll && catalog){ catalog.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }
  // Bind clicks
  // Use event delegation to be resilient to dynamic DOM changes
  document.addEventListener('click', (ev)=>{
    const target = ev.target.closest && ev.target.closest('.filter-btn');
    if(!target) return;
    const c = getCat(target);
    const cat = (c||'all');
    applyFilter(cat, { updateHash: true, scroll: true });
  });
  // Apply initial from hash e.g., #catalog/fresh
  const hasCatalogHash = /^#catalog(?:\/([a-z-]+))?$/.test(location.hash||'');
  const m = (location.hash||'').match(/^#catalog(?:\/([a-z-]+))?$/);
  const initial = hasCatalogHash ? (m[1] || 'all') : 'all';
  // If URL already has #catalog, honor it and scroll; otherwise, just set filter without changing hash or scrolling
  applyFilter(initial, { updateHash: hasCatalogHash, scroll: hasCatalogHash });
  // React to hash changes (e.g., when set by other scripts or manual edits)
  window.addEventListener('hashchange', ()=>{
    const m2 = (location.hash||'').match(/^#catalog(?:\/([a-z-]+))?$/);
    const cat2 = m2 ? (m2[1] || 'all') : 'all';
    applyFilter(cat2, { updateHash: false, scroll: true });
  });
}
// Initialize show more functionality
function showMoreInit() {
  const showMoreBtn = document.querySelector('.show-more-btn');
  const catalog = document.getElementById('catalog');
  if (!catalog) return;
  
  // Get all visible cards (not hidden by filters)
  function getVisibleCards() {
    return Array.from(catalog.querySelectorAll('.card:not(.is-hidden)'));
  }
  
  let itemsToShow = 8; // Initial number of items to show
  const increment = 8; // Number of items to add each time

  if (!showMoreBtn) return;

  // Update button text based on language and visible cards
  function updateButtonText() {
    const visibleCards = getVisibleCards();
    const remaining = visibleCards.length - itemsToShow;
    const showMoreText = (L[lang] && L[lang].show_more) ? L[lang].show_more : 'Show More';
    const showLessText = (L[lang] && L[lang].show_less) ? L[lang].show_less : 'Show Less';
    
    if (remaining <= 0) {
      showMoreBtn.textContent = showLessText;
      showMoreBtn.classList.add('hidden');
    } else {
      showMoreBtn.textContent = `${showMoreText} (${Math.min(remaining, increment)}+)`;
      showMoreBtn.classList.remove('hidden');
    }
  }

  // Show more items
  function showMoreItems() {
    const visibleCards = getVisibleCards();
    const remainingCards = visibleCards.slice(itemsToShow, itemsToShow + increment);
    
    if (remainingCards.length === 0) {
      // If we've shown all cards, reset to initial state
      itemsToShow = 8;
      visibleCards.forEach((card, index) => {
        if (index >= itemsToShow) {
          card.style.display = 'none';
        } else {
          card.style.display = 'block';
        }
      });
      window.scrollTo({
        top: catalog.offsetTop - 50,
        behavior: 'smooth'
      });
    } else {
      // Show next set of cards
      remainingCards.forEach(card => {
        card.style.display = 'block';
      });
      itemsToShow += remainingCards.length;
      
      // Smooth scroll to the last shown card
      if (remainingCards.length > 0) {
        remainingCards[remainingCards.length - 1].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    }
    
    updateButtonText();
  }

  // Add click event listener
  showMoreBtn.addEventListener('click', showMoreItems);
  
  // Initial button text update
  updateButtonText();
}

// Run details buttons init as soon as possible
if (document.readyState !== 'loading') { 
  try{ detailsButtonsInit(); }catch(_){} 
  try{ showMoreInit(); }catch(_){} 
} else { 
  document.addEventListener('DOMContentLoaded', ()=>{ 
    try{ detailsButtonsInit(); }catch(_){} 
    try{ showMoreInit(); }catch(_){} 
  }, { once: true }); 
}

// On DOMContentLoaded, run the rest of initializers, with detailsButtonsInit first to ensure buttons are visible immediately
window.addEventListener('DOMContentLoaded', ()=>{
  // Apply non-critical image loading hints early
  try {
    (function optimizeImages(){
      // Skip the hero background image which is already marked eager/high priority
      const isHeroBg = (img)=> img.closest && img.closest('.hero-viewport .hero-bg');
      const imgs = document.querySelectorAll('img');
      imgs.forEach(img=>{
        if (isHeroBg(img)) return;
        if (!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
        if (!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
      });
    })();
  } catch(_){}
  // If navigation came from Home/Logo click, force top of homepage and clear hash once
  try {
    const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    const forceTop = sessionStorage.getItem('force_home_top') === '1';
    if (forceTop && page === 'index.html') {
      try { history.replaceState(null, '', 'index.html'); } catch(_) {}
      try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); } catch(_) { window.scrollTo(0,0); }
      sessionStorage.removeItem('force_home_top');
    }
  } catch(_) {}
  try{ detailsButtonsInit(); }catch(_){ }
  ensureI18nAttributes();
  initLang();
  ensureBrandLeft();
  ensureLogoImage();
  ensureThemeAssets();
  ensureThemeToggle();
  ensureMobileMenuScaffold();
  ensureLangButtons();
  ensureArticlesLink();
  fixHomeLink();
  fixCatalogLink();
  ensureHomeLink();
  ensureCatalogPageNav();
  navActive();
  rfqInit();
  ensureProductRequestQuote();
  filterInit();
  observeCatalogForDetails();
  // Global safety: close navbar on any anchor click (capture), outside click, and on pagehide
  if(!document.__globalNavCloseBound){
    document.addEventListener('click', (e)=>{
      // Close on any anchor click
      if(e.target && e.target.closest){
        const a = e.target.closest('a');
        if(a){ closeNavbar(); return; }
      }
      // Close when tapping outside the navbar when it's open
      try{
        const nav = document.getElementById('navbar');
        if(nav && nav.classList.contains('show')){
          const header = document.querySelector('header');
          const isInsideHeader = header && header.contains(e.target);
          if(!isInsideHeader){ closeNavbar(); }
        }
      }catch(_){ }
    }, true);
    window.addEventListener('pagehide', closeNavbar);
    window.addEventListener('beforeunload', closeNavbar);
    document.__globalNavCloseBound = true;
  }
});
