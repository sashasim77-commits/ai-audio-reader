'use strict';

// ===== State =====
const state = {
  library:         [],
  currentId:       null,
  isPlaying:       false,
  speed:           1,
  covers:          {},   // groupId -> cover blob URL
  preBookmarkTime: null, // { trackId, time } — saved before bookmark jump
};

const STORAGE_KEY  = 'air_library';
const PROGRESS_KEY = 'air_progress';
const CURRENT_KEY  = 'air_current';
const SPEED_KEY    = 'air_speed';
const VOLUME_KEY   = 'air_volume';
const THEME_KEY    = 'air_theme';
const SLEEP_KEY    = 'air_sleep_end';
const BOOKMARKS_KEY= 'air_bookmarks';
const AUDIO_EXT    = /\.(mp3|m4a|m4b|ogg|wav|aac|flac|opus)$/i;
const COVER_NAMES  = /^(cover|folder|front|album|albumart|artwork)\.(jpg|jpeg|png|webp)$/i;
const SPEED_CYCLE  = [1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0];

// ===== IndexedDB =====
const IDB_NAME  = 'AudioReaderDB';
const IDB_VER   = 1;
const IDB_STORE = 'files';
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VER);
    req.onupgradeneeded = e => e.target.result.createObjectStore(IDB_STORE, { keyPath: 'id' });
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = ()  => reject(req.error);
  });
}

function dbPut(id, file) {
  if (!db) return Promise.resolve();
  return new Promise(resolve => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put({ id, file });
    tx.oncomplete = resolve; tx.onerror = resolve;
  });
}

function dbGet(id) {
  if (!db) return Promise.resolve(null);
  return new Promise(resolve => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(id);
    req.onsuccess = () => resolve(req.result?.file ?? null);
    req.onerror   = () => resolve(null);
  });
}

function dbDelete(id) {
  if (!db) return Promise.resolve();
  return new Promise(resolve => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).delete(id); tx.oncomplete = resolve; tx.onerror = resolve;
  });
}

function dbGetAllIds() {
  if (!db) return Promise.resolve([]);
  return new Promise(resolve => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).getAllKeys();
    req.onsuccess = () => resolve(req.result ?? []); req.onerror = () => resolve([]);
  });
}

function dbClearAll() {
  if (!db) return Promise.resolve();
  return new Promise(resolve => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).clear(); tx.oncomplete = resolve; tx.onerror = resolve;
  });
}

// ===== DOM refs =====
const audio           = document.getElementById('audioPlayer');
const playBtn         = document.getElementById('playBtn');
const playIcon        = playBtn.querySelector('.play-icon');
const pauseIcon       = playBtn.querySelector('.pause-icon');
const rewindBtn       = document.getElementById('rewindBtn');
const forwardBtn      = document.getElementById('forwardBtn');
const progressRange   = document.getElementById('progressBar');
const currentTimeEl   = document.getElementById('currentTime');
const durationEl      = document.getElementById('duration');
const trackTitle      = document.getElementById('trackTitle');
const trackAuthor     = document.getElementById('trackAuthor');
const coverArt        = document.getElementById('coverArt');
const coverArtImg     = document.getElementById('coverArtImg');
const coverBg         = document.getElementById('coverBg');
const volumeSlider    = document.getElementById('volumeSlider');
const libraryPanel    = document.getElementById('libraryPanel');
const libraryList     = document.getElementById('libraryList');
const overlay         = document.getElementById('overlay');
const menuBtn         = document.getElementById('menuBtn');
const closeLibrary    = document.getElementById('closeLibrary');
const clearLibraryBtn = document.getElementById('clearLibraryBtn');
const resetAllBtn     = document.getElementById('resetAllBtn');
const uploadBtn       = document.getElementById('uploadBtn');
const fileInput       = document.getElementById('fileInput');
const folderBtn       = document.getElementById('folderBtn');
const folderInput     = document.getElementById('folderInput');
const continueBanner  = document.getElementById('continueBanner');
const continueBookName= document.getElementById('continueBookName');
const continuePos     = document.getElementById('continuePos');
const continueBtn     = document.getElementById('continueBtn');
const continueDismiss = document.getElementById('continueDismiss');
const sleepSection    = document.getElementById('sleepSection');
const sleepCancelBtn  = document.getElementById('sleepCancel');
const sleepCountdown  = document.getElementById('sleepCountdown');
const sleepTimeEl     = document.getElementById('sleepTime');
const sleepButtons    = [...document.querySelectorAll('.sleep-btn[data-minutes]')];
const playlistCount   = document.getElementById('playlistCount');
const playlistItems   = document.getElementById('playlistItems');
const vizCanvas       = document.getElementById('vizCanvas');
const addBookmarkBtn  = document.getElementById('addBookmarkBtn');
const returnBtn       = document.getElementById('returnBtn');
const bookmarksList   = document.getElementById('bookmarksList');
const speedDisplay    = document.getElementById('speedDisplay');

// Sheet elements
const chaptersOverlay  = document.getElementById('chaptersOverlay');
const chaptersClose    = document.getElementById('chaptersClose');
const chaptersBtn      = document.getElementById('chaptersBtn');
const bookmarksOverlay = document.getElementById('bookmarksOverlay');
const bookmarksClose   = document.getElementById('bookmarksClose');
const bookmarksSheetBtn= document.getElementById('bookmarksSheetBtn');
const settingsOverlay  = document.getElementById('settingsOverlay');
const settingsClose    = document.getElementById('settingsClose');
const settingsBtn      = document.getElementById('settingsBtn');
const guideOverlay     = document.getElementById('guideOverlay');
const guideClose       = document.getElementById('guideClose');
const helpBtn          = document.getElementById('helpBtn');
const guideContent     = document.getElementById('guideContent');

// ===== Web Audio / Visualizer =====
let audioCtx = null, analyser = null;
let cachedGrad = null, cachedGradH = 0;

async function initAudioCtx() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.85;
    const src = audioCtx.createMediaElementSource(audio);
    src.connect(analyser);
    analyser.connect(audioCtx.destination);
    tickViz();
  } catch (e) {
    console.warn('Web Audio unavailable:', e);
    audioCtx = null;
  }
}

