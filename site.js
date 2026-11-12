(() => {
  const MODE_KEY = 'specklog-mode';
  const LANGUAGE_KEY = 'specklog-language';
  const CHINESE = 'zh-Hans';
  const ENGLISH = 'en';
  // Launch checklist: set this to the live SpeckLog App Store listing URL after approval.
  const APP_STORE_URL = '';
  const root = document.documentElement;
  const main = document.querySelector('main');
  if (!main) return;

  const pages = [
    { en: 'index.html', 'zh-Hans': 'support-zh.html', names: ['Support', '支持'] },
    { en: 'faq.html', 'zh-Hans': 'faq-zh.html', names: ['Questions & Answers', '常见问题'] },
    { en: 'updates.html', 'zh-Hans': 'updates-zh.html', names: ['What’s new', '更新记录'] },
    { en: 'report.html', 'zh-Hans': 'report-zh.html', names: ['Report a problem', '报告问题'] },
    { en: 'privacy.html', 'zh-Hans': 'privacy-zh.html', names: ['Privacy Policy', '隐私政策'] },
    { en: 'terms.html', 'zh-Hans': 'terms-zh.html', names: ['Terms of Use', '使用条款'] },
  ];
  const file = location.pathname.split('/').pop() || 'index.html';
  const page = pages.find(entry => entry.en === file || entry[CHINESE] === file);
  if (!page) return;
  const legalPage = page.en === 'privacy.html' || page.en === 'terms.html';

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
  // Privacy policy version: always the shipped one (1.0) unless the link says #v1.1. Nothing is remembered.
  let policyVersion = location.hash === '#v1.1' ? '1.1' : '1.0';
  const documents = new Map([[language, { title: document.title, html: main.innerHTML }]]);
  const copy = {
    en: {
      pages: 'Pages', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark',
      help: 'Problem?', controls: 'Site controls', loading: 'Loading…',
      failed: 'Couldn’t change the language. Please try again.',
      appIcon: 'SpeckLog app icon', storeComing: 'App Store link coming soon', store: 'View SpeckLog on the App Store',
      more: n => `+${n} more`, sep: ', ',
    },
    'zh-Hans': {
      pages: '页面', language: '语言', theme: '外观', light: '浅色', dark: '深色',
      help: '遇到问题？', controls: '网站设置', loading: '正在加载…',
      failed: '没能切换语言，请重试。',
      appIcon: 'SpeckLog 应用图标', storeComing: '上架后会添加 App Store 链接', store: '在 App Store 查看 SpeckLog',
      more: n => `还有 ${n} 项`, sep: '、',
    },
  };

  // The Problem flow: pick a kind, then open a pre-filled email. Subject tags stay in English so the inbox can filter.
  const EMAIL = 'tianyiguo741@gmail.com';
  const problem = {
    en: {
      title: 'What kind of problem?', close: 'Close', back: 'Back', openMail: 'Open Mail', confirm: 'Send an email?',
      confirmText: (kind, item) => `This opens your Mail app with a draft to ${EMAIL}, organized as “${kind}”${item ? ' about ' + item : ''}. Nothing is sent until you press Send, and this site collects nothing.`,
      feature: 'Feature',
      tail: ['App version (Settings → About)', 'iPhone model and iOS version'],
      kinds: [
        { key: 'ux', tag: 'UX', label: 'Something is hard to use', fields: ['What I was trying to do', 'What was confusing or hard', 'What would have been easier'] },
        { key: 'find', tag: 'Lost', label: 'Can’t find something', fields: ['What I was looking for', 'Where I looked first', 'Where I expected it to be'] },
        { key: 'broken', tag: 'Broken', label: 'A feature is broken', fields: ['What happened', 'What you expected', 'Steps to make it happen', 'How often (always / sometimes / once)'], note: 'Screenshot or screen recording: attach if you can.' },
        { key: 'slow', tag: 'Slow', label: 'Slow or laggy', fields: ['Where it is slow (screen or action)', 'How slow (a moment / several seconds / freezes)', 'About how many days of data you have'] },
        { key: 'data', tag: 'Privacy', label: 'Data or privacy concern', fields: ['What data', 'What worried you'], note: 'No personal health details needed.' },
        { key: 'idea', tag: 'Idea', label: 'Idea or request', fields: ['The idea', 'Why it would help'] },
        { key: 'other', tag: 'Other', label: 'Other', fields: ['What is on your mind'] },
      ],
    },
    'zh-Hans': {
      title: '遇到了什么问题？', close: '关闭', back: '返回', openMail: '打开“邮件”', confirm: '发送邮件？',
      confirmText: (kind, item) => `这会在“邮件”App 里打开一封发给 ${EMAIL} 的草稿，类型为“${kind}”${item ? '，涉及 ' + item : ''}。在你按下发送之前不会发出任何内容，本网站也不收集任何信息。`,
      feature: '功能',
      tail: ['应用版本（设置 → 关于）', 'iPhone 型号和 iOS 版本'],
      kinds: [
        { key: 'ux', tag: 'UX', label: '某个地方不好用（使用体验）', fields: ['我想做什么', '哪里不清楚或不顺手', '怎样会更容易'] },
        { key: 'find', tag: 'Lost', label: '找不到某个功能', fields: ['我在找什么', '我先去了哪里找', '我以为它会在哪里'] },
        { key: 'broken', tag: 'Broken', label: '某个功能出错了', fields: ['发生了什么', '我期望的是什么', '如何让它出现（步骤）', '出现频率（每次 / 有时 / 仅一次）'], note: '截图或录屏：方便的话请附上。' },
        { key: 'slow', tag: 'Slow', label: '太慢或卡顿', fields: ['哪里慢（哪个页面或操作）', '有多慢（一下子 / 好几秒 / 卡住）', '大约有多少天的数据'] },
        { key: 'data', tag: 'Privacy', label: '数据或隐私方面的担忧', fields: ['涉及哪些数据', '让我担心的是什么'], note: '无需提供个人健康细节。' },
        { key: 'idea', tag: 'Idea', label: '想法或建议', fields: ['我的想法', '它为什么有帮助'] },
        { key: 'other', tag: 'Other', label: '其他', fields: ['想说的话'] },
      ],
    },
  };

  const header = document.createElement('header');
  header.className = 'site-header';
  header.innerHTML = `
    <div class="site-controls" role="group">
      <details class="site-pages">
        <summary class="site-control"><span class="pages-label"></span></summary>
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
  const languageControl = header.querySelector('.language-control');
  const themeControl = header.querySelector('.theme-control');
  const status = header.querySelector('.site-status');

  function renderPageTitle() {
    const title = main.querySelector('h1');
    if (!title) return;
    const words = copy[language];
    const row = document.createElement('header');
    row.className = 'page-title';
    const icon = document.createElement('img');
    icon.className = 'title-app-icon';
    icon.src = 'specklog-app-icon.png?v=2';
    icon.width = 192;
    icon.height = 192;
    title.before(row);
    row.append(title);
    if (APP_STORE_URL) {
      const link = document.createElement('a');
      link.className = 'app-store-link';
      link.href = APP_STORE_URL;
      link.setAttribute('aria-label', words.store);
      icon.alt = '';
      link.append(icon);
      row.append(link);
    } else {
      icon.alt = words.appIcon;
      icon.title = words.storeComing;
      row.append(icon);
    }
  }

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
    languageControl.querySelector('.control-label').textContent = words.language;
    const target = languageControl.querySelector('.control-value');
    target.lang = language === CHINESE ? ENGLISH : CHINESE;
    target.textContent = language === CHINESE ? 'English' : '简体中文';
    menuList.replaceChildren(...pages.map(entry => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry[language] + (entry.en === 'privacy.html' && policyVersion === '1.1' ? '#v1.1' : '');
      link.textContent = entry.names[nameIndex];
      if (entry === page) link.setAttribute('aria-current', 'page');
      item.append(link);
      return item;
    }));
    const contact = document.createElement('li');
    contact.className = 'menu-contact';
    const help = document.createElement('button');
    help.type = 'button';
    help.className = 'menu-problem';
    help.textContent = words.help;
    help.addEventListener('click', () => {
      details.open = false;
      showProblem(null, help);
    });
    contact.append(help);
    menuList.append(contact);
    setMode(dark);
  }

  // ---- Problem dialog ----
  let dialog = null;
  let opener = null;

  function mailtoFor(kindKey, item) {
    const words = problem[language];
    const kind = words.kinds.find(entry => entry.key === kindKey) || words.kinds[words.kinds.length - 1];
    const subject = `[SpeckLog][${kind.tag}]${item ? `[${item.id}]` : ''} `;
    const parts = [];
    if (item) parts.push(`${words.feature}: ${item.id}${item.text ? ` (${item.text})` : ''}\n`);
    kind.fields.forEach(label => parts.push(`${label}:\n`));
    if (kind.note) parts.push(kind.note + '\n');
    words.tail.forEach(label => parts.push(`${label}:\n`));
    const body = parts.join('\n').replace(/\n/g, '\r\n');
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function problemDialog() {
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.className = 'problem-dialog';
    dialog.setAttribute('aria-labelledby', 'problem-title');
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => { if (opener && opener.isConnected) opener.focus(); });
    document.body.append(dialog);
    return dialog;
  }

  function dialogShell(titleText) {
    const body = document.createElement('div');
    body.className = 'dialog-body';
    const title = document.createElement('h2');
    title.id = 'problem-title';
    title.tabIndex = -1;
    title.textContent = titleText;
    body.append(title);
    return { body, title };
  }

  function closeButton(words) {
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'dialog-close';
    close.textContent = words.close;
    close.addEventListener('click', () => dialog.close());
    return close;
  }

  function renderKinds(item, focusTitle) {
    const words = problem[language];
    const { body, title } = dialogShell(words.title);
    if (item) {
      const about = document.createElement('p');
      about.className = 'muted';
      about.textContent = item.text ? `${item.text} (${item.id})` : item.id;
      body.append(about);
    }
    const list = document.createElement('div');
    list.className = 'dialog-choices';
    words.kinds.forEach(kind => {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.className = 'choice';
      choice.textContent = kind.label;
      choice.addEventListener('click', () => renderConfirm(kind, item));
      list.append(choice);
    });
    body.append(list, closeButton(words));
    dialog.replaceChildren(body);
    if (focusTitle) title.focus();
  }

  function renderConfirm(kind, item) {
    const words = problem[language];
    const { body, title } = dialogShell(words.confirm);
    const text = document.createElement('p');
    text.textContent = words.confirmText(kind.label, item ? item.id : '');
    const actions = document.createElement('div');
    actions.className = 'dialog-actions';
    const open = document.createElement('a');
    open.className = 'btn primary';
    open.href = mailtoFor(kind.key, item);
    open.textContent = words.openMail;
    open.addEventListener('click', () => setTimeout(() => dialog.close(), 0));
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn';
    back.textContent = words.back;
    back.addEventListener('click', () => renderKinds(item, true));
    actions.append(open, back);
    body.append(text, actions, closeButton(words));
    dialog.replaceChildren(body);
    title.focus();
  }

  function showProblem(item, from) {
    const box = problemDialog();
    if (typeof box.showModal !== 'function') {
      location.href = mailtoFor('other', item);
      return;
    }
    opener = from || document.activeElement;
    box.lang = language;
    renderKinds(item, false);
    if (!box.open) box.showModal();
  }

  // ---- Fold / expand (What's new, Report) ----
  let foldCount = 0;

  function setEntryFolded(entry, folded) {
    entry.classList.toggle('folded', folded);
    entry.querySelector(':scope > h3 .fold-toggle')?.setAttribute('aria-expanded', String(!folded));
  }

  function setReleaseFolded(release, folded) {
    release.classList.toggle('folded', folded);
    release.querySelector(':scope > h2 .fold-toggle')?.setAttribute('aria-expanded', String(!folded));
  }

  function makeToggle(heading) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'fold-toggle';
    button.append(...heading.childNodes);
    heading.append(button);
    return button;
  }

  function setupFolds() {
    const words = copy[language];
    main.querySelectorAll('section.entry').forEach(entry => {
      const heading = entry.querySelector(':scope > h3');
      const list = entry.querySelector(':scope > ul');
      if (!heading || !list || list.children.length < 2) return;
      if (!list.id) list.id = 'fold-' + (++foldCount);
      makeToggle(heading).setAttribute('aria-controls', list.id);
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'fold-more';
      more.textContent = words.more(list.children.length - 1);
      more.setAttribute('aria-controls', list.id);
      list.after(more);
      // What's new groups start open; the long Report list starts folded.
      setEntryFolded(entry, entry.classList.contains('report-group'));
    });
    main.querySelectorAll('section.release').forEach((release, index) => {
      const heading = release.querySelector(':scope > h2');
      const entries = [...release.querySelectorAll(':scope > section.entry')];
      if (!heading || entries.length === 0) return;
      makeToggle(heading);
      const titles = document.createElement('p');
      titles.className = 'fold-titles';
      entries.forEach((entry, position) => {
        if (!entry.id) entry.id = 'group-' + (++foldCount);
        if (position > 0) titles.append(words.sep);
        const jump = document.createElement('button');
        jump.type = 'button';
        jump.dataset.target = entry.id;
        jump.textContent = entry.querySelector('h3')?.textContent.trim() || entry.id;
        titles.append(jump);
      });
      heading.after(titles);
      // The newest version starts open; older ones start folded.
      setReleaseFolded(release, index > 0);
    });
    revealHash();
  }

  function revealHash() {
    if (!location.hash) return;
    let anchor = location.hash.slice(1);
    try { anchor = decodeURIComponent(anchor); } catch {}
    const target = document.getElementById(anchor);
    if (!target || !main.contains(target)) return;
    const release = target.closest('section.release');
    if (release?.classList.contains('folded')) setReleaseFolded(release, false);
    const entry = target.closest('section.entry');
    if (entry?.classList.contains('folded')) setEntryFolded(entry, false);
    if (release || entry) target.scrollIntoView({ block: 'start' });
  }

  function filterReport() {
    const search = main.querySelector('#rq');
    if (!search) return;
    const words = search.value.toLocaleLowerCase(language).trim().split(/\s+/).filter(Boolean);
    const active = words.length > 0;
    let shown = 0;
    main.querySelectorAll('section.report-group').forEach(group => {
      const heading = (group.querySelector('h3')?.textContent || '').toLocaleLowerCase(language);
      let hits = 0;
      group.querySelectorAll('.report-item').forEach(item => {
        const content = heading + ' ' + (item.querySelector('.item-text')?.textContent || '') + ' ' + (item.querySelector('.item-id')?.textContent || '');
        const hit = words.every(word => content.toLocaleLowerCase(language).includes(word));
        item.classList.toggle('hidden', !hit);
        if (hit) hits++;
      });
      group.classList.toggle('hidden', hits === 0);
      shown += hits;
      // While searching every matching group is open; clearing the search restores the folds.
      if (active) {
        if (group.dataset.prefold === undefined) group.dataset.prefold = group.classList.contains('folded') ? '1' : '0';
        setEntryFolded(group, false);
      } else if (group.dataset.prefold !== undefined) {
        setEntryFolded(group, group.dataset.prefold === '1');
        delete group.dataset.prefold;
      }
    });
    main.querySelector('#none')?.classList.toggle('hidden', shown > 0);
  }

  function showVersion(version) {
    if (!main.querySelector('.version-toggle')) return;
    policyVersion = version;
    main.querySelectorAll('.policy').forEach(section => section.classList.toggle('hidden', section.id !== 'v' + version));
    main.querySelectorAll('.version-toggle a').forEach(link => {
      link.setAttribute('aria-current', String(link.getAttribute('href') === '#v' + version));
    });
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
      const query = main.querySelector('#q, #rq')?.value;
      const content = documents.get(next);
      language = next;
      root.lang = language;
      document.title = content.title;
      main.innerHTML = content.html;
      renderPageTitle();
      showVersion(policyVersion);
      const search = main.querySelector('#q, #rq');
      if (search && query) search.value = query;
      filterQuestions();
      setupFolds();
      filterReport();
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

  main.addEventListener('click', event => {
    const link = event.target.closest?.('.version-toggle a');
    if (!link) return;
    event.preventDefault();
    showVersion(link.getAttribute('href') === '#v1.1' ? '1.1' : '1.0');
    history.replaceState(null, '', link.getAttribute('href'));
    updateControls();
  });
  main.addEventListener('click', event => {
    const target = event.target;
    if (!target.closest) return;
    const toggle = target.closest('.fold-toggle');
    if (toggle) {
      const box = toggle.closest('section.entry, section.release');
      if (!box) return;
      if (box.matches('.release')) setReleaseFolded(box, !box.classList.contains('folded'));
      else setEntryFolded(box, !box.classList.contains('folded'));
      return;
    }
    const more = target.closest('.fold-more');
    if (more) {
      const entry = more.closest('section.entry');
      if (entry) {
        setEntryFolded(entry, false);
        entry.querySelector(':scope > h3 .fold-toggle')?.focus();
      }
      return;
    }
    const jump = target.closest('.fold-titles button');
    if (jump) {
      const release = jump.closest('section.release');
      const entry = document.getElementById(jump.dataset.target);
      if (release) setReleaseFolded(release, false);
      if (entry) {
        setEntryFolded(entry, false);
        entry.scrollIntoView({ block: 'start' });
        entry.querySelector(':scope > h3 .fold-toggle')?.focus({ preventScroll: true });
      }
      return;
    }
    const report = target.closest('.report-btn');
    if (report) {
      showProblem({ id: report.dataset.reportId, text: report.dataset.reportText || '' }, report);
      return;
    }
    const general = target.closest('[data-report-general]');
    if (general) showProblem(null, general);
  });
  window.addEventListener('hashchange', () => {
    revealHash();
    if (location.hash === '#v1.0' || location.hash === '#v1.1') { showVersion(location.hash.slice(2)); updateControls(); }
  });
  main.addEventListener('input', event => {
    if (event.target.id === 'q') filterQuestions();
    if (event.target.id === 'rq') filterReport();
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
    if (event.key === LANGUAGE_KEY && !legalPage) showLanguage(event.newValue, false);
  });

  renderPageTitle();
  showVersion(policyVersion);
  updateControls();
  setupFolds();
  filterReport();
  // The in-app and App Store legal links point to a specific language. Keep that language
  // on entry, while still letting a reader switch it from the site's controls.
  if (!legalPage) showLanguage(stored(LANGUAGE_KEY), false);
})();
