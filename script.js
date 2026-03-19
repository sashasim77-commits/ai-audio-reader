'use strict';

// ===== State =====
const state = {
  library: [],   // { id, name, size, url, duration }
  currentId: null,
  isPlaying: false,
  speed: 1,
};

const STORAGE_KEY  = 'air_library';
const PROGRESS_KEY = 'air_progress';
const CURRENT_KEY  = 'air_current';
const AUDIO_EXT    = /\.(mp3|m4a|m4b|ogg|wav|aac|flac|opus)$/i;

// ===== IndexedDB (stores actual File objects so they survive F5) =====
const IDB_NAME    = 'AudioReaderDB';
const IDB_VERSION = 1;
const IDB_STORE   = 'files';
let db = null;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = e => {
      e.target.result.createObjectStore(IDB_STORE, { keyPath: 'id' });
    };
    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = () => reject(req.error);
  });
}

function dbPut(id, file) {
  if (!db) return Promise.resolve();
  return new Promise(resolve => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put({ id, file });
    tx.oncomplete = resolve;
    tx.onerror    = resolve; // don't reject — storage quota errors are non-fatal
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
    tx.objectStore(IDB_STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror    = resolve;
  });
}

function dbGetAllIds() {
  if (!db) return Promise.resolve([]);
  return new Promise(resolve => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).getAllKeys();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror   = () => resolve([]);
  });
}

// ===== DOM refs =====
const audio         = document.getElementById('audioPlayer');
const playBtn       = document.getElementById('playBtn');
const playIcon      = playBtn.querySelector('.play-icon');
const pauseIcon     = playBtn.querySelector('.pause-icon');
const rewindBtn     = document.getElementById('rewindBtn');
const forwardBtn    = document.getElementById('forwardBtn');
const progressBar   = document.getElementById('progressBar');
const progressFill  = document.getElementById('progressFill');
const progressThumb = document.getElementById('progressThumb');
const currentTimeEl = document.getElementById('currentTime');
const durationEl    = document.getElementById('duration');
const trackTitle    = document.getElementById('trackTitle');
const trackAuthor   = document.getElementById('trackAuthor');
const coverArt      = document.getElementById('coverArt');
const volumeSlider  = document.getElementById('volumeSlider');
const libraryPanel  = document.getElementById('libraryPanel');
const libraryList   = document.getElementById('libraryList');
const overlay       = document.getElementById('overlay');
const menuBtn       = document.getElementById('menuBtn');
const closeLibrary  = document.getElementById('closeLibrary');
const uploadBtn     = document.getElementById('uploadBtn');
const fileInput     = document.getElementById('fileInput');
const folderBtn     = document.getElementById('folderBtn');
const folderInput   = document.getElementById('folderInput');
const continueBanner   = document.getElementById('continueBanner');
const continueBookName = document.getElementById('continueBookName');
const continuePos      = document.getElementById('continuePos');
const continueBtn      = document.getElementById('continueBtn');
const continueDismiss  = document.getElementById('continueDismiss');
const playlistSection  = document.getElementById('playlistSection');
const playlistCount    = document.getElementById('playlistCount');
const playlistItems    = document.getElementById('playlistItems');

// ===== Utilities =====
function formatTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  return `${m}:${String(sec).padStart(2,'0')}`;
}

function formatSize(bytes) {
  if (!bytes) return '';
  return bytes < 1048576
    ? (bytes / 1024).toFixed(0) + ' KB'
    : (bytes / 1048576).toFixed(1) + ' MB';
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function cleanName(filename) {
  // Strip folder path (webkitdirectory includes full relative path)
  const base = filename.split('/').pop().split('\\').pop();
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

// ===== localStorage Persistence =====
function saveLibraryMeta() {
  const meta = state.library.map(({ id, name, size, duration }) => ({ id, name, size, duration }));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(meta)); } catch {}
}

function loadLibraryMeta() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function saveProgress(id, position) {
  if (!id || !isFinite(position)) return;
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    all[id] = Math.floor(position);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

function loadProgress(id) {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}')[id] || 0;
  } catch { return 0; }
}

function clearProgress(id) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    delete all[id];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

function saveCurrentId(id) {
  try { localStorage.setItem(CURRENT_KEY, id || ''); } catch {}
}

// ===== Progress throttle =====
let lastSaveTime = 0;
function throttledSaveProgress() {
  const now = Date.now();
  if (state.currentId && now - lastSaveTime >= 5000) {
    saveProgress(state.currentId, audio.currentTime);
    lastSaveTime = now;
  }
}

// ===== Continue Banner =====
function showContinueBanner(book, position) {
  continueBookName.textContent = book.name;
  continuePos.textContent      = 'from ' + formatTime(position);
  continueBanner.dataset.bookId   = book.id;
  continueBanner.dataset.position = position;
  continueBanner.hidden = false;
}

function hideContinueBanner() {
  continueBanner.hidden = true;
}

continueBtn.addEventListener('click', () => {
  const id  = continueBanner.dataset.bookId;
  const pos = parseFloat(continueBanner.dataset.position) || 0;
  hideContinueBanner();
  if (!id) return;
  const book = state.library.find(b => b.id === id);
  if (!book || !book.url) { showToast('File not found — please re-upload'); return; }
  // Load without resetting progress: set position after metadata loads
  state.currentId = id;
  saveCurrentId(id);
  audio.src = book.url;
  audio.playbackRate = state.speed;
  audio.addEventListener('loadedmetadata', () => {
    audio.currentTime = Math.min(pos, audio.duration - 1);
  }, { once: true });
  playAudio();
  updatePlayerInfo(book);
  renderAll();
});

continueDismiss.addEventListener('click', hideContinueBanner);

// ===== Library Rendering (sidebar) =====
function renderLibrary() {
  if (state.library.length === 0) {
    libraryList.innerHTML = `
      <div class="empty-library">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
        </svg>
        <p>No audiobooks yet.<br/>Tap the folder or ↑ button to add files.</p>
      </div>`;
    return;
  }

  libraryList.innerHTML = state.library.map(book => {
    const pos  = loadProgress(book.id);
    const pct  = book.duration > 0 ? Math.round((pos / book.duration) * 100) : 0;
    const done = pct >= 98;
    const isActive = book.id === state.currentId;
    const noFile   = !book.url;
    return `
      <div class="library-item ${isActive ? 'active' : ''} ${noFile ? 'no-file' : ''}" data-id="${book.id}">
        <div class="library-item-cover ${isActive && state.isPlaying ? 'spinning' : ''}">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="library-item-info">
          <div class="library-item-title">${escapeHtml(book.name)}</div>
          <div class="library-item-meta">
            <span>${formatTime(book.duration || 0)}</span>
            ${done ? '<span class="badge-done">✓ done</span>' : pct > 0 ? `<span>· ${pct}%</span>` : ''}
            ${noFile ? '<span class="badge-upload">⚠ re-upload</span>' : ''}
          </div>
          <div class="library-progress-bar">
            <div class="library-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="library-item-actions">
          ${pct > 0 ? `<button class="lib-action-btn" data-reset="${book.id}" title="Reset progress">↩</button>` : ''}
          <button class="library-item-delete" data-delete="${book.id}" title="Remove">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
            </svg>
          </button>
        </div>
      </div>`;
  }).join('');
}

// ===== Inline Playlist Rendering =====
function renderPlaylist() {
  if (state.library.length === 0) {
    playlistSection.hidden = true;
    return;
  }
  playlistSection.hidden = false;
  playlistCount.textContent = `${state.library.length} track${state.library.length !== 1 ? 's' : ''}`;

  playlistItems.innerHTML = state.library.map((book, i) => {
    const isActive = book.id === state.currentId;
    const pos = loadProgress(book.id);
    const pct = book.duration > 0 ? (pos / book.duration) * 100 : 0;
    const noFile = !book.url;
    return `
      <div class="playlist-item ${isActive ? 'active' : ''} ${noFile ? 'no-file' : ''}" data-id="${book.id}">
        <div class="playlist-num">
          ${isActive && state.isPlaying
            ? `<span class="playing-bars"><span></span><span></span><span></span></span>`
            : `<span class="track-num">${i + 1}</span>`}
        </div>
        <div class="playlist-info">
          <div class="playlist-name">${escapeHtml(book.name)}</div>
          ${pct > 0 ? `<div class="playlist-bar"><div class="playlist-bar-fill" style="width:${pct}%"></div></div>` : ''}
        </div>
        <span class="playlist-duration">${book.duration ? formatTime(book.duration) : noFile ? '⚠' : '—'}</span>
      </div>`;
  }).join('');
}

function renderAll() {
  renderLibrary();
  renderPlaylist();
}

// ===== Player =====
function updatePlayerInfo(book) {
  trackTitle.textContent  = book.name;
  trackAuthor.textContent = formatSize(book.size) + (book.duration ? ' · ' + formatTime(book.duration) : '');
}

function loadBook(id) {
  const book = state.library.find(b => b.id === id);
  if (!book) return;
  if (!book.url) {
    showToast('File not in session — please re-upload');
    return;
  }

  // Save position of the outgoing track
  if (state.currentId && state.currentId !== id && audio.currentTime > 1) {
    saveProgress(state.currentId, audio.currentTime);
  }

  state.currentId = id;
  saveCurrentId(id);
  hideContinueBanner();

  audio.src = book.url;
  audio.playbackRate = state.speed;

  updatePlayerInfo(book);

  const savedPos = loadProgress(id);
  audio.addEventListener('loadedmetadata', () => {
    if (savedPos > 0 && savedPos < audio.duration - 3) {
      audio.currentTime = savedPos;
    }
    if (!book.duration || book.duration !== audio.duration) {
      book.duration = audio.duration;
      saveLibraryMeta();
    }
    trackAuthor.textContent = formatSize(book.size) + ' · ' + formatTime(audio.duration);
    renderAll();
    updateMediaSession(book);
  }, { once: true });

  playAudio();
  renderAll();
}

function playAudio()  { audio.play().catch(() => {}); }
function pauseAudio() { audio.pause(); }

function updatePlayUI() {
  if (state.isPlaying) {
    playIcon.classList.add('hidden');
    pauseIcon.classList.remove('hidden');
    coverArt.classList.add('playing');
  } else {
    playIcon.classList.remove('hidden');
    pauseIcon.classList.add('hidden');
    coverArt.classList.remove('playing');
  }
}

function playNext() {
  const idx = state.library.findIndex(b => b.id === state.currentId);
  const next = state.library[idx + 1];
  if (next) loadBook(next.id);
}

function playPrev() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  const idx = state.library.findIndex(b => b.id === state.currentId);
  const prev = state.library[idx - 1];
  if (prev) loadBook(prev.id);
}

// ===== Media Session API =====
function updateMediaSession(book) {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.metadata = new MediaMetadata({
    title: book.name,
    artist: 'AI Audio Reader',
    album: '',
    artwork: [{ src: 'icons/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  });
}

function initMediaSession() {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.setActionHandler('play',         playAudio);
  navigator.mediaSession.setActionHandler('pause',        pauseAudio);
  navigator.mediaSession.setActionHandler('previoustrack', playPrev);
  navigator.mediaSession.setActionHandler('nexttrack',    playNext);
  navigator.mediaSession.setActionHandler('seekbackward', ({ seekOffset }) => {
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
  // Filter audio files and sort by path (preserves chapter/disc order from folders)
  const audioFiles = Array.from(files)
    .filter(f => f.type.startsWith('audio/') || AUDIO_EXT.test(f.name))
    .sort((a, b) => {
      const pa = f => (f.webkitRelativePath || f.name).toLowerCase();
      return pa(a).localeCompare(pa(b), undefined, { numeric: true });
    });

  if (audioFiles.length === 0) { showToast('No audio files found'); return; }

  let added = 0;

  for (const file of audioFiles) {
    const name = cleanName(file.webkitRelativePath || file.name);

    // Dedup by cleaned name + size
    const exists = state.library.find(b => b.name === name && b.size === file.size);
    if (exists) {
      // Refresh the blob URL and update IndexedDB
      if (exists.url) URL.revokeObjectURL(exists.url);
      exists.url = URL.createObjectURL(file);
      await dbPut(exists.id, file);
      if (state.currentId === exists.id) {
        const pos = audio.currentTime;
        audio.src  = exists.url;
        audio.addEventListener('loadedmetadata', () => { audio.currentTime = pos; }, { once: true });
      }
      continue;
    }

    const id  = generateId();
    const url = URL.createObjectURL(file);
    const book = { id, name, size: file.size, url, duration: 0 };
    state.library.push(book);
    added++;

    // Persist file in IndexedDB (non-blocking)
    dbPut(id, file);

    // Read duration without blocking
    const tmp = new Audio();
    tmp.preload = 'metadata';
    tmp.addEventListener('loadedmetadata', () => {
      book.duration = tmp.duration;
      tmp.src = '';
      saveLibraryMeta();
      renderAll();
    }, { once: true });
    tmp.src = url;
  }

  saveLibraryMeta();
  renderAll();

  if (added > 0) {
    showToast(`Added ${added} file${added > 1 ? 's' : ''}`);
  } else if (audioFiles.length > 0) {
    showToast('Files already in library — URLs refreshed');
  }

  // Auto-load first track if nothing is currently set
  if (!state.currentId) {
    const first = state.library.find(b => b.url);
    if (first) setTimeout(() => {
      trackTitle.textContent  = first.name;
      trackAuthor.textContent = formatSize(first.size);
    }, 50);
  }
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
    try {
      navigator.mediaSession.setPositionState({
        duration:     audio.duration,
        playbackRate: audio.playbackRate,
        position:     audio.currentTime,
      });
    } catch {}
  }
}

function seekFromEvent(e) {
  const rect   = progressBar.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct    = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  if (audio.duration) {
    audio.currentTime = pct * audio.duration;
    updateProgress();
  }
}

// ===== Event Listeners =====

// Audio state
audio.addEventListener('play', () => {
  state.isPlaying = true;
  updatePlayUI();
  renderAll();
});
audio.addEventListener('pause', () => {
  state.isPlaying = false;
  updatePlayUI();
  renderAll();
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});
audio.addEventListener('ended', () => {
  state.isPlaying = false;
  updatePlayUI();
  if (state.currentId) saveProgress(state.currentId, 0); // Reset to 0 = finished
  renderAll();
  playNext(); // Auto-advance
});
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  updateProgress();
  throttledSaveProgress();
});

// Save on tab hide / phone lock screen / close
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.currentId) saveProgress(state.currentId, audio.currentTime);
});
window.addEventListener('beforeunload', () => {
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});
window.addEventListener('pagehide', () => {
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});

// Play/Pause
playBtn.addEventListener('click', () => {
  if (!audio.src) { showToast('Select a track first'); return; }
  state.isPlaying ? pauseAudio() : playAudio();
});

// Rewind / Forward
rewindBtn.addEventListener('click', () => {
  audio.currentTime = Math.max(0, audio.currentTime - 15);
  updateProgress();
});
forwardBtn.addEventListener('click', () => {
  audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15);
  updateProgress();
});

// Progress bar — mouse
let dragging = false;
progressBar.addEventListener('mousedown', e => { dragging = true; seekFromEvent(e); });
document.addEventListener('mousemove',  e => { if (dragging) seekFromEvent(e); });
document.addEventListener('mouseup',    () => { dragging = false; });

// Progress bar — touch
progressBar.addEventListener('touchstart', e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });
progressBar.addEventListener('touchmove',  e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });

// Speed
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.speed = parseFloat(btn.dataset.speed);
    audio.playbackRate = state.speed;
  });
});