function tickViz() {
  requestAnimationFrame(tickViz);
  if (!analyser || !vizCanvas) return;

  const ctx = vizCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W   = vizCanvas.offsetWidth;
  const H   = vizCanvas.offsetHeight;

  if (vizCanvas.width !== W * dpr || vizCanvas.height !== H * dpr) {
    vizCanvas.width  = W * dpr;
    vizCanvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    cachedGrad = null;
  }

  // Only use lower 65% of frequency bins
  const bins  = Math.floor(analyser.frequencyBinCount * 0.65);
  const data  = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  ctx.clearRect(0, 0, W, H);

  if (!cachedGrad || cachedGradH !== H) {
    cachedGrad  = ctx.createLinearGradient(0, H, 0, 0);
    cachedGrad.addColorStop(0,   '#00f5d4');
    cachedGrad.addColorStop(0.5, '#7b2fff');
    cachedGrad.addColorStop(1,   '#ff2d78');
    cachedGradH = H;
  }

  const gap  = 2;
  const barW = Math.max(2, (W - gap * (bins - 1)) / bins);

  ctx.fillStyle = cachedGrad;
  ctx.shadowColor = '#00f5d4';
  ctx.shadowBlur  = state.isPlaying ? 4 : 0;

  for (let i = 0; i < bins; i++) {
    const v    = data[i] / 255;
    // Bars max at 32% of canvas height — subtle background element (3× smaller than 96%)
    const barH = Math.max(1, v * H * 0.32);
    ctx.fillRect(i * (barW + gap), H - barH, barW, barH);
  }
}

// ===== Utilities =====
function formatTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
function pad(n) { return String(n).padStart(2,'0'); }

function formatSize(b) {
  if (!b) return '';
  return b < 1048576 ? (b/1024).toFixed(0)+' KB' : (b/1048576).toFixed(1)+' MB';
}

function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

