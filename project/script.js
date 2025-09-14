// 平滑捲動到 #dept
function scrollToDept(e){
  if(e) e.preventDefault();
  const target = document.getElementById('dept');
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

(function(){
  // 是否尊重使用者「降低動效」設定
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function smoothScrollTo(el){
    if (!el) return;
    if (prefersReduce) {
      el.scrollIntoView(); // 直接到位，不做動畫
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // 1) 攔截導覽列或頁面內所有 href 以 # 開頭的連結
  document.addEventListener('click', function(e){
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;                   // 不是 hash 錨點就略過
    const hash = a.getAttribute('href');

    // 像 href="#" 或 href="#!" 這類不是真實錨點的，不處理
    if (!hash || hash.length <= 1 || hash === '#!') return;

    const id = decodeURIComponent(hash.slice(1));
    const target = document.getElementById(id);
    if (!target) return;              // 找不到對應元素就讓瀏覽器自己處理

    e.preventDefault();               // 阻止預設「瞬間跳轉」
    smoothScrollTo(target);           // 平滑滑動

    // 更新網址 hash（不觸發預設跳轉）
    if (history.pushState) {
      history.pushState(null, '', '#'+id);
    } else {
      // 舊瀏覽器備援，可能會瞬跳（已經 preventDefault，大多不會）
      location.hash = id;
    }
  });

  // 2) 保留你原本的 scrollToDept()，改用同一套平滑邏輯
  window.scrollToDept = function(e){
    if (e) e.preventDefault();
    const target = document.getElementById('dept');
    smoothScrollTo(target);
    if (history.pushState) history.pushState(null, '', '#dept');
  };
})();

/* 背景「首段平移」：在前 70vh 的捲動，把背景從 0% 補間到 100% */
(function () {
  const root = document.documentElement;
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 在多少視窗高度內完成平移：60~80 之間都可，70vh 比較自然
  const PAN_DISTANCE_VH = 70;

  let ticking = false;

  function update() {
    const max = window.innerHeight * (PAN_DISTANCE_VH / 100);
    // 只在頁面頂端的前 max 區間內做平移，之後就固定在 100%
    const y = Math.max(0, Math.min(window.scrollY, max));
    const t = max ? (y / max) : 0;          // 0 ~ 1
    const pos = Math.round(t * 100);        // 0% ~ 100%
    root.style.setProperty('--bg-pos', pos + '%');
    ticking = false;
  }

  function onScroll() {
    if (prefersReduce) return;              // 尊重「降低動效」
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update(); // 初始設為 0%
})();
