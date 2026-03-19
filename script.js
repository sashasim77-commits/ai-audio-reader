'use strict';

// ===== State =====
const state = {
  // library items: { type:'single', id, name, size, url, duration }
  //            or: { type:'group',  id, name, collapsed, tracks:[...] }
  library: [],
  currentId: null,
  isPlaying: false,
  speed: 1,
};

const STORAGE_KEY  = 'air_library';
const PROGRESS_KEY = 'air_progress';
const CURRENT_KEY  = 'air_current';
const SPEED_KEY    = 'air_speed';
const VOLUME_KEY   = 'air_volume';
const THEME_KEY    = 'air_theme';
const AUDIO_EXT    = /\.(mp3|m4a|m4b|ogg|wav|aac|flac|opus)$/i;

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
const progressBar     = document.getElementById('progressBar');
const progressFill    = document.getElementById('progressFill');
const progressThumb   = document.getElementById('progressThumb');
const currentTimeEl   = document.getElementById('currentTime');
const durationEl      = document.getElementById('duration');
const trackTitle      = document.getElementById('trackTitle');
const trackAuthor     = document.getElementById('trackAuthor');
const coverArt        = document.getElementById('coverArt');
const volumeSlider    = document.getElementById('volumeSlider');
const libraryPanel    = document.getElementById('libraryPanel');
const libraryList     = document.getElementById('libraryList');
const overlay         = document.getElementById('overlay');
const menuBtn         = document.getElementById('menuBtn');
const closeLibrary    = document.getElementById('closeLibrary');
const clearLibraryBtn = document.getElementById('clearLibraryBtn');
const uploadBtn       = document.getElementById('uploadBtn');
const fileInput       = document.getElementById('fileInput');
const folderBtn       = document.getElementById('folderBtn');
const folderInput     = document.getElementById('folderInput');
const continueBanner  = document.getElementById('continueBanner');
const continueBookName= document.getElementById('continueBookName');
const continuePos     = document.getElementById('continuePos');
const continueBtn     = document.getElementById('continueBtn');
const continueDismiss = document.getElementById('continueDismiss');
const playlistSection = document.getElementById('playlistSection');
const playlistCount   = document.getElementById('playlistCount');
const playlistItems   = document.getElementById('playlistItems');
const vizCanvas       = document.getElementById('vizCanvas');

// ===== Web Audio / Visualizer =====
let audioCtx = null, analyser = null, vizRAF = null;
let cachedGrad = null, cachedGradH = 0;