function cleanFileName(f) {
  const base = (f.webkitRelativePath || f.name).split('/').pop().split('\\').pop();
  return base.replace(AUDIO_EXT, '');
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

let toastTimer;
function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== Sheet Management =====
function openSheet(overlayEl) {
  closeAllSheets();
  overlayEl.classList.add('open');
}

function closeSheet(overlayEl) {
  overlayEl?.classList.remove('open');
}

function closeAllSheets() {
  [chaptersOverlay, bookmarksOverlay, settingsOverlay, guideOverlay].forEach(o => o?.classList.remove('open'));
}

// Close sheet when clicking backdrop (outside the sheet itself)
[chaptersOverlay, bookmarksOverlay, settingsOverlay, guideOverlay].forEach(overlay => {
  overlay?.addEventListener('click', e => {
    if (e.target === overlay) closeSheet(overlay);
  });
});

chaptersBtn?.addEventListener('click',       () => { renderPlaylist(); openSheet(chaptersOverlay); });
chaptersClose?.addEventListener('click',     () => closeSheet(chaptersOverlay));
bookmarksSheetBtn?.addEventListener('click', () => { renderBookmarks(); openSheet(bookmarksOverlay); });
bookmarksClose?.addEventListener('click',    () => closeSheet(bookmarksOverlay));
settingsBtn?.addEventListener('click',       () => openSheet(settingsOverlay));
settingsClose?.addEventListener('click',     () => closeSheet(settingsOverlay));
helpBtn?.addEventListener('click',           () => { renderGuide(); openSheet(guideOverlay); });
guideClose?.addEventListener('click',        () => closeSheet(guideOverlay));

// ===== PWA Install Guide =====
function detectPlatform() {
  const ua = navigator.userAgent;
  if (/ipad|iphone|ipod/i.test(ua)) return 'ios';
  if (/android/i.test(ua))          return 'android';
  return 'desktop';
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
}

// SVG icons used inline in guide steps
const SVG_IOS_SHARE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><line x1="12" y1="2" x2="12" y2="13"/><polyline points="8 6 12 2 16 6"/><path d="M20 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/></svg>`;
const SVG_ANDROID_DOTS = `<svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>`;
const SVG_CHECKMARK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="28" height="28"><polyline points="20 6 9 17 4 12"/></svg>`;

function guideStep(num, html) {
  return `<div class="guide-step">
    <div class="guide-step-num">${num}</div>
    <div class="guide-step-body">${html}</div>
  </div>`;
}

function renderGuide() {
  if (!guideContent) return;
  const platform  = detectPlatform();
  const installed = isStandalone();

  if (installed) {
    guideContent.innerHTML = `
      <div class="guide-installed">
        <div class="guide-installed-icon">${SVG_CHECKMARK}</div>
        <h3>УЖЕ УСТАНОВЛЕНО</h3>
        <p>Приложение работает как PWA<br>и добавлено на главный экран.</p>
      </div>`;
    return;
  }

  const iosPill     = `<span class="guide-icon-pill">${SVG_IOS_SHARE} Поделиться</span>`;
  const androidPill = `<span class="guide-icon-pill android">${SVG_ANDROID_DOTS} Меню</span>`;

  const iosSteps = `
    <div class="guide-platform-header">
      <div class="guide-platform-icon ios-icon">🍎</div>
      <div>
        <div class="guide-platform-title">iPhone / iPad</div>
        <div class="guide-platform-sub">Safari Browser</div>
      </div>
    </div>
    <div class="guide-steps">
      ${guideStep(1, 'Откройте эту страницу в браузере <strong>Safari</strong>')}
      ${guideStep(2, `Нажмите кнопку ${iosPill} <strong>внизу</strong> экрана`)}
      ${guideStep(3, 'Прокрутите вниз и нажмите <strong>«На экран "Домой"»</strong>')}
      ${guideStep(4, 'Нажмите <strong>«Добавить»</strong> в правом верхнем углу')}
    </div>
    <div class="guide-note">
      <strong>Важно:</strong> кнопка Поделиться доступна только в Safari.<br>
      В Chrome на iOS её нет.
    </div>`;

  const androidSteps = `
    <div class="guide-platform-header">
      <div class="guide-platform-icon android-icon">🤖</div>
      <div>
        <div class="guide-platform-title">Android</div>
        <div class="guide-platform-sub">Chrome Browser</div>
      </div>
    </div>
    <div class="guide-steps">
      ${guideStep(1, 'Откройте эту страницу в браузере <strong>Chrome</strong>')}
      ${guideStep(2, `Нажмите ${androidPill} <strong>в правом верхнем углу</strong> экрана`)}
      ${guideStep(3, 'Выберите <strong>«Добавить на главный экран»</strong> или <strong>«Установить приложение»</strong>')}
      ${guideStep(4, 'Нажмите <strong>«Добавить»</strong> или <strong>«Установить»</strong>')}
    </div>
    <div class="guide-note">
      <strong>Совет:</strong> Chrome может сам предложить установку — ищи баннер внизу экрана.
    </div>`;

  if (platform === 'ios') {
    guideContent.innerHTML = iosSteps;
  } else if (platform === 'android') {
    guideContent.innerHTML = androidSteps;
  } else {
    // Desktop — show both
    guideContent.innerHTML = `
      ${iosSteps}
      <div class="guide-divider">ANDROID</div>
      ${androidSteps}`;
  }
}

// ===== Speed Cycling =====
function applySpeed(v) {
  state.speed = v;
  audio.playbackRate = v;
  try { localStorage.setItem(SPEED_KEY, v); } catch {}
  if (speedDisplay) {
    const valEl = speedDisplay.querySelector('.speed-val');
    if (valEl) valEl.textContent = v.toFixed(1) + '×';
  }
}

function loadSpeed() {
  const saved = parseFloat(localStorage.getItem(SPEED_KEY) || '1');
  // Snap to nearest valid step; fall back to 1.0 if outside range
  const snapped = Math.round(Math.max(1.0, Math.min(2.0, saved)) * 10) / 10;
  return SPEED_CYCLE.includes(snapped) ? snapped : 1.0;
}

function cycleSpeed() {
  const idx = SPEED_CYCLE.indexOf(state.speed);
  const next = SPEED_CYCLE[(idx + 1) % SPEED_CYCLE.length];
  applySpeed(next);
  showToast(`Speed: ${next.toFixed(1)}×`);
}

speedDisplay?.addEventListener('click', cycleSpeed);

// ===== Library Helpers =====
function findTrack(id) {
  for (const item of state.library) {
    if (item.type === 'single' && item.id === id) return { track: item, group: null };
    if (item.type === 'group') {
      const t = item.tracks.find(t => t.id === id);
      if (t) return { track: t, group: item };
    }
  }
  return null;
}

function getFlatTracks() {
  const out = [];
  for (const item of state.library) {
    if (item.type === 'single') out.push(item);
    else if (item.type === 'group') out.push(...item.tracks);
  }
  return out;
}

function getNextTrack(id) {
  const all = getFlatTracks();
  const i   = all.findIndex(t => t.id === id);
  return i >= 0 ? all[i + 1] ?? null : null;
}

function getPrevTrack(id) {
  const all = getFlatTracks();
  const i   = all.findIndex(t => t.id === id);
  return i > 0 ? all[i - 1] : null;
}

// ===== Persistence =====
function saveLibraryMeta() {
  const meta = state.library.map(item => {
    if (item.type === 'group') {
      return {
        id: item.id, type: 'group', name: item.name,
        collapsed: item.collapsed !== false,
        tracks: item.tracks.map(({ id, name, size, duration }) => ({ id, name, size, duration }))
      };
    }
    const { id, name, size, duration } = item;
    return { id, type: 'single', name, size, duration };
  });
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(meta)); } catch {}
}

function loadLibraryMeta() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return data.map(item => {
      if (!item.type) return { ...item, type: 'single', url: null };
      if (item.type === 'group') return { ...item, tracks: item.tracks.map(t => ({ ...t, url: null })) };
      return { ...item, url: null };
    });
  } catch { return []; }
}

function saveProgress(id, pos) {
  if (!id || !isFinite(pos)) return;
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    all[id] = Math.floor(pos);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

function loadProgress(id) {
  try { return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')[id] || 0; } catch { return 0; }
}

function clearProgress(id) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    delete all[id];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

function saveCurrentId(id) { try { localStorage.setItem(CURRENT_KEY, id || ''); } catch {} }

let lastSaveTime = 0;
function throttledSave() {
  const now = Date.now();
  if (state.currentId && now - lastSaveTime >= 5000) {
    saveProgress(state.currentId, audio.currentTime);
    lastSaveTime = now;
  }
}

// ===== Volume Persistence =====
function saveVolume(v) { try { localStorage.setItem(VOLUME_KEY, v); } catch {} }
function loadVolume()  { return Math.max(0, Math.min(1, parseFloat(localStorage.getItem(VOLUME_KEY) ?? '1'))); }

// ===== Theme =====
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

// ===== Cover Art =====
function setCoverImage(url) {
  if (url) {
    coverBg.style.backgroundImage = `url(${url})`;
    coverBg.classList.add('visible');
    coverArtImg.src = url;
    coverArtImg.classList.add('visible');
  } else {
    coverBg.style.backgroundImage = '';
    coverBg.classList.remove('visible');
    coverArtImg.src = '';
    coverArtImg.classList.remove('visible');
  }
}

function applyCoverForTrack(track, group) {
  setCoverImage(group ? (state.covers[group.id] || null) : null);
}

// ===== Continue Banner =====
function showContinueBanner(track, group, pos) {
  continueBookName.textContent    = group ? `${group.name} › ${track.name}` : track.name;
  continuePos.textContent         = 'from ' + formatTime(pos);
  continueBanner.dataset.trackId  = track.id;
  continueBanner.dataset.pos      = pos;
  continueBanner.hidden = false;
}

function hideContinueBanner() { continueBanner.hidden = true; }

continueBtn.addEventListener('click', () => {
  const id  = continueBanner.dataset.trackId;
  const pos = parseFloat(continueBanner.dataset.pos) || 0;
  hideContinueBanner();
  const ctx = findTrack(id);
  if (!ctx || !ctx.track.url) { showToast('Re-upload required'); return; }
  loadAndSeek(id, pos);
});
continueDismiss.addEventListener('click', hideContinueBanner);

function loadAndSeek(id, pos) {
  const ctx = findTrack(id);
  if (!ctx) return;
  const { track, group } = ctx;
  state.currentId = id;
  saveCurrentId(id);
  audio.src = track.url;
  audio.playbackRate = state.speed;
  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = Math.min(pos, audio.duration - 1);
  }, { once: true });
  updatePlayerTitle(track, group);
  applyCoverForTrack(track, group);
  playAudio();
  renderAll();
}

// ===== Library Render (sidebar) =====
function renderLibrary() {
  if (state.library.length === 0) {
    libraryList.innerHTML = `
      <div class="empty-library">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="52" height="52">
          <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
        </svg>
        <p>No audiobooks yet.<br/>Use ⚙ Settings to add files.</p>
      </div>`;
    return;
  }
  libraryList.innerHTML = state.library.map(item =>
    item.type === 'group' ? renderGroup(item) : renderSingle(item)
  ).join('');
}

function renderGroup(group) {
  const tracks   = group.tracks;
  const total    = tracks.reduce((s, t) => s + (t.duration || 0), 0);
  const consumed = tracks.reduce((s, t) => {
    const p = loadProgress(t.id); return s + Math.min(p, t.duration || p);
  }, 0);
  const pct      = total > 0 ? Math.round((consumed / total) * 100) : 0;
  const hasActive= tracks.some(t => t.id === state.currentId);
  const expanded = group.collapsed === false;
  const coverUrl = state.covers[group.id];

  const coverHtml = coverUrl
    ? `<img src="${coverUrl}" style="width:42px;height:42px;border-radius:8px;object-fit:cover;flex-shrink:0;" />`
    : `<div class="group-cover"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>`;

  return `
    <div class="library-group ${hasActive ? 'active' : ''} ${expanded ? 'expanded' : ''}" data-group-id="${group.id}">
      <div class="group-header">
        <div class="group-toggle"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg></div>
        ${coverHtml}
        <div class="group-info">
          <div class="group-name">${escapeHtml(group.name)}</div>
          <div class="group-meta">${tracks.length} tracks · ${formatTime(total)}${pct > 0 ? ` · ${pct}%` : ''}</div>
          <div class="library-progress-bar"><div class="library-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="group-actions">
          <button class="library-item-delete" data-delete-group="${group.id}" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>
      <div class="group-tracks" ${expanded ? '' : 'hidden'}>
        ${tracks.map(t => renderTrackInGroup(t, group)).join('')}
      </div>
    </div>`;
}

function renderTrackInGroup(track, group) {
  const pos  = loadProgress(track.id);
  const pct  = track.duration > 0 ? Math.round((pos / track.duration) * 100) : 0;
  const isActive = track.id === state.currentId;
  const noFile   = !track.url;
  const done     = pct >= 98;
  return `
    <div class="library-item ${isActive ? 'active' : ''} ${noFile ? 'no-file' : ''}" data-id="${track.id}" data-in-group="${group.id}">
      <div class="library-item-cover ${isActive && state.isPlaying ? 'spinning' : ''}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
      </div>
      <div class="library-item-info">
        <div class="library-item-title">${escapeHtml(track.name)}</div>
        <div class="library-item-meta">
          <span>${formatTime(track.duration || 0)}</span>
          ${done ? '<span class="badge-done">✓</span>' : pct > 0 ? `<span>· ${pct}%</span>` : ''}
          ${noFile ? '<span class="badge-upload">⚠</span>' : ''}
        </div>
        <div class="library-progress-bar"><div class="library-progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="library-item-actions">
        ${pct > 0 ? `<button class="lib-action-btn" data-reset="${track.id}" title="Reset">↩</button>` : ''}
        <button class="library-item-delete" data-delete-track="${track.id}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </div>`;
}

