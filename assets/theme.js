/*
  EgyField Theme Controller
  - Handles theme detection (saved, then system)
  - Applies theme to <html data-theme="...">
  - Persists selection in localStorage
  - Provides a toggle button with #theme-toggle
*/
(function(){
  const THEME_KEY = 'theme';
  const DARK_MQ = '(prefers-color-scheme: dark)';

  function getSystemTheme(){
    try { return window.matchMedia && window.matchMedia(DARK_MQ).matches ? 'dark' : 'light'; }
    catch(_) { return 'light'; }
  }

  function getSavedTheme(){
    try {
      const v = localStorage.getItem(THEME_KEY);
      return (v === 'light' || v === 'dark') ? v : null;
    } catch(_) { return null; }
  }

  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    // Update toggle UI if present
    const btn = document.getElementById('theme-toggle');
    if(btn){
      btn.setAttribute('aria-pressed', theme === 'dark');
      const icon = btn.querySelector('[data-icon]');
      const text = btn.querySelector('[data-text]');
      if(icon){ icon.textContent = theme === 'dark' ? '🌙' : '☀️'; }
      if(text){ text.textContent = theme === 'dark' ? 'Dark' : 'Light'; }
      btn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }

  function saveTheme(theme){
    try { localStorage.setItem(THEME_KEY, theme); } catch(_){}
  }

  function currentTheme(){
    return document.documentElement.getAttribute('data-theme') || 'light';
  }

  function toggleTheme(){
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    saveTheme(next);
  }

  function initTheme(){
    const saved = getSavedTheme();
    const initial = saved || getSystemTheme();
    applyTheme(initial);

    // If user did not save a choice, follow system changes live
    if(!saved && window.matchMedia){
      try {
        const mq = window.matchMedia(DARK_MQ);
        if(mq && mq.addEventListener){
          mq.addEventListener('change', (e)=>{
            applyTheme(e.matches ? 'dark' : 'light');
          });
        } else if (mq && mq.addListener) {
          mq.addListener((e)=>{ applyTheme(e.matches ? 'dark' : 'light'); });
        }
      } catch(_){}
    }

    // Bind toggle
    const btn = document.getElementById('theme-toggle');
    if(btn){ btn.addEventListener('click', toggleTheme); }
  }

  // Expose for debugging if needed
  window.EgyFieldTheme = { getSavedTheme, getSystemTheme, applyTheme, toggleTheme, initTheme };

  // DOM ready init
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
