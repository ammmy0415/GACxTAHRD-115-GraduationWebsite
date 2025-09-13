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