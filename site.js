(() => {
  const MODE_KEY = 'specklog-mode';
  const LANGUAGE_KEY = 'specklog-language';
  const CHINESE = 'zh-Hans';
  const ENGLISH = 'en';
  const root = document.documentElement;
  const main = document.querySelector('main');
  if (!main) return;

  const pages = [
    { en: 'index.html', 'zh-Hans': 'support-zh.html', names: ['Support', '支持'] },
    { en: 'faq.html', 'zh-Hans': 'faq-zh.html', names: ['Questions & Answers', '常见问题'] },
    { en: 'updates.html', 'zh-Hans': 'updates-zh.html', names: ['What’s new', '更新记录'] },
    { en: 'privacy.html', 'zh-Hans': 'privacy-zh.html', names: ['Privacy Policy', '隐私政策'] },
    { en: 'terms.html', 'zh-Hans': 'terms-zh.html', names: ['Terms of Use', '使用条款'] },
  ];
  const file = location.pathname.split('/').pop() || 'index.html';
  const page = pages.find(entry => entry.en === file || entry[CHINESE] === file);
  if (!page) return;

  const stored = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };
  const remember = (key, value) => {
    try { localStorage.setItem(key, value); } catch {}
  };
  const isLanguage = (value) => value === ENGLISH || value === CHINESE;

  let language = root.lang === CHINESE ? CHINESE : ENGLISH;
  let dark = stored(MODE_KEY) === 'dark';
  let loadNumber = 0;
  const documents = new Map([[language, { title: document.title, html: main.innerHTML }]]);
  const copy = {
    en: {
      pages: 'Pages', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark',
      help: 'Problem?', controls: 'Site controls', loading: 'Loading…',
      failed: 'Couldn’t change the language. Please try again.',
    },
    'zh-Hans': {
      pages: '页面', language: '语言', theme: '外观', light: '浅色', dark: '深色',
      help: '遇到问题？', controls: '网站设置', loading: '正在加载…',
      failed: '没能切换语言，请重试。',
    },
  };

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="site-controls" role="group">
      <details class="site-pages">
        <summary class="site-control"><span class="pages-label"></span><span class="page-name"></span></summary>
        <nav class="page-menu"><ul></ul></nav>
      </details>
      <button class="site-control language-control" type="button"><span class="control-label"></span><span class="control-value"></span></button>
      <button class="site-control theme-control" type="button"><span class="control-label"></span><span class="control-value"></span></button>
      <p class="site-status" role="status" hidden></p>
    </div>`;
  document.body.insertBefore(header, main);

  const controls = header.querySelector('.site-controls');
  const details = header.querySelector('.site-pages');
  const summary = details.querySelector('summary');
  const menu = details.querySelector('nav');
  const menuList = menu.querySelector('ul');
  const pageName = summary.querySelector('.page-name');
  const languageControl = header.querySelector('.language-control');
  const themeControl = header.querySelector('.theme-control');
  const status = header.querySelector('.site-status');

  function setMode(value) {
    dark = value;
    if (dark) root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
    const words = copy[language];
    themeControl.querySelector('.control-label').textContent = words.theme;
    themeControl.querySelector('.control-value').textContent = dark ? words.dark : words.light;
    themeControl.setAttribute('aria-pressed', String(dark));
  }

  function updateControls() {
    const words = copy[language];
    const nameIndex = language === CHINESE ? 1 : 0;
    controls.setAttribute('aria-label', words.controls);
    menu.setAttribute('aria-label', words.pages);
    summary.querySelector('.pages-label').textContent = words.pages;
    pageName.textContent = page.names[nameIndex];
    languageControl.querySelector('.control-label').textContent = words.language;
    const target = languageControl.querySelector('.control-value');
    target.lang = language === CHINESE ? ENGLISH : CHINESE;
    target.textContent = language === CHINESE ? 'English' : '简体中文';
    menuList.replaceChildren(...pages.map(entry => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry[language];
      link.textContent = entry.names[nameIndex];
      if (entry === page) link.setAttribute('aria-current', 'page');
      item.append(link);
      return item;
    }));
    const contact = document.createElement('li');
    contact.className = 'menu-contact';
    const link = document.createElement('a');
    link.href = 'mailto:tianyiguo741@gmail.com';
    link.textContent = words.help;
    contact.append(link);
    menuList.append(contact);
    setMode(dark);
  }

  function filterQuestions() {
    const search = main.querySelector('#q');
    if (!search) return;
    const words = search.value.toLocaleLowerCase(language).trim().split(/\s+/).filter(Boolean);
    let shown = 0;
    main.querySelectorAll('.topic').forEach(topic => {
      let matches = 0;
      topic.querySelectorAll('.qa').forEach(question => {
        const content = question.textContent.toLocaleLowerCase(language);
        const hit = words.every(word => content.includes(word));
        question.classList.toggle('hidden', !hit);
        if (hit) matches++;
      });
      topic.classList.toggle('hidden', matches === 0);
      shown += matches;
    });
    main.querySelector('#none')?.classList.toggle('hidden', shown > 0);
  }

  async function showLanguage(next, save) {
    if (!isLanguage(next)) return;
    const request = ++loadNumber;
    if (next === language) {
      languageControl.disabled = false;
      status.hidden = true;
      return;
    }
    languageControl.disabled = true;
    status.textContent = copy[language].loading;
    status.hidden = false;
    try {
      if (!documents.has(next)) {
        const response = await fetch(page[next], { cache: 'no-cache' });
        if (!response.ok) throw new Error('Page could not be loaded');
        const translated = new DOMParser().parseFromString(await response.text(), 'text/html');
        const content = translated.querySelector('main');
        if (!content || translated.documentElement.lang !== next) throw new Error('Page language did not match');
        documents.set(next, { title: translated.title, html: content.innerHTML });
      }
      if (request !== loadNumber) return;
      const query = main.querySelector('#q')?.value;
      const content = documents.get(next);
      language = next;
      root.lang = language;
      document.title = content.title;
      main.innerHTML = content.html;
      const search = main.querySelector('#q');
      if (search && query) search.value = query;
      filterQuestions();
      updateControls();
      if (location.hash) {
        let anchor = location.hash.slice(1);
        try { anchor = decodeURIComponent(anchor); } catch {}
        document.getElementById(anchor)?.scrollIntoView({ block: 'nearest' });
      }
      if (save) remember(LANGUAGE_KEY, next);
      status.hidden = true;
    } catch {
      if (request === loadNumber) status.textContent = copy[language].failed;
    } finally {
      if (request === loadNumber) languageControl.disabled = false;
    }
  }

  main.addEventListener('input', event => {
    if (event.target.id === 'q') filterQuestions();
  });
  languageControl.addEventListener('click', () => showLanguage(language === CHINESE ? ENGLISH : CHINESE, true));
  themeControl.addEventListener('click', () => {
    setMode(!dark);
    remember(MODE_KEY, dark ? 'dark' : 'light');
  });
  details.addEventListener('keydown', event => {
    if (event.key === 'Escape' && details.open) {
      details.open = false;
      summary.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!details.contains(event.target)) details.open = false;
  });
  window.addEventListener('storage', event => {
    if (event.key === MODE_KEY) setMode(event.newValue === 'dark');
    if (event.key === LANGUAGE_KEY) showLanguage(event.newValue, false);
  });

  updateControls();
  showLanguage(stored(LANGUAGE_KEY), false);
})();