async function initAudioCtx() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;                // 64 frequency bins
    analyser.smoothingTimeConstant = 0.82;
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
  vizRAF = requestAnimationFrame(tickViz);
  if (!analyser || !vizCanvas) return;

  const ctx = vizCanvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const W   = vizCanvas.offsetWidth;
  const H   = vizCanvas.offsetHeight;

  // Resize canvas to match CSS size (invalidates cached gradient)
  if (vizCanvas.width !== W * dpr || vizCanvas.height !== H * dpr) {
    vizCanvas.width  = W * dpr;
    vizCanvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    cachedGrad = null;
  }

  const bins  = Math.floor(analyser.frequencyBinCount * 0.65); // lower spectrum
  const data  = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);

  ctx.clearRect(0, 0, W, H);

  // Cache gradient
  if (!cachedGrad || cachedGradH !== H) {
    cachedGrad  = ctx.createLinearGradient(0, H, 0, 0);
    cachedGrad.addColorStop(0,   '#00f5d4');
    cachedGrad.addColorStop(0.45,'#7b2fff');
    cachedGrad.addColorStop(1,   '#ff2d78');
    cachedGradH = H;
  }

  const gap  = 2;
  const barW = Math.max(2, (W - gap * (bins - 1)) / bins);

  ctx.fillStyle = cachedGrad;
  ctx.shadowColor = '#00f5d4';
  ctx.shadowBlur  = state.isPlaying ? 8 : 0;

  for (let i = 0; i < bins; i++) {
    const v    = data[i] / 255;
    const barH = Math.max(2, v * H * 0.96);
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

// ===== Library Helpers =====
// Get track + its parent group (or null for singles)
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

// All playable tracks in order
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
      if (!item.type) return { ...item, type: 'single', url: null }; // backward compat
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

// ===== Speed Persistence =====
function saveSpeed(v) { try { localStorage.setItem(SPEED_KEY, v); } catch {} }
function loadSpeed()  { return parseFloat(localStorage.getItem(SPEED_KEY) || '1'); }

function applySpeed(v) {
  state.speed = v;
  audio.playbackRate = v;
  saveSpeed(v);
  document.querySelectorAll('.speed-btn').forEach(b =>
    b.classList.toggle('active', parseFloat(b.dataset.speed) === v)
  );
}

// ===== Volume Persistence =====
function saveVolume(v) { try { localStorage.setItem(VOLUME_KEY, v); } catch {} }
function loadVolume()  { return Math.max(0, Math.min(1, parseFloat(localStorage.getItem(VOLUME_KEY) ?? '1'))); }

// ===== Theme =====
const SVG_SUN  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
const SVG_MOON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeBtn');
  if (!btn) return;
  if (theme === 'dark') {
    btn.innerHTML = SVG_SUN;
    btn.title = 'Switch to light theme';
    btn.setAttribute('aria-label', 'Switch to light theme');
  } else {
    btn.innerHTML = SVG_MOON;
    btn.title = 'Switch to dark theme';
    btn.setAttribute('aria-label', 'Switch to dark theme');
  }
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}

// ===== Continue Banner =====
function showContinueBanner(track, group, pos) {
  continueBookName.textContent = group ? `${group.name} › ${track.name}` : track.name;
  continuePos.textContent      = 'from ' + formatTime(pos);
  continueBanner.dataset.trackId = track.id;
  continueBanner.dataset.pos     = pos;
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
  const { track } = ctx;
  state.currentId = id;
  saveCurrentId(id);
  audio.src = track.url;
  audio.playbackRate = state.speed;
  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = Math.min(pos, audio.duration - 1);
  }, { once: true });
  updatePlayerTitle(ctx.track, ctx.group);
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
        <p>No audiobooks yet.<br/>Use 📁 to add a folder<br/>or ↑ to add files.</p>
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

  return `
    <div class="library-group ${hasActive ? 'active' : ''} ${expanded ? 'expanded' : ''}" data-group-id="${group.id}">
      <div class="group-header">
        <div class="group-toggle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
        <div class="group-cover">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="group-info">
          <div class="group-name">${escapeHtml(group.name)}</div>
          <div class="group-meta">${tracks.length} tracks · ${formatTime(total)}${pct > 0 ? ` · ${pct}%` : ''}</div>
          <div class="library-progress-bar"><div class="library-progress-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="group-actions">
          <button class="library-item-delete" data-delete-group="${group.id}" title="Remove book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
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
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>
    </div>`;
}