function renderSingle(book) {
  const pos  = loadProgress(book.id);
  const pct  = book.duration > 0 ? Math.round((pos / book.duration) * 100) : 0;
  const isActive = book.id === state.currentId;
  const noFile   = !book.url;
  const done     = pct >= 98;
  return `
    <div class="library-item ${isActive ? 'active' : ''} ${noFile ? 'no-file' : ''}" data-id="${book.id}">
      <div class="library-item-cover ${isActive && state.isPlaying ? 'spinning' : ''}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>
      </div>
      <div class="library-item-info">
        <div class="library-item-title">${escapeHtml(book.name)}</div>
        <div class="library-item-meta">
          <span>${formatTime(book.duration || 0)}</span>
          ${done ? '<span class="badge-done">✓ done</span>' : pct > 0 ? `<span>· ${pct}%</span>` : ''}
          ${noFile ? '<span class="badge-upload">⚠ re-upload</span>' : ''}
        </div>
        <div class="library-progress-bar"><div class="library-progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="library-item-actions">
        ${pct > 0 ? `<button class="lib-action-btn" data-reset="${book.id}" title="Reset">↩</button>` : ''}
        <button class="library-item-delete" data-delete-single="${book.id}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        </button>
      </div>
    </div>`;
}

// ===== Playlist / Chapters Render =====
function renderPlaylist() {
  const flat = getFlatTracks();
  if (!playlistCount || !playlistItems) return;

  playlistCount.textContent = flat.length ? flat.length + ' track' + (flat.length !== 1 ? 's' : '') : '';

  let html = '';
  let trackIdx = 0;

  for (const item of state.library) {
    if (item.type === 'group') {
      html += `<div class="playlist-group-header">${escapeHtml(item.name)}</div>`;
      for (const t of item.tracks) { html += renderPlaylistItem(t, ++trackIdx); }
    } else {
      html += renderPlaylistItem(item, ++trackIdx);
    }
  }

  playlistItems.innerHTML = html || '<div style="padding:20px;text-align:center;color:var(--text2);font-size:12px;">No tracks</div>';
}

function renderPlaylistItem(track, idx) {
  const isActive = track.id === state.currentId;
  const pos  = loadProgress(track.id);
  const pct  = track.duration > 0 ? (pos / track.duration) * 100 : 0;
  const noFile = !track.url;
  return `
    <div class="playlist-item ${isActive ? 'active' : ''} ${noFile ? 'no-file' : ''}" data-id="${track.id}">
      <div class="playlist-num">
        ${isActive && state.isPlaying
          ? `<span class="playing-bars"><span></span><span></span><span></span></span>`
          : `<span class="track-num">${idx}</span>`}
      </div>
      <div class="playlist-info">
        <div class="playlist-name">${escapeHtml(track.name)}</div>
        ${pct > 0 ? `<div class="playlist-bar"><div class="playlist-bar-fill" style="width:${pct}%"></div></div>` : ''}
      </div>
      <span class="playlist-duration">${track.duration ? formatTime(track.duration) : noFile ? '⚠' : '—'}</span>
    </div>`;
}

function renderAll() { renderLibrary(); }

// ===== Player =====
function updatePlayerTitle(track, group) {
  trackTitle.textContent  = track.name;
  trackAuthor.textContent = (group ? group.name + ' · ' : '') + formatSize(track.size);
}

function loadBook(id, fromBookmark = false) {
  const ctx = findTrack(id);
  if (!ctx) return;
  const { track, group } = ctx;
  if (!track.url) { showToast('Re-upload required'); return; }

  if (state.currentId && state.currentId !== id && audio.currentTime > 1) {
    saveProgress(state.currentId, audio.currentTime);
  }

  if (!fromBookmark) {
    state.preBookmarkTime = null;
    if (returnBtn) returnBtn.hidden = true;
  }

  state.currentId = id;
  saveCurrentId(id);
  hideContinueBanner();

  audio.src = track.url;
  audio.playbackRate = state.speed;

  updatePlayerTitle(track, group);
  applyCoverForTrack(track, group);

  const savedPos = loadProgress(id);
  audio.addEventListener('loadedmetadata', () => {
    if (savedPos > 0 && savedPos < audio.duration - 3) audio.currentTime = savedPos;
    if (!track.duration || track.duration !== audio.duration) {
      track.duration = audio.duration;
      saveLibraryMeta();
    }
    trackAuthor.textContent = (group ? group.name + ' · ' : '') + formatSize(track.size) + ' · ' + formatTime(audio.duration);
    renderAll();
    updateMediaSession(track, group);
    // Refresh chapters panel if open
    if (chaptersOverlay.classList.contains('open')) renderPlaylist();
  }, { once: true });

  playAudio();
  renderAll();
}

