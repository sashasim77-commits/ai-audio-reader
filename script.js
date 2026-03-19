'use strict';

// ===== State =====
const state = {
  library: [],   // { id, name, size, url, duration }
  currentId: null,
  isPlaying: false,
  speed: 1,
};

const STORAGE_KEY   = 'air_library';
const PROGRESS_KEY  = 'air_progress';
const CURRENT_KEY   = 'air_current';

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

// ===== Utilities =====
function formatTime(s) {
  if (!isFinite(s) || s < 0) return '0:00';
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
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
  return filename.replace(/\.(mp3|m4a|ogg|wav|aac|flac|opus|m4b)$/i, '');
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

// ===== Persistence =====
function saveLibraryMeta() {
  const meta = state.library.map(({ id, name, size, duration }) => ({ id, name, size, duration }));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(meta)); } catch {}
}

function loadLibraryMeta() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

// --- Per-track progress (key = book id, value = seconds) ---
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
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return all[id] || 0;
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

// ===== Progress throttle (save max once per 5 s) =====
let lastSaveTime = 0;
function throttledSaveProgress() {
  const now = Date.now();
  if (state.currentId && now - lastSaveTime >= 5000) {
    saveProgress(state.currentId, audio.currentTime);
    lastSaveTime = now;
  }
}

// ===== Library =====
function renderLibrary() {
  if (state.library.length === 0) {
    libraryList.innerHTML = `
      <div class="empty-library">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48">
          <path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-3c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
        </svg>
        <p>No audiobooks yet.<br/>Tap ↑ to upload files.</p>
      </div>`;
    return;
  }

  libraryList.innerHTML = state.library.map(book => {
    const pos = loadProgress(book.id);
    const pct = book.duration > 0 ? Math.round((pos / book.duration) * 100) : 0;
    const isActive = book.id === state.currentId;
    const completed = pct >= 98;
    return `
      <div class="library-item ${isActive ? 'active' : ''}" data-id="${book.id}">
        <div class="library-item-cover ${isActive && state.isPlaying ? 'spinning' : ''}">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="library-item-info">
          <div class="library-item-title">${escapeHtml(book.name)}</div>
          <div class="library-item-meta">
            <span>${formatTime(book.duration || 0)}</span>
            ${completed ? '<span class="badge-done">✓ done</span>' : pct > 0 ? `<span>· ${pct}%</span>` : ''}
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

// ===== Player =====
function loadBook(id) {
  const book = state.library.find(b => b.id === id);
  if (!book || !book.url) {
    showToast('File not in session — please re-upload');
    renderLibrary();
    return;
  }

  // Save position of the previous track before switching
  if (state.currentId && state.currentId !== id && audio.currentTime > 0) {
    saveProgress(state.currentId, audio.currentTime);
  }

  state.currentId = id;
  saveCurrentId(id);

  audio.src = book.url;
  audio.playbackRate = state.speed;

  trackTitle.textContent = book.name;
  trackAuthor.textContent = formatSize(book.size) + (book.duration ? ' · ' + formatTime(book.duration) : '');

  const savedPos = loadProgress(id);

  audio.addEventListener('loadedmetadata', () => {
    // Restore position (leave 3 s buffer at end to not skip completed books)
    if (savedPos > 0 && savedPos < audio.duration - 3) {
      audio.currentTime = savedPos;
    }
    if (!book.duration || book.duration !== audio.duration) {
      book.duration = audio.duration;
      saveLibraryMeta();
    }
    trackAuthor.textContent = formatSize(book.size) + ' · ' + formatTime(audio.duration);
    renderLibrary();
    updateMediaSession(book);
  }, { once: true });

  playAudio();
  renderLibrary();
}

function playAudio() {
  audio.play().catch(() => {});
}

function pauseAudio() {
  audio.pause();
}

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
  // If < 3 s into track, go to previous; otherwise restart current
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const idx = state.library.findIndex(b => b.id === state.currentId);
  const prev = state.library[idx - 1];
  if (prev) loadBook(prev.id);
}

// ===== Media Session API (lock screen / headphone controls) =====
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
  navigator.mediaSession.setActionHandler('play', playAudio);
  navigator.mediaSession.setActionHandler('pause', pauseAudio);
  navigator.mediaSession.setActionHandler('seekbackward', ({ seekOffset }) => {
    audio.currentTime = Math.max(0, audio.currentTime - (seekOffset || 15));
  });
  navigator.mediaSession.setActionHandler('seekforward', ({ seekOffset }) => {
    audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + (seekOffset || 15));
  });
  navigator.mediaSession.setActionHandler('previoustrack', playPrev);
  navigator.mediaSession.setActionHandler('nexttrack', playNext);
  // seekto for timeline scrubbing
  try {
    navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) => {
      if (isFinite(seekTime)) audio.currentTime = seekTime;
    });
  } catch {}
}

// ===== File Upload =====
function handleFiles(files) {
  const AUDIO_EXT = /\.(mp3|m4a|m4b|ogg|wav|aac|flac|opus)$/i;
  const audioFiles = Array.from(files).filter(
    f => f.type.startsWith('audio/') || AUDIO_EXT.test(f.name)
  );

  if (audioFiles.length === 0) { showToast('No audio files found'); return; }

  let added = 0;
  audioFiles.forEach(file => {
    const name = cleanName(file.name);

    // Dedup: same cleaned name + same size
    const exists = state.library.find(b => b.name === name && b.size === file.size);
    if (exists) {
      if (exists.url) URL.revokeObjectURL(exists.url);
      exists.url = URL.createObjectURL(file);
      if (state.currentId === exists.id) {
        // Re-establish src without resetting position
        const pos = audio.currentTime;
        audio.src = exists.url;
        audio.currentTime = pos;
      }
      return;
    }

    const id = generateId();
    const url = URL.createObjectURL(file);
    const book = { id, name, size: file.size, url, duration: 0 };
    state.library.push(book);
    added++;

    // Read duration without blocking UI
    const tmp = new Audio();
    tmp.preload = 'metadata';
    tmp.addEventListener('loadedmetadata', () => {
      book.duration = tmp.duration;
      tmp.src = '';
      saveLibraryMeta();
      renderLibrary();
    }, { once: true });
    tmp.src = url;
  });

  saveLibraryMeta();
  renderLibrary();

  if (added > 0) showToast(`Added ${added} file${added > 1 ? 's' : ''}`);

  // Auto-load first track if nothing is playing
  if (!state.currentId && state.library.length > 0) {
    const first = state.library.find(b => b.url);
    if (first) setTimeout(() => loadBook(first.id), 200);
  }
}

// ===== Progress Bar =====
function updateProgress() {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  progressFill.style.width = pct + '%';
  progressThumb.style.left = pct + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);

  // Update Media Session position state
  if ('mediaSession' in navigator && audio.duration) {
    try {
      navigator.mediaSession.setPositionState({
        duration: audio.duration,
        playbackRate: audio.playbackRate,
        position: audio.currentTime,
      });
    } catch {}
  }
}

function seekFromEvent(e) {
  const rect = progressBar.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  if (audio.duration) {
    audio.currentTime = pct * audio.duration;
    updateProgress();
  }
}

// ===== Event Listeners =====

// Audio state events
audio.addEventListener('play', () => {
  state.isPlaying = true;
  updatePlayUI();
  renderLibrary();
});
audio.addEventListener('pause', () => {
  state.isPlaying = false;
  updatePlayUI();
  renderLibrary();
  // Save immediately on pause
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});
audio.addEventListener('ended', () => {
  state.isPlaying = false;
  updatePlayUI();
  if (state.currentId) saveProgress(state.currentId, 0); // Reset so it shows 0% after finish
  renderLibrary();
  // Auto-advance to next track
  playNext();
});
audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});
audio.addEventListener('timeupdate', () => {
  updateProgress();
  throttledSaveProgress();
});

// Save progress when tab is hidden (phone screen lock, background)
document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.currentId) {
    saveProgress(state.currentId, audio.currentTime);
  }
});

// Save before page unload / PWA close
window.addEventListener('beforeunload', () => {
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});
window.addEventListener('pagehide', () => {
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});

// Play / Pause button
playBtn.addEventListener('click', () => {
  if (!audio.src) { showToast('Upload a file first'); return; }
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
document.addEventListener('mousemove', e => { if (dragging) seekFromEvent(e); });
document.addEventListener('mouseup', () => { dragging = false; });

// Progress bar — touch
progressBar.addEventListener('touchstart', e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });
progressBar.addEventListener('touchmove', e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });

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

// Upload
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { handleFiles(e.target.files); fileInput.value = ''; });

// Drag & drop
document.addEventListener('dragover', e => e.preventDefault());
document.addEventListener('drop', e => { e.preventDefault(); handleFiles(e.dataTransfer.files); });

// Library panel
menuBtn.addEventListener('click', openLibrary);
closeLibrary.addEventListener('click', closeLibraryPanel);
overlay.addEventListener('click', closeLibraryPanel);

function openLibrary() {
  libraryPanel.classList.add('open');
  overlay.classList.add('visible');
  renderLibrary();
}

function closeLibraryPanel() {
  libraryPanel.classList.remove('open');
  overlay.classList.remove('visible');
}

// Library delegated clicks
libraryList.addEventListener('click', e => {
  const deleteBtn = e.target.closest('[data-delete]');
  if (deleteBtn) { removeBook(deleteBtn.dataset.delete); return; }

  const resetBtn = e.target.closest('[data-reset]');
  if (resetBtn) { resetProgress(resetBtn.dataset.reset); return; }

  const item = e.target.closest('.library-item[data-id]');
  if (item) { loadBook(item.dataset.id); closeLibraryPanel(); }
});

function removeBook(id) {
  const idx = state.library.findIndex(b => b.id === id);
  if (idx === -1) return;
  const book = state.library[idx];
  if (book.url) URL.revokeObjectURL(book.url);
  state.library.splice(idx, 1);
  clearProgress(id);
  saveLibraryMeta();

  if (state.currentId === id) {
    audio.pause();
    audio.src = '';
    state.currentId = null;
    state.isPlaying = false;
    saveCurrentId(null);
    updatePlayUI();
    trackTitle.textContent = 'Select an audiobook';
    trackAuthor.textContent = 'Upload audio files to begin';
    progressFill.style.width = '0%';
    progressThumb.style.left = '0%';
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';
  }
  renderLibrary();
  showToast('Removed from library');
}

function resetProgress(id) {
  clearProgress(id);
  if (state.currentId === id) {
    audio.currentTime = 0;
    updateProgress();
  }
  renderLibrary();
  showToast('Progress reset');
}

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
  if (e.code === 'ArrowLeft') rewindBtn.click();
  if (e.code === 'ArrowRight') forwardBtn.click();
  if (e.code === 'KeyN') playNext();
  if (e.code === 'KeyP') playPrev();
});

// ===== Init =====
function init() {
  initMediaSession();

  // Restore library metadata (blob URLs don't survive sessions — user must re-upload)
  const meta = loadLibraryMeta();
  state.library = meta.map(m => ({ ...m, url: null }));

  renderLibrary();
}

init();