// ===== Inline Playlist Render =====
function renderPlaylist() {
  const flat = getFlatTracks();
  if (flat.length === 0) { playlistSection.hidden = true; return; }

  playlistSection.hidden = false;
  playlistCount.textContent = flat.length + ' track' + (flat.length !== 1 ? 's' : '');

  let html = '';
  let trackIdx = 0;

  for (const item of state.library) {
    if (item.type === 'group') {
      html += `<div class="playlist-group-header">${escapeHtml(item.name)}</div>`;
      for (const t of item.tracks) {
        html += renderPlaylistItem(t, ++trackIdx);
      }
    } else {
      html += renderPlaylistItem(item, ++trackIdx);
    }
  }

  playlistItems.innerHTML = html;
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

function renderAll() { renderLibrary(); renderPlaylist(); }

// ===== Player =====
function updatePlayerTitle(track, group) {
  trackTitle.textContent  = track.name;
  trackAuthor.textContent = (group ? group.name + ' · ' : '') + formatSize(track.size);
}

function loadBook(id) {
  const ctx = findTrack(id);
  if (!ctx) return;
  const { track, group } = ctx;
  if (!track.url) { showToast('Re-upload required'); return; }

  if (state.currentId && state.currentId !== id && audio.currentTime > 1) {
    saveProgress(state.currentId, audio.currentTime);
  }

  state.currentId = id;
  saveCurrentId(id);
  hideContinueBanner();

  audio.src = track.url;
  audio.playbackRate = state.speed;

  updatePlayerTitle(track, group);

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
  navigator.mediaSession.metadata = new MediaMetadata({
    title:  track.name,
    artist: group ? group.name : 'AI Audio Reader',
    album:  'AI Audio Reader',
    artwork: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
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
  const audioFiles = Array.from(files)
    .filter(f => f.type.startsWith('audio/') || AUDIO_EXT.test(f.name))
    .sort((a, b) => {
      const pa = (a.webkitRelativePath || a.name).toLowerCase();
      const pb = (b.webkitRelativePath || b.name).toLowerCase();
      return pa.localeCompare(pb, undefined, { numeric: true });
    });

  if (!audioFiles.length) { showToast('No audio files found'); return; }

  // Separate by source: folder files have a non-empty webkitRelativePath with '/'
  const folderFiles = audioFiles.filter(f => f.webkitRelativePath?.includes('/'));
  const singleFiles = audioFiles.filter(f => !f.webkitRelativePath?.includes('/'));

  let added = 0;

  // ---- Group folder files by top-level folder name ----
  const grouped = {};
  for (const f of folderFiles) {
    const folder = f.webkitRelativePath.split('/')[0];
    (grouped[folder] ??= []).push(f);
  }

  for (const [folderName, flist] of Object.entries(grouped)) {
    // Find or create group
    let group = state.library.find(g => g.type === 'group' && g.name === folderName);

    if (!group) {
      group = { id: 'g_' + generateId(), type: 'group', name: folderName, collapsed: true, tracks: [] };
      state.library.push(group);
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
      // Get duration async
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

  // ---- Single files ----
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

  // Auto-load first track if nothing selected
  if (!state.currentId) {
    const first = getFlatTracks().find(t => t.url);
    if (first) { const ctx = findTrack(first.id); updatePlayerTitle(ctx.track, ctx.group); }
  }
}

// ===== Clear Library =====
async function clearLibrary() {
  if (!state.library.length) { showToast('Library is already empty'); return; }
  if (!confirm('Clear the entire library? This cannot be undone.')) return;

  audio.pause(); audio.src = '';
  state.isPlaying = false; updatePlayUI();

  // Revoke all blob URLs
  for (const item of state.library) {
    if (item.type === 'single' && item.url) URL.revokeObjectURL(item.url);
    if (item.type === 'group') item.tracks.forEach(t => { if (t.url) URL.revokeObjectURL(t.url); });
  }

  state.library = [];
  state.currentId = null;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(CURRENT_KEY);
  await dbClearAll();

  hideContinueBanner();
  trackTitle.textContent  = 'SELECT A TRACK';
  trackAuthor.textContent = 'Upload audio files or a folder';
  progressFill.style.width = '0%';
  progressThumb.style.left = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent    = '0:00';

  renderAll();
  showToast('Library cleared');
}

// ===== Progress Bar =====
function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width  = pct + '%';
  progressThumb.style.left  = pct + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent    = formatTime(audio.duration);
  if ('mediaSession' in navigator && audio.duration) {
    try { navigator.mediaSession.setPositionState({ duration: audio.duration, playbackRate: audio.playbackRate, position: audio.currentTime }); } catch {}
  }
}

function seekFromEvent(e) {
  const rect   = progressBar.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct    = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  if (audio.duration) { audio.currentTime = pct * audio.duration; updateProgress(); }
}

// ===== Audio Events =====
audio.addEventListener('play',  () => { state.isPlaying = true;  updatePlayUI(); renderAll(); });
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

let dragging = false;
progressBar.addEventListener('mousedown', e => { dragging = true; seekFromEvent(e); });
document.addEventListener('mousemove',  e => { if (dragging) seekFromEvent(e); });
document.addEventListener('mouseup',    () => { dragging = false; });
progressBar.addEventListener('touchstart', e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });
progressBar.addEventListener('touchmove',  e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });

document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => applySpeed(parseFloat(btn.dataset.speed)));
});