async function playAudio() {
  try {
    if (!audioCtx) await initAudioCtx();
    else if (audioCtx.state === 'suspended') await audioCtx.resume();
    await audio.play();
  } catch {}
}

function pauseAudio() { audio.pause(); }

function updatePlayUI() {
  if (state.isPlaying) {
    playIcon.classList.add('hidden'); pauseIcon.classList.remove('hidden');
    coverArt.classList.add('playing');
  } else {
    playIcon.classList.remove('hidden'); pauseIcon.classList.add('hidden');
    coverArt.classList.remove('playing');
  }
}

function playNext() {
  const next = state.currentId ? getNextTrack(state.currentId) : getFlatTracks()[0];
  if (next) loadBook(next.id);
}

function playPrev() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const prev = state.currentId ? getPrevTrack(state.currentId) : null;
  if (prev) loadBook(prev.id);
}

// ===== Media Session =====
function updateMediaSession(track, group) {
  if (!('mediaSession' in navigator)) return;
  const coverUrl = group ? (state.covers[group.id] || null) : null;
  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.name,
    artist: group ? group.name : 'AI Audio Reader',
    album:  'AI Audio Reader',
    artwork: coverUrl
      ? [{ src: coverUrl, sizes: '512x512', type: 'image/jpeg' }]
      : [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  });
}

function initMediaSession() {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.setActionHandler('play',          playAudio);
  navigator.mediaSession.setActionHandler('pause',         pauseAudio);
  navigator.mediaSession.setActionHandler('previoustrack', playPrev);
  navigator.mediaSession.setActionHandler('nexttrack',     playNext);
  navigator.mediaSession.setActionHandler('seekbackward',  ({ seekOffset }) => {
    audio.currentTime = Math.max(0, audio.currentTime - (seekOffset || 15));
  });
  navigator.mediaSession.setActionHandler('seekforward', ({ seekOffset }) => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (seekOffset || 15));
  });
  try {
    navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) => {
      if (isFinite(seekTime)) audio.currentTime = seekTime;
    });
  } catch {}
}

// ===== File Upload =====
async function handleFiles(files) {
  const allFiles   = Array.from(files);
  const audioFiles = allFiles
    .filter(f => f.type.startsWith('audio/') || AUDIO_EXT.test(f.name))
    .sort((a, b) => {
      const pa = (a.webkitRelativePath || a.name).toLowerCase();
      const pb = (b.webkitRelativePath || b.name).toLowerCase();
      return pa.localeCompare(pb, undefined, { numeric: true });
    });

  // Map cover images by folder name
  const pendingCovers = {};
  for (const f of allFiles) {
    if (COVER_NAMES.test(f.name)) {
      const parts = (f.webkitRelativePath || f.name).split('/');
      const folder = parts.length >= 2 ? parts[0] : '__root__';
      if (!pendingCovers[folder]) pendingCovers[folder] = f;
    }
  }

  if (!audioFiles.length) { showToast('No audio files found'); return; }

  const folderFiles = audioFiles.filter(f => f.webkitRelativePath?.includes('/'));
  const singleFiles = audioFiles.filter(f => !f.webkitRelativePath?.includes('/'));

  let added = 0;

  const grouped = {};
  for (const f of folderFiles) {
    const folder = f.webkitRelativePath.split('/')[0];
    (grouped[folder] ??= []).push(f);
  }

  for (const [folderName, flist] of Object.entries(grouped)) {
    let group = state.library.find(g => g.type === 'group' && g.name === folderName);
    if (!group) {
      group = { id: 'g_' + generateId(), type: 'group', name: folderName, collapsed: true, tracks: [] };
      state.library.push(group);
    }

    const coverFile = pendingCovers[folderName];
    if (coverFile) {
      if (state.covers[group.id]) URL.revokeObjectURL(state.covers[group.id]);
      state.covers[group.id] = URL.createObjectURL(coverFile);
      await dbPut('cover_' + group.id, coverFile);
      if (state.currentId) {
        const ctx = findTrack(state.currentId);
        if (ctx?.group?.id === group.id) setCoverImage(state.covers[group.id]);
      }
    }

    for (const file of flist) {
      const name = cleanFileName(file);
      const existing = group.tracks.find(t => t.name === name && t.size === file.size);
      if (existing) {
        if (existing.url) URL.revokeObjectURL(existing.url);
        existing.url = URL.createObjectURL(file);
        await dbPut(existing.id, file);
        continue;
      }
      const id  = generateId();
      const url = URL.createObjectURL(file);
      group.tracks.push({ id, name, size: file.size, url, duration: 0 });
      await dbPut(id, file);
      added++;
      const tmp = new Audio();
      tmp.preload = 'metadata';
      tmp.addEventListener('loadedmetadata', () => {
        const t = group.tracks.find(t => t.id === id);
        if (t) { t.duration = tmp.duration; saveLibraryMeta(); renderAll(); }
        tmp.src = '';
      }, { once: true });
      tmp.src = url;
    }
  }

  for (const file of singleFiles) {
    const name = cleanFileName(file);
    const existing = state.library.find(i => i.type === 'single' && i.name === name && i.size === file.size);
    if (existing) {
      if (existing.url) URL.revokeObjectURL(existing.url);
      existing.url = URL.createObjectURL(file);
      await dbPut(existing.id, file);
      continue;
    }
    const id  = generateId();
    const url = URL.createObjectURL(file);
    const book = { id, type: 'single', name, size: file.size, url, duration: 0 };
    state.library.push(book);
    await dbPut(id, file);
    added++;
    const tmp = new Audio();
    tmp.preload = 'metadata';
    tmp.addEventListener('loadedmetadata', () => {
      book.duration = tmp.duration; tmp.src = '';
      saveLibraryMeta(); renderAll();
    }, { once: true });
    tmp.src = url;
  }

  saveLibraryMeta();
  renderAll();
  if (added > 0) showToast(`Added ${added} track${added !== 1 ? 's' : ''}`);

  if (!state.currentId) {
    const first = getFlatTracks().find(t => t.url);
    if (first) { const ctx = findTrack(first.id); updatePlayerTitle(ctx.track, ctx.group); }
  }
}

