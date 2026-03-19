'use strict';

// ===== State =====
const state = {
  library: [],       // { id, name, size, url, duration, progress }
  currentId: null,
  isPlaying: false,
  speed: 1,
};

const STORAGE_KEY = 'ai_audio_reader_library';
const PROGRESS_KEY = 'ai_audio_reader_progress';

// ===== DOM refs =====
const audio      = document.getElementById('audioPlayer');
const playBtn    = document.getElementById('playBtn');
const playIcon   = playBtn.querySelector('.play-icon');
const pauseIcon  = playBtn.querySelector('.pause-icon');
const rewindBtn  = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
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
function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function showToast(msg) {
  let t = document.querySelector('.toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ===== Persistence =====
function saveLibraryMeta() {
  // Save metadata only (not blob URLs — those don't survive sessions)
  const meta = state.library.map(({ id, name, size, duration }) => ({ id, name, size, duration }));
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(meta)); } catch {}
}

function saveProgress(id, position) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    all[id] = position;
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {}
}

function loadProgress(id) {
  try {
    const all = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
    return all[id] || 0;
  } catch { return 0; }
}

function loadLibraryMeta() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

// ===== Library Rendering =====
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
    const progress = loadProgress(book.id);
    const pct = book.duration > 0 ? Math.round((progress / book.duration) * 100) : 0;
    const isActive = book.id === state.currentId;
    return `
      <div class="library-item ${isActive ? 'active' : ''}" data-id="${book.id}">
        <div class="library-item-cover">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="library-item-info">
          <div class="library-item-title">${escapeHtml(book.name)}</div>
          <div class="library-item-meta">
            <span>${formatTime(book.duration || 0)}</span>
            ${pct > 0 ? `<span>· ${pct}%</span>` : ''}
          </div>
          <div class="library-progress-bar">
            <div class="library-progress-fill" style="width:${pct}%"></div>
          </div>
        </div>
        <button class="library-item-delete" data-delete="${book.id}" title="Remove">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </div>`;
  }).join('');
}

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ===== Load & Play =====
function loadBook(id) {
  const book = state.library.find(b => b.id === id);
  if (!book || !book.url) {
    showToast('File not loaded — please re-upload');
    return;
  }

  // Save progress of previous track
  if (state.currentId && state.currentId !== id) {
    saveProgress(state.currentId, audio.currentTime);
  }

  state.currentId = id;
  audio.src = book.url;
  audio.playbackRate = state.speed;

  trackTitle.textContent = book.name;
  trackAuthor.textContent = formatFileSize(book.size) + (book.duration ? ' · ' + formatTime(book.duration) : '');

  // Restore saved position
  const savedPos = loadProgress(id);

  audio.addEventListener('loadedmetadata', () => {
    if (savedPos > 0 && savedPos < audio.duration - 2) {
      audio.currentTime = savedPos;
    }
    book.duration = audio.duration;
    saveLibraryMeta();
    renderLibrary();
  }, { once: true });

  playAudio();
  renderLibrary();
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function playAudio() {
  audio.play().then(() => {
    state.isPlaying = true;
    updatePlayUI();
  }).catch(() => {});
}

function pauseAudio() {
  audio.pause();
  state.isPlaying = false;
  updatePlayUI();
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

// ===== File Upload =====
function handleFiles(files) {
  const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || /\.(mp3|m4a|ogg|wav|aac|flac|opus)$/i.test(f.name));

  if (audioFiles.length === 0) {
    showToast('No audio files found');
    return;
  }

  audioFiles.forEach(file => {
    // Check if already in library by name+size
    const exists = state.library.find(b => b.name === file.name && b.size === file.size);
    if (exists) {
      // Update URL (blob URLs expire)
      if (exists.url) URL.revokeObjectURL(exists.url);
      exists.url = URL.createObjectURL(file);
      showToast(`Updated: ${file.name}`);
      if (state.currentId === exists.id) loadBook(exists.id);
      return;
    }

    const id = generateId();
    const url = URL.createObjectURL(file);
    const cleanName = file.name.replace(/\.(mp3|m4a|ogg|wav|aac|flac|opus)$/i, '');

    const book = { id, name: cleanName, size: file.size, url, duration: 0, progress: 0 };
    state.library.push(book);

    // Get duration via temporary audio element
    const tmp = new Audio(url);
    tmp.addEventListener('loadedmetadata', () => {
      book.duration = tmp.duration;
      saveLibraryMeta();
      renderLibrary();
      tmp.src = '';
    }, { once: true });
  });

  saveLibraryMeta();
  renderLibrary();
  showToast(`Added ${audioFiles.length} file${audioFiles.length > 1 ? 's' : ''}`);

  // Auto-play first if nothing loaded
  if (!state.currentId && state.library.length > 0) {
    setTimeout(() => loadBook(state.library[0].id), 300);
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

// Play / Pause
playBtn.addEventListener('click', () => {
  if (!audio.src) { showToast('Upload a file first'); return; }
  state.isPlaying ? pauseAudio() : playAudio();
});

// Rewind / Forward
rewindBtn.addEventListener('click', () => { audio.currentTime = Math.max(0, audio.currentTime - 15); updateProgress(); });
forwardBtn.addEventListener('click', () => { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 15); updateProgress(); });

// Progress bar — mouse
progressBar.addEventListener('click', seekFromEvent);

let dragging = false;
progressBar.addEventListener('mousedown', () => { dragging = true; });
document.addEventListener('mousemove', e => { if (dragging) seekFromEvent(e); });
document.addEventListener('mouseup', () => { dragging = false; });

// Progress bar — touch
progressBar.addEventListener('touchstart', e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });
progressBar.addEventListener('touchmove', e => { e.preventDefault(); seekFromEvent(e); }, { passive: false });

// Audio events
audio.addEventListener('timeupdate', () => {
  updateProgress();
  // Auto-save progress every ~5 seconds
  if (state.currentId && Math.floor(audio.currentTime) % 5 === 0) {
    saveProgress(state.currentId, audio.currentTime);
  }
});

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
  state.isPlaying = false;
  updatePlayUI();
  if (state.currentId) saveProgress(state.currentId, 0); // Reset on finish
  renderLibrary();
});

