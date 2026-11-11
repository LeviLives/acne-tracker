// SpeckLog site: Light / Dark mode (2026-11-11). Light by default, like the app. The choice is
// remembered for the whole site (localStorage), so following a link keeps the same mode. The
// first line of each page's <head> applies the saved mode before anything is drawn.
(function () {
  var KEY = 'specklog-mode';
  var root = document.documentElement;
  var chinese = root.lang === 'zh-Hans';
  function current() { return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'; }
  function apply(mode) {
    if (mode === 'dark') root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    try { localStorage.setItem(KEY, mode); } catch (e) {}
    var light = mode === 'dark';
    button.textContent = chinese ? (light ? '☀︎ 浅色' : '☾ 深色') : (light ? '☀︎ Light' : '☾ Dark');
    button.setAttribute('aria-label', chinese ? (light ? '切换到浅色模式' : '切换到深色模式')
                                               : (light ? 'Switch to light mode' : 'Switch to dark mode'));
  }
  var button = document.createElement('button');
  button.className = 'mode-toggle';
  button.type = 'button';
  button.addEventListener('click', function () { apply(current() === 'dark' ? 'light' : 'dark'); });
  document.body.appendChild(button);
  apply(current());
  // Another tab changed the mode: follow it.
  window.addEventListener('storage', function (e) { if (e.key === KEY) apply(e.newValue === 'dark' ? 'dark' : 'light'); });
})();