// ===== Clear Library =====
async function clearLibrary() {
  if (!state.library.length) { showToast('Library is already empty'); return; }
  if (!confirm('Clear the entire library?')) return;

  audio.pause(); audio.src = '';
  state.isPlaying = false; updatePlayUI();

  for (const item of state.library) {
    if (item.type === 'single' && item.url) URL.revokeObjectURL(item.url);
    if (item.type === 'group') item.tracks.forEach(t => { if (t.url) URL.revokeObjectURL(t.url); });
  }
  for (const url of Object.values(state.covers)) URL.revokeObjectURL(url);
  state.covers = {};

  state.library = [];
  state.currentId = null;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(CURRENT_KEY);
  await dbClearAll();

  setCoverImage(null);
  hideContinueBanner();
  resetPlayerUI();
  renderAll();
  closeAllSheets();
  showToast('Library cleared');
}

// ===== Reset ALL Data =====
async function resetAll() {
  if (!confirm('Reset ALL data? Library, bookmarks, settings — everything will be deleted.')) return;

  audio.pause(); audio.src = '';
  state.isPlaying = false;

  for (const item of state.library) {
    if (item.type === 'single' && item.url) URL.revokeObjectURL(item.url);
    if (item.type === 'group') item.tracks.forEach(t => { if (t.url) URL.revokeObjectURL(t.url); });
  }
  for (const url of Object.values(state.covers)) URL.revokeObjectURL(url);

  state.library          = [];
  state.currentId        = null;
  state.covers           = {};
  state.preBookmarkTime  = null;

  localStorage.clear();
  await dbClearAll();

  setCoverImage(null);
  hideContinueBanner();
  resetPlayerUI();
  if (returnBtn) returnBtn.hidden = true;
  applyTheme('dark');
  applySpeed(1);
  volumeSlider.value = 1;
  audio.volume = 1;
  renderAll();
  closeAllSheets();
  showToast('All data reset');
}

// ===== Progress =====
function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressRange.value = pct;
  progressRange.style.setProperty('--p', pct + '%');
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent    = formatTime(audio.duration);
  if ('mediaSession' in navigator && audio.duration) {
    try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: audio.currentTime }); } catch {}
  }
}

function resetPlayerUI() {
  progressRange.value = 0;
  progressRange.style.setProperty('--p', '0%');
  currentTimeEl.textContent = '0:00';
  durationEl.textContent    = '0:00';
  trackTitle.textContent    = 'SELECT A TRACK';
  trackAuthor.textContent   = 'Open library or add files via settings';
  updatePlayUI();
}

// ===== Audio Events =====
audio.addEventListener('play',  () => { state.isPlaying = true;  updatePlayUI(); renderAll(); if (chaptersOverlay.classList.contains('open')) renderPlaylist(); });
audio.addEventListener('pause', () => {
  state.isPlaying = false; updatePlayUI(); renderAll();
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});
audio.addEventListener('ended', () => {
  state.isPlaying = false; updatePlayUI();
  if (state.currentId) saveProgress(state.currentId, 0);
  renderAll(); playNext();
});
audio.addEventListener('loadedmetadata', () => { durationEl.textContent = formatTime(audio.duration); });
audio.addEventListener('timeupdate', () => { updateProgress(); throttledSave(); });

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.currentId) saveProgress(state.currentId, audio.currentTime);
});
window.addEventListener('beforeunload', () => { if (state.currentId) saveProgress(state.currentId, audio.currentTime); });
window.addEventListener('pagehide',     () => { if (state.currentId) saveProgress(state.currentId, audio.currentTime); });

// ===== Control Listeners =====
playBtn.addEventListener('click', () => {
  if (!audio.src) { showToast('Select a track first'); return; }
  state.isPlaying ? pauseAudio() : playAudio();
});

rewindBtn.addEventListener('click',  () => { audio.currentTime = Math.max(0, audio.currentTime - 15); updateProgress(); });
forwardBtn.addEventListener('click', () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15); updateProgress(); });

progressRange.addEventListener('input', () => {
  if (audio.duration) {
    audio.currentTime = (progressRange.value / 100) * audio.duration;
    currentTimeEl.textContent = formatTime(audio.currentTime);
    progressRange.style.setProperty('--p', progressRange.value + '%');
  }
});

volumeSlider.addEventListener('input', () => {
  const v = parseFloat(volumeSlider.value);
  audio.volume = v;
  saveVolume(v);
});

document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { handleFiles(e.target.files); fileInput.value = ''; closeAllSheets(); });

folderBtn.addEventListener('click', () => folderInput.click());
folderInput.addEventListener('change', e => { handleFiles(e.target.files); folderInput.value = ''; closeAllSheets(); });

document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop',     e => { e.preventDefault(); handleFiles(e.dataTransfer.files); });

// Library sidebar
menuBtn.addEventListener('click',      openLibrary);
closeLibrary.addEventListener('click',    closeLibraryPanel);
overlay.addEventListener('click',        closeLibraryPanel);
overlay.addEventListener('touchend', e => { e.preventDefault(); closeLibraryPanel(); });
clearLibraryBtn?.addEventListener('click', clearLibrary);
resetAllBtn?.addEventListener('click',     resetAll);

function openLibrary() {
  renderLibrary();
  libraryPanel.classList.add('open');
  overlay.classList.add('visible');
}

function closeLibraryPanel() {
  libraryPanel.classList.remove('open');
  overlay.classList.remove('visible');
}

// Library delegated events
libraryList.addEventListener('click', e => {
  if (e.target.closest('[data-delete-group]')) {
    removeGroup(e.target.closest('[data-delete-group]').dataset.deleteGroup); return;
  }
  if (e.target.closest('[data-delete-single]')) {
    removeSingle(e.target.closest('[data-delete-single]').dataset.deleteSingle); return;
  }
  if (e.target.closest('[data-delete-track]')) {
    removeTrackFromGroup(e.target.closest('[data-delete-track]').dataset.deleteTrack); return;
  }
  if (e.target.closest('[data-reset]')) {
    resetProgress(e.target.closest('[data-reset]').dataset.reset); return;
  }
  const groupEl  = e.target.closest('.library-group[data-group-id]');
  const onAction = e.target.closest('.group-actions, .library-item-actions');
  if (groupEl && !onAction) { toggleGroup(groupEl.dataset.groupId); return; }
  const item = e.target.closest('.library-item[data-id]');
  if (item && !onAction) { loadBook(item.dataset.id); closeLibraryPanel(); }
});

// Chapters sheet playlist
playlistItems.addEventListener('click', e => {
  const item = e.target.closest('.playlist-item[data-id]');
  if (!item) return;
  const ctx = findTrack(item.dataset.id);
  if (!ctx?.track.url) { showToast('Re-upload required'); return; }
  loadBook(item.dataset.id);
  closeSheet(chaptersOverlay);
});

function toggleGroup(groupId) {
  const group = state.library.find(g => g.type === 'group' && g.id === groupId);
  if (!group) return;
  group.collapsed = (group.collapsed !== false);
  saveLibraryMeta();
  renderLibrary();
}