// Volume
volumeSlider.addEventListener('input', () => { audio.volume = parseFloat(volumeSlider.value); });

// File upload (individual files)
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { handleFiles(e.target.files); fileInput.value = ''; });

// Folder upload
folderBtn.addEventListener('click', () => folderInput.click());
folderInput.addEventListener('change', e => { handleFiles(e.target.files); folderInput.value = ''; });

// Drag & drop (files or folders — both work via dataTransfer)
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => { e.preventDefault(); handleFiles(e.dataTransfer.files); });

// Library sidebar
menuBtn.addEventListener('click',    openLibrary);
closeLibrary.addEventListener('click', closeLibraryPanel);
overlay.addEventListener('click',    closeLibraryPanel);

function openLibrary() {
  renderLibrary();
  libraryPanel.classList.add('open');
  overlay.classList.add('visible');
}

function closeLibraryPanel() {
  libraryPanel.classList.remove('open');
  overlay.classList.remove('visible');
}

// Library delegated clicks
libraryList.addEventListener('click', e => {
  const del   = e.target.closest('[data-delete]');
  if (del)   { removeBook(del.dataset.delete); return; }
  const reset = e.target.closest('[data-reset]');
  if (reset) { resetProgress(reset.dataset.reset); return; }
  const item  = e.target.closest('.library-item[data-id]');
  if (item)  { loadBook(item.dataset.id); closeLibraryPanel(); }
});

// Inline playlist delegated clicks
playlistItems.addEventListener('click', e => {
  const item = e.target.closest('.playlist-item[data-id]');
  if (!item) return;
  const id   = item.dataset.id;
  const book = state.library.find(b => b.id === id);
  if (!book?.url) { showToast('Re-upload this file to play it'); return; }
  loadBook(id);
});

async function removeBook(id) {
  const idx = state.library.findIndex(b => b.id === id);
  if (idx === -1) return;
  const book = state.library[idx];
  if (book.url) URL.revokeObjectURL(book.url);
  state.library.splice(idx, 1);
  clearProgress(id);
  saveLibraryMeta();
  await dbDelete(id);

  if (state.currentId === id) {
    audio.pause();
    audio.src      = '';
    state.currentId = null;
    state.isPlaying = false;
    saveCurrentId(null);
    updatePlayUI();
    trackTitle.textContent  = 'Select an audiobook';
    trackAuthor.textContent = 'Upload audio files or a folder to begin';
    progressFill.style.width = '0%';
    progressThumb.style.left = '0%';
    currentTimeEl.textContent = '0:00';
    durationEl.textContent    = '0:00';
  }
  renderAll();
  showToast('Removed from library');
}

function resetProgress(id) {
  clearProgress(id);
  if (state.currentId === id) { audio.currentTime = 0; updateProgress(); }
  renderAll();
  showToast('Progress reset');
}

// Keyboard shortcuts
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

  // Open IndexedDB
  try { db = await openDB(); } catch (e) { console.warn('IndexedDB unavailable:', e); }

  // Load library metadata from localStorage
  const meta = loadLibraryMeta();
  state.library = meta.map(m => ({ ...m, url: null }));

  // Restore blob URLs from IndexedDB for all known tracks
  if (db && state.library.length > 0) {
    const storedIds = await dbGetAllIds();
    for (const book of state.library) {
      if (storedIds.includes(book.id)) {
        const file = await dbGet(book.id);
        if (file) book.url = URL.createObjectURL(file);
      }
    }
  }

  // Show "Continue listening" banner if there's a saved track with progress
  const lastId = localStorage.getItem(CURRENT_KEY);
  if (lastId) {
    const book = state.library.find(b => b.id === lastId);
    const pos  = loadProgress(lastId);
    if (book && book.url && pos > 10) {
      // Pre-fill player info (don't auto-play)
      state.currentId = lastId;
      updatePlayerInfo(book);
      showContinueBanner(book, pos);
    }
  }

  renderAll();
}

init();