audio.addEventListener('play', () => { state.isPlaying = true; updatePlayUI(); });
audio.addEventListener('pause', () => { state.isPlaying = false; updatePlayUI(); });

// Speed buttons
document.querySelectorAll('.speed-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.speed = parseFloat(btn.dataset.speed);
    audio.playbackRate = state.speed;
  });
});

// Volume
volumeSlider.addEventListener('input', () => {
  audio.volume = parseFloat(volumeSlider.value);
});

// File upload
uploadBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => { handleFiles(e.target.files); fileInput.value = ''; });

// Drag & drop on the whole app
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

// Library item click (delegated)
libraryList.addEventListener('click', e => {
  const deleteBtn = e.target.closest('[data-delete]');
  if (deleteBtn) {
    const id = deleteBtn.dataset.delete;
    removeBook(id);
    return;
  }
  const item = e.target.closest('.library-item[data-id]');
  if (item) {
    loadBook(item.dataset.id);
    closeLibraryPanel();
  }
});

function removeBook(id) {
  const idx = state.library.findIndex(b => b.id === id);
  if (idx === -1) return;
  const book = state.library[idx];
  if (book.url) URL.revokeObjectURL(book.url);
  state.library.splice(idx, 1);
  saveLibraryMeta();

  if (state.currentId === id) {
    audio.pause();
    audio.src = '';
    state.currentId = null;
    state.isPlaying = false;
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

// ===== Keyboard shortcuts =====
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.code === 'Space') { e.preventDefault(); playBtn.click(); }
  if (e.code === 'ArrowLeft') rewindBtn.click();
  if (e.code === 'ArrowRight') forwardBtn.click();
});

// ===== Init =====
function init() {
  // Load saved metadata (without blob URLs — user must re-upload files)
  const meta = loadLibraryMeta();
  state.library = meta.map(m => ({ ...m, url: null }));
  renderLibrary();
}

init();