async function removeGroup(groupId) {
  const idx = state.library.findIndex(g => g.type === 'group' && g.id === groupId);
  if (idx === -1) return;
  const group = state.library[idx];
  let stopPlayback = false;
  for (const t of group.tracks) {
    if (t.url) URL.revokeObjectURL(t.url);
    clearProgress(t.id);
    await dbDelete(t.id);
    if (t.id === state.currentId) stopPlayback = true;
  }
  if (state.covers[group.id]) {
    URL.revokeObjectURL(state.covers[group.id]);
    delete state.covers[group.id];
    await dbDelete('cover_' + group.id);
    if (stopPlayback) setCoverImage(null);
  }
  state.library.splice(idx, 1);
  saveLibraryMeta();
  if (stopPlayback) resetPlayer();
  renderAll();
  showToast('Book removed');
}

async function removeSingle(id) {
  const idx = state.library.findIndex(i => i.type === 'single' && i.id === id);
  if (idx === -1) return;
  const book = state.library[idx];
  if (book.url) URL.revokeObjectURL(book.url);
  state.library.splice(idx, 1);
  clearProgress(id);
  saveLibraryMeta();
  await dbDelete(id);
  if (state.currentId === id) resetPlayer();
  renderAll();
  showToast('Removed');
}

async function removeTrackFromGroup(trackId) {
  for (const item of state.library) {
    if (item.type !== 'group') continue;
    const tIdx = item.tracks.findIndex(t => t.id === trackId);
    if (tIdx === -1) continue;
    const track = item.tracks[tIdx];
    if (track.url) URL.revokeObjectURL(track.url);
    item.tracks.splice(tIdx, 1);
    clearProgress(trackId);
    await dbDelete(trackId);
    if (item.tracks.length === 0) state.library.splice(state.library.indexOf(item), 1);
    saveLibraryMeta();
    if (state.currentId === trackId) resetPlayer();
    renderAll();
    showToast('Track removed');
    return;
  }
}

function resetPlayer() {
  audio.pause(); audio.src = '';
  state.currentId = null; state.isPlaying = false;
  saveCurrentId(null);
  setCoverImage(null);
  resetPlayerUI();
}

function resetProgress(id) {
  clearProgress(id);
  if (state.currentId === id) { audio.currentTime = 0; updateProgress(); }
  renderAll();
  showToast('Progress reset');
}

// ===== Bookmarks =====
function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]'); } catch { return []; }
}

function storeBookmarks(bookmarks) {
  try { localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks)); } catch {}
}

function addBookmark() {
  if (!state.currentId || !audio.src) { showToast('Nothing playing'); return; }
  const ctx = findTrack(state.currentId);
  if (!ctx) return;
  const { track, group } = ctx;
  const bookmark = {
    id:          generateId(),
    trackId:     state.currentId,
    time:        Math.max(0, audio.currentTime - 10),
    chapterName: track.name,
    groupName:   group ? group.name : null,
  };
  const bookmarks = loadBookmarks();
  bookmarks.push(bookmark);
  storeBookmarks(bookmarks);
  renderBookmarks();
  showToast(`Bookmark: ${formatTime(bookmark.time)}`);
}

function deleteBookmark(id) {
  storeBookmarks(loadBookmarks().filter(b => b.id !== id));
  renderBookmarks();
}

function jumpToBookmark(bookmark) {
  if (state.currentId) {
    state.preBookmarkTime = { trackId: state.currentId, time: audio.currentTime };
  }

  const ctx = findTrack(bookmark.trackId);
  if (!ctx) { showToast('Track not found'); return; }
  if (!ctx.track.url) { showToast('Re-upload required'); return; }

  if (returnBtn) returnBtn.hidden = false;

  if (bookmark.trackId === state.currentId) {
    audio.currentTime = bookmark.time;
    updateProgress();
    showToast(`Jumped to ${formatTime(bookmark.time)}`);
    closeSheet(bookmarksOverlay);
  } else {
    const { track, group } = ctx;
    state.currentId = bookmark.trackId;
    saveCurrentId(bookmark.trackId);
    hideContinueBanner();
    audio.src = track.url;
    audio.playbackRate = state.speed;
    audio.addEventListener('loadedmetadata', () => {
      audio.currentTime = Math.min(bookmark.time, audio.duration - 1);
    }, { once: true });
    updatePlayerTitle(track, group);
    applyCoverForTrack(track, group);
    playAudio();
    renderAll();
    closeSheet(bookmarksOverlay);
  }
}

function returnToPreBookmark() {
  if (!state.preBookmarkTime) return;
  const { trackId, time } = state.preBookmarkTime;
  state.preBookmarkTime = null;
  if (returnBtn) returnBtn.hidden = true;

  if (trackId === state.currentId) {
    audio.currentTime = time;
    updateProgress();
    showToast('Returned');
  } else {
    const ctx = findTrack(trackId);
    if (!ctx || !ctx.track.url) { showToast('Track not available'); return; }
    loadAndSeek(trackId, time);
    showToast('Returned');
  }
}

function renderBookmarks() {
  if (!bookmarksList) return;
  const bookmarks = loadBookmarks();

  if (bookmarks.length === 0) {
    bookmarksList.innerHTML = `<div class="bookmarks-empty">No bookmarks yet.<br>Press the flag button while playing.</div>`;
    return;
  }

  bookmarksList.innerHTML = bookmarks.map(b => `
    <div class="bookmark-item" data-bid="${b.id}">
      <button class="bookmark-jump" data-bid="${b.id}">
        <span class="bookmark-time-label">${formatTime(b.time)}</span>
        <span class="bookmark-chapter">${escapeHtml(b.chapterName)}${b.groupName ? ` · ${escapeHtml(b.groupName)}` : ''}</span>
      </button>
      <button class="bookmark-delete-btn" data-delete-bookmark="${b.id}" title="Delete">×</button>
    </div>
  `).join('');
}

// Bookmarks sheet events
document.getElementById('bookmarksOverlay')?.addEventListener('click', e => {
  const deleteBtn = e.target.closest('[data-delete-bookmark]');
  if (deleteBtn) { deleteBookmark(deleteBtn.dataset.deleteBookmark); return; }

  const jumpBtn = e.target.closest('.bookmark-jump[data-bid]');
  if (jumpBtn) {
    const bm = loadBookmarks().find(b => b.id === jumpBtn.dataset.bid);
    if (bm) jumpToBookmark(bm);
  }
});

addBookmarkBtn?.addEventListener('click', addBookmark);
returnBtn?.addEventListener('click',      returnToPreBookmark);

// ===== Sleep Timer =====
const SLEEP_FADE_MS = 5000;
let sleepTimerId = null;
let sleepIntervalId = null;
let sleepEndTime = 0;
let sleepFadeToken = 0;