volumeSlider.addEventListener('input', () => {
  const v = parseFloat(volumeSlider.value);
  audio.volume = v;
  saveVolume(v);
});

document.getElementById('themeBtn')?.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});

uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { handleFiles(e.target.files); fileInput.value = ''; });

folderBtn.addEventListener('click', () => folderInput.click());
folderInput.addEventListener('change', e => { handleFiles(e.target.files); folderInput.value = ''; });

document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop',     e => { e.preventDefault(); handleFiles(e.dataTransfer.files); });

// Library sidebar
menuBtn.addEventListener('click',      openLibrary);
closeLibrary.addEventListener('click', closeLibraryPanel);
overlay.addEventListener('click',      closeLibraryPanel);
clearLibraryBtn.addEventListener('click', clearLibrary);

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
  // Group toggle (click anywhere on group-header except action buttons)
  const groupEl = e.target.closest('.library-group[data-group-id]');
  const onAction = e.target.closest('.group-actions, .library-item-actions');
  if (groupEl && !onAction) {
    toggleGroup(groupEl.dataset.groupId); return;
  }
  // Track click
  const item = e.target.closest('.library-item[data-id]');
  if (item && !onAction) { loadBook(item.dataset.id); closeLibraryPanel(); }
});

// Inline playlist
playlistItems.addEventListener('click', e => {
  const item = e.target.closest('.playlist-item[data-id]');
  if (!item) return;
  const ctx = findTrack(item.dataset.id);
  if (!ctx?.track.url) { showToast('Re-upload required'); return; }
  loadBook(item.dataset.id);
});

function toggleGroup(groupId) {
  const group = state.library.find(g => g.type === 'group' && g.id === groupId);
  if (!group) return;
  group.collapsed = (group.collapsed !== false); // toggle
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
  saveCurrentId(null); updatePlayUI();
  trackTitle.textContent  = 'SELECT A TRACK';
  trackAuthor.textContent = 'Upload audio files or a folder';
  progressFill.style.width = '0%'; progressThumb.style.left = '0%';
  currentTimeEl.textContent = '0:00'; durationEl.textContent = '0:00';
}

function resetProgress(id) {
  clearProgress(id);
  if (state.currentId === id) { audio.currentTime = 0; updateProgress(); }
  renderAll();
  showToast('Progress reset');
}

// Keyboard
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space')      { e.preventDefault(); playBtn.click(); }
  if (e.code === 'ArrowLeft')  rewindBtn.click();
  if (e.code === 'ArrowRight') forwardBtn.click();
  if (e.code === 'KeyN')       playNext();
  if (e.code === 'KeyP')       playPrev();
});

// ===== Init =====
async function init() {
  initMediaSession();

  try { db = await openDB(); } catch (e) { console.warn('IndexedDB unavailable:', e); }

  const meta = loadLibraryMeta();
  state.library = meta;

  // Restore blob URLs from IndexedDB
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
      }
    }
  }

  // Restore speed
  applySpeed(loadSpeed());

  // Restore volume
  const vol = loadVolume();
  audio.volume = vol;
  volumeSlider.value = vol;

  // Restore theme (before render so no flash)
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');

  // Auto-load last track + show continue banner if saved position > 5s
  const lastId = localStorage.getItem(CURRENT_KEY);
  if (lastId) {
    const ctx = findTrack(lastId);
    if (ctx?.track.url) {
      state.currentId = lastId;
      updatePlayerTitle(ctx.track, ctx.group);
      const pos = loadProgress(lastId);
      if (pos > 5) showContinueBanner(ctx.track, ctx.group, pos);
    }
  }

  renderAll();
}

init();