function saveSleepState(endTime, minutes = 0) {
  try {
    if (!endTime) localStorage.removeItem(SLEEP_KEY);
    else localStorage.setItem(SLEEP_KEY, JSON.stringify({ endTime, minutes }));
  } catch {}
}

function loadSleepState() {
  try {
    const raw = localStorage.getItem(SLEEP_KEY);
    if (!raw) return null;
    if (/^\d+$/.test(raw)) return { endTime: parseInt(raw, 10), minutes: 0 };
    const parsed = JSON.parse(raw);
    if (!parsed?.endTime) return null;
    return { endTime: parsed.endTime, minutes: parsed.minutes || 0 };
  } catch { return null; }
}

function syncAudioVolume() { audio.volume = parseFloat(volumeSlider.value); }

function updateSleepUI(minutes = 0) {
  const active = sleepEndTime > Date.now();
  sleepButtons.forEach(btn => btn.classList.toggle('active', active && parseInt(btn.dataset.minutes, 10) === minutes));
  if (sleepCancelBtn) sleepCancelBtn.hidden = !active;
  if (sleepCountdown) sleepCountdown.hidden = !active;
  if (!active && sleepTimeEl) { sleepTimeEl.textContent = ''; sleepTimeEl.classList.remove('warning'); }
}

function resetSleepTimerState({ restoreVolume = true } = {}) {
  clearTimeout(sleepTimerId);
  clearInterval(sleepIntervalId);
  sleepTimerId = null; sleepIntervalId = null; sleepEndTime = 0; sleepFadeToken++;
  saveSleepState(0);
  if (restoreVolume) syncAudioVolume();
  updateSleepUI();
}

function startSleepTimer(minutes) {
  scheduleSleepTimer(Date.now() + minutes * 60000, minutes);
  showToast(`Sleep timer: ${minutes} min`);
}

function clearSleepTimer(toast = true) {
  resetSleepTimerState();
  if (toast) showToast('Sleep timer cancelled');
}

function tickSleepDisplay() {
  if (!sleepTimeEl) return;
  const remaining = sleepEndTime - Date.now();
  if (remaining <= 0) { sleepTimeEl.textContent = '0:00'; sleepTimeEl.classList.add('warning'); return; }
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  sleepTimeEl.textContent = `${mins}:${String(secs).padStart(2, '0')}`;
  sleepTimeEl.classList.toggle('warning', remaining <= SLEEP_FADE_MS);
}

async function fadeAndPause(durationMs = SLEEP_FADE_MS) {
  const token = ++sleepFadeToken;
  const savedVol = parseFloat(volumeSlider.value);
  if (state.isPlaying && durationMs > 0) {
    const startedAt = performance.now();
    while (sleepFadeToken === token) {
      const progress = Math.min((performance.now() - startedAt) / durationMs, 1);
      audio.volume = savedVol * (1 - progress);
      if (progress >= 1) break;
      await new Promise(requestAnimationFrame);
    }
  }
  if (sleepFadeToken !== token) return;
  if (state.isPlaying) pauseAudio();
  resetSleepTimerState();
  showToast('Sleep timer paused');
}

function scheduleSleepTimer(endTime, minutes = 0, { restoreVolume = true } = {}) {
  resetSleepTimerState({ restoreVolume });
  const remainingMs = endTime - Date.now();
  if (remainingMs <= 0) return;
  sleepEndTime = endTime;
  saveSleepState(endTime, minutes);
  updateSleepUI(minutes);
  tickSleepDisplay();
  sleepIntervalId = setInterval(tickSleepDisplay, 1000);
  sleepTimerId = setTimeout(() => {
    fadeAndPause(Math.min(SLEEP_FADE_MS, Math.max(0, sleepEndTime - Date.now())));
  }, Math.max(0, remainingMs - SLEEP_FADE_MS));
}

sleepSection?.addEventListener('click', e => {
  const btn = e.target.closest('.sleep-btn');
  if (!btn) return;
  if (btn.id === 'sleepCancel') { clearSleepTimer(); return; }
  const minutes = parseInt(btn.dataset.minutes, 10);
  if (minutes) startSleepTimer(minutes);
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space')      { e.preventDefault(); playBtn.click(); }
  if (e.code === 'ArrowLeft')  rewindBtn.click();
  if (e.code === 'ArrowRight') forwardBtn.click();
  if (e.code === 'KeyN')       playNext();
  if (e.code === 'KeyP')       playPrev();
  if (e.code === 'KeyB')       addBookmark();
  if (e.code === 'KeyS')       cycleSpeed();
  if (e.code === 'Escape')     { closeAllSheets(); closeLibraryPanel(); }
});

// ===== Init =====
async function init() {
  initMediaSession();

  try { db = await openDB(); } catch (e) { console.warn('IndexedDB unavailable:', e); }

  const meta = loadLibraryMeta();
  state.library = meta;

  if (db && state.library.length > 0) {
    const storedIds = new Set(await dbGetAllIds());
    for (const item of state.library) {
      if (item.type === 'single' && storedIds.has(item.id)) {
        const f = await dbGet(item.id);
        if (f) item.url = URL.createObjectURL(f);
      } else if (item.type === 'group') {
        for (const t of item.tracks) {
          if (storedIds.has(t.id)) {
            const f = await dbGet(t.id);
            if (f) t.url = URL.createObjectURL(f);
          }
        }
        const coverId = 'cover_' + item.id;
        if (storedIds.has(coverId)) {
          const coverFile = await dbGet(coverId);
          if (coverFile) state.covers[item.id] = URL.createObjectURL(coverFile);
        }
      }
    }
  }

  // Restore speed
  applySpeed(loadSpeed());

  // Restore volume
  const vol = loadVolume();
  audio.volume = vol;
  volumeSlider.value = vol;

  // Restore theme
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

  // Restore sleep timer
  const savedSleep = loadSleepState();
  if (savedSleep?.endTime > Date.now()) {
    scheduleSleepTimer(savedSleep.endTime, savedSleep.minutes, { restoreVolume: false });
  } else {
    saveSleepState(0);
  }

  // Init bookmarks display
  renderBookmarks();

  // Auto-load last track
  const lastId = localStorage.getItem(CURRENT_KEY);
  if (lastId) {
    const ctx = findTrack(lastId);
    if (ctx?.track.url) {
      state.currentId = lastId;
      updatePlayerTitle(ctx.track, ctx.group);
      applyCoverForTrack(ctx.track, ctx.group);
      const pos = loadProgress(lastId);
      if (pos > 5) showContinueBanner(ctx.track, ctx.group, pos);
    }
  }

  renderAll();
}

init();
