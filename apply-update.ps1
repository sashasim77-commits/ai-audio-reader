# Auto-generated from current workspace state
$ErrorActionPreference = 'Stop'
@'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#050510" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="AudioReader" />
  <title>AI Audio Reader</title>
  <link rel="manifest" href="manifest.json" />
  <link rel="apple-touch-icon" href="icons/icon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <!-- SW update banner (floats over everything) -->
  <div class="update-banner" id="updateBanner" hidden>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14" style="flex-shrink:0;color:var(--neon-a)">
      <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/>
    </svg>
    <span id="updateBannerText">New version available</span>
    <button class="update-now-btn" id="updateBtn">РћР±РЅРѕРІРёС‚СЊ</button>
    <button class="update-close-btn" id="updateDismiss" aria-label="Р—Р°РєСЂС‹С‚СЊ">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="12" height="12">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>

  <div class="app">
    <!-- Blurred cover background -->
    <div class="cover-bg" id="coverBg"></div>
    <!-- Scanlines overlay -->
    <div class="scanlines" aria-hidden="true"></div>

    <!-- ===== Header ===== -->
    <header class="header">
      <button class="icon-btn" id="menuBtn" aria-label="Library">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <span class="header-title">AI&nbsp;AUDIO&nbsp;READER</span>

      <button class="icon-btn help-btn" id="helpBtn" aria-label="РЈСЃС‚Р°РЅРѕРІРёС‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµ" title="РљР°Рє СѓСЃС‚Р°РЅРѕРІРёС‚СЊ?">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </button>

      <!-- Hidden file inputs -->
      <input type="file" id="fileInput"   accept="audio/*" multiple hidden />
      <input type="file" id="folderInput" webkitdirectory multiple hidden />
    </header>

    <!-- ===== Main Player (single screen, no scroll) ===== -->
    <main class="player-view">

      <!-- Continue Banner (floating, not in flow) -->
      <div class="continue-banner" id="continueBanner" hidden>
        <div class="continue-info">
          <div class="continue-book" id="continueBookName">Track</div>
          <div class="continue-pos"  id="continuePos">from 0:00</div>
        </div>
        <button class="continue-btn" id="continueBtn">
          <svg viewBox="0 0 24 24" fill="currentColor" width="11" height="11"><polygon points="5,3 19,12 5,21"/></svg>
          RESUME
        </button>
        <button class="icon-btn continue-close" id="continueDismiss" aria-label="Dismiss">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Cover Section (flexible, fills remaining height) -->
      <div class="cover-section">
        <div class="cover-container">
          <div class="cover-art" id="coverArt">
            <!-- Visualizer behind cover image -->
            <canvas id="vizCanvas" class="viz-canvas"></canvas>
            <!-- Vinyl placeholder -->
            <svg class="cover-placeholder" id="coverPlaceholder" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke="#00f5d4" stroke-width="1" opacity="0.15"/>
              <circle cx="100" cy="100" r="70" stroke="#00f5d4" stroke-width="1" opacity="0.1"/>
              <circle cx="100" cy="100" r="50" stroke="#7b2fff" stroke-width="1.5" opacity="0.3"/>
              <circle cx="100" cy="100" r="30" stroke="#ff2d78" stroke-width="2" opacity="0.4"/>
              <circle cx="100" cy="100" r="12" fill="#7b2fff" opacity="0.6"/>
              <circle cx="100" cy="100" r="5"  fill="#00f5d4"/>
              <line x1="100" y1="10" x2="100" y2="20" stroke="#00f5d4" stroke-width="1" opacity="0.4"/>
              <line x1="190" y1="100" x2="180" y2="100" stroke="#00f5d4" stroke-width="1" opacity="0.4"/>
              <line x1="100" y1="190" x2="100" y2="180" stroke="#00f5d4" stroke-width="1" opacity="0.4"/>
              <line x1="10" y1="100" x2="20" y2="100" stroke="#00f5d4" stroke-width="1" opacity="0.4"/>
            </svg>
            <!-- Cover image on top -->
            <img id="coverArtImg" class="cover-art-img" src="" alt="Cover art" />
          </div>
          <div class="now-playing-badge" id="nowPlayingBadge">в—Џ PLAYING</div>
        </div>
      </div>

      <!-- Track Info (compact, single lines) -->
      <div class="track-info">
        <h2 class="track-title" id="trackTitle">SELECT A TRACK</h2>
        <p class="track-author" id="trackAuthor">Open library or add files via settings</p>
      </div>

      <!-- Progress Bar (car-friendly range input) -->
      <div class="progress-container">
        <input type="range" id="progressBar" min="0" max="100" step="0.1" value="0"
               class="progress-range" aria-label="Playback progress" />
        <div class="time-labels">
          <span id="currentTime">0:00</span>
          <span id="duration">0:00</span>
        </div>
      </div>

      <!-- Playback Controls -->
      <div class="controls">
        <button class="icon-btn skip-btn" id="rewindBtn" aria-label="Rewind 15s">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.99 5V1l-5 5 5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6h-2c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          <span class="skip-label">15</span>
        </button>

        <button class="play-btn" id="playBtn" aria-label="Play/Pause">
          <svg class="play-icon"  viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          <svg class="pause-icon hidden" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
          </svg>
        </button>

        <button class="icon-btn skip-btn" id="forwardBtn" aria-label="Forward 15s">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 13c0 3.31-2.69 6-6 6s-6-2.69-6-6 2.69-6 6-6v4l5-5-5-5v4c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8h-2z"/>
          </svg>
          <span class="skip-label">15</span>
        </button>
      </div>

      <!-- Bottom Toolbar (glassmorphism) -->
      <div class="bottom-toolbar">
        <button class="toolbar-btn" id="chaptersBtn" aria-label="Chapters">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <line x1="8" y1="6" x2="21" y2="6"/>
            <line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/>
            <line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
          <span>Chapters</span>
        </button>

        <button class="toolbar-btn toolbar-btn-accent" id="bookmarksSheetBtn" aria-label="Bookmarks">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
            <line x1="4" y1="22" x2="4" y2="15"/>
          </svg>
          <span>Marks</span>
        </button>

        <button class="toolbar-btn speed-display" id="speedDisplay" aria-label="Playback speed">
          <span class="speed-val">1Г—</span>
          <span class="speed-txt">Speed</span>
        </button>

        <button class="toolbar-btn" id="settingsBtn" aria-label="Settings">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>Settings</span>
        </button>
      </div>

    </main>

    <!-- ===== CHAPTERS SHEET ===== -->
    <div class="sheet-overlay" id="chaptersOverlay">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <span class="sheet-title">CHAPTERS</span>
          <div class="sheet-header-right">
            <span class="playlist-count" id="playlistCount"></span>
            <button class="icon-btn sheet-close" id="chaptersClose" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="sheet-body">
          <div class="playlist-items" id="playlistItems"></div>
        </div>
      </div>
    </div>

    <!-- ===== BOOKMARKS SHEET ===== -->
    <div class="sheet-overlay" id="bookmarksOverlay">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <span class="sheet-title">BOOKMARKS</span>
          <div class="sheet-header-right">
            <button class="icon-btn add-bookmark-btn" id="addBookmarkBtn"
                    title="Add bookmark" aria-label="Add bookmark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
            </button>
            <button class="icon-btn sheet-close" id="bookmarksClose" aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="sheet-body">
          <button class="return-btn" id="returnBtn" hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
              <polyline points="9 14 4 9 9 4"/>
              <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
            </svg>
            Return to listening point
          </button>
          <div class="bookmarks-list" id="bookmarksList"></div>
        </div>
      </div>
    </div>

    <!-- ===== SETTINGS SHEET ===== -->
    <div class="sheet-overlay" id="settingsOverlay">
      <div class="sheet">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <span class="sheet-title">SETTINGS</span>
          <button class="icon-btn sheet-close" id="settingsClose" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="sheet-body">

          <!-- Theme -->
          <div class="settings-group">
            <div class="settings-label">РўР•РњРђ РћР¤РћР РњР›Р•РќРРЇ</div>
            <button class="theme-switcher" id="themeToggleBtn" aria-label="РџРµСЂРµРєР»СЋС‡РёС‚СЊ С‚РµРјСѓ">
              <div class="theme-switcher-track">
                <div class="theme-switcher-option theme-dark-opt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                  <span>РўС‘РјРЅР°СЏ</span>
                </div>
                <div class="theme-switcher-option theme-light-opt">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                  </svg>
                  <span>РЎРІРµС‚Р»Р°СЏ</span>
                </div>
              </div>
            </button>
          </div>

          <!-- Volume -->
          <div class="settings-group">
            <div class="settings-label">VOLUME</div>
            <div class="settings-row">
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="flex-shrink:0;color:var(--text2)">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
              </svg>
              <input type="range" id="volumeSlider" min="0" max="1" step="0.02" value="1" class="volume-slider" />
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" style="flex-shrink:0;color:var(--text2)">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
              </svg>
            </div>
          </div>

          <!-- Sleep Timer -->
          <div class="settings-group" id="sleepSection">
            <div class="settings-label-row">
              <div class="settings-label">SLEEP TIMER</div>
              <div class="sleep-countdown" id="sleepCountdown" hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span id="sleepTime">0:00</span>
              </div>
            </div>
            <div class="sleep-buttons">
              <button class="sleep-btn" data-minutes="15">15 min</button>
              <button class="sleep-btn" data-minutes="30">30 min</button>
              <button class="sleep-btn" data-minutes="60">60 min</button>
              <button class="sleep-btn sleep-cancel" id="sleepCancel" hidden>вњ• Cancel</button>
            </div>
          </div>

          <!-- Add files -->
          <div class="settings-group">
            <div class="settings-label">ADD CONTENT</div>
            <div class="settings-actions">
              <button class="settings-action-btn" id="folderBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
                Add Folder
              </button>
              <button class="settings-action-btn" id="uploadBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Add Files
              </button>
            </div>
          </div>

          <div class="settings-group">
            <div class="settings-label-row">
              <div class="settings-label">APP VERSION</div>
              <div class="settings-version" id="appVersionValue">v-</div>
            </div>
            <div class="settings-actions">
              <button class="settings-action-btn" id="checkUpdatesBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10"/>
                  <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14"/>
                </svg>
                Check for Updates
              </button>
            </div>
          </div>

          <!-- Danger zone -->
          <div class="settings-group settings-danger">
            <div class="settings-label">MANAGE DATA</div>
            <div class="settings-actions">
              <button class="settings-action-btn danger-action" id="clearLibraryBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                </svg>
                Clear Library
              </button>
              <button class="settings-action-btn danger-action danger-strong" id="resetAllBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                Reset All Data
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Library Sidebar -->
    <aside class="library-panel" id="libraryPanel">
      <div class="library-header">
        <h3>LIBRARY</h3>
        <button class="icon-btn" id="closeLibrary" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="library-list" id="libraryList"></div>
    </aside>

    <div class="overlay" id="overlay"></div>

    <!-- ===== PWA GUIDE SHEET ===== -->
    <div class="sheet-overlay" id="guideOverlay">
      <div class="sheet sheet-guide">
        <div class="sheet-handle"></div>
        <div class="sheet-header">
          <span class="sheet-title">РЈРЎРўРђРќРћР’РљРђ</span>
          <button class="icon-btn sheet-close" id="guideClose" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="sheet-body" id="guideContent">
          <!-- filled by JS -->
        </div>
      </div>
    </div>
  </div>

  <audio id="audioPlayer" preload="metadata" playsinline></audio>
  <script src="version.js"></script>
  <script src="script.js"></script>
</body>
</html>

'@ | Set-Content -LiteralPath 'index.html' -Encoding UTF8

@'
/* =====================================================
   AI AUDIO READER вЂ” Pro Mobile / Glassmorphism
   ===================================================== */

/* ===== Variables ===== */
:root {
  --bg:        #050510;
  --bg2:       #080820;
  --surface:   rgba(12,12,40,0.82);
  --surface2:  rgba(20,20,60,0.5);
  --glass:     rgba(8,8,32,0.7);
  --glass-border: rgba(0,245,212,0.18);

  --neon-a:    #00f5d4;
  --neon-b:    #ff2d78;
  --neon-c:    #7b2fff;
  --neon-d:    #b4ff39;

  --text:      #ddeeff;
  --text2:     #7aa8c8;
  --text3:     #3a5570;

  --glow-a:    0 0 6px var(--neon-a), 0 0 20px rgba(0,245,212,0.2);
  --glow-b:    0 0 6px var(--neon-b), 0 0 20px rgba(255,45,120,0.2);
  --glow-c:    0 0 6px var(--neon-c), 0 0 20px rgba(123,47,255,0.2);

  --border-a:  1px solid rgba(0,245,212,0.2);
  --border-b:  1px solid rgba(255,45,120,0.2);

  --radius:    16px;
  --radius-sm: 8px;
  --t:         0.2s cubic-bezier(0.4,0,0.2,1);

  --safe-top:    env(safe-area-inset-top,    0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* Fix: author styles (display:flex etc.) can override the hidden attribute */
[hidden] { display: none !important; }

html, body {
  height: 100%;
  overflow: hidden;
  background: var(--bg);
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ===== SW Update Banner ===== */
.update-banner {
  position: fixed;
  top: calc(var(--safe-top) + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9000;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(8,8,32,0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0,245,212,0.3);
  border-radius: 12px;
  padding: 10px 14px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  color: var(--neon-a);
  box-shadow: var(--glow-a), 0 8px 32px rgba(0,0,0,0.5);
  white-space: nowrap;
  max-width: calc(100vw - 24px);
}

.update-now-btn {
  background: var(--neon-a);
  color: #050510;
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-family: 'Orbitron', monospace;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.5px;
}

.update-now-btn:hover { opacity: 0.88; }
.update-now-btn:active { transform: scale(0.95); }

.update-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  color: var(--text2);
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.15s;
  padding: 0;
}
.update-close-btn:hover  { background: rgba(255,45,120,0.15); border-color: rgba(255,45,120,0.35); color: var(--neon-b); }
.update-close-btn:active { transform: scale(0.9); }

/* ===== Cover Background (blurred) ===== */
.cover-bg {
  position: absolute;
  inset: -15%;
  z-index: 0;
  background-size: cover;
  background-position: center;
  filter: blur(40px) brightness(0.28) saturate(0.6);
  opacity: 0;
  transition: opacity 1s ease;
  pointer-events: none;
}
.cover-bg.visible { opacity: 1; }

/* ===== Scanlines ===== */
.scanlines {
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 3px,
    rgba(0,0,0,0.035) 3px, rgba(0,0,0,0.035) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

/* ===== App Shell ===== */
.app {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 480px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse 80% 50% at 50% 0%,   rgba(123,47,255,0.1) 0%, transparent 70%),
    radial-gradient(ellipse 60% 40% at 100% 100%, rgba(0,245,212,0.06) 0%, transparent 60%),
    var(--bg);
}

.header, .player-view, .library-panel, .overlay, .scanlines {
  position: relative;
  z-index: 1;
}

/* ===== Header ===== */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--safe-top) + 8px) 16px 8px;
  background: rgba(5,5,20,0.6);
  border-bottom: 1px solid rgba(0,245,212,0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 10;
  flex-shrink: 0;
  gap: 8px;
}

.header-title {
  flex: 1;
  text-align: center;
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 2px;
  color: var(--neon-a);
  text-shadow: var(--glow-a);
}

/* ===== Icon Buttons ===== */
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text2);
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: color var(--t), background var(--t);
  -webkit-tap-highlight-color: transparent;
}

.icon-btn svg { width: 20px; height: 20px; pointer-events: none; }
.icon-btn:hover  { color: var(--neon-a); background: rgba(0,245,212,0.06); }
.icon-btn:active { transform: scale(0.92); }
.icon-btn:focus { outline: none; }
.icon-btn:focus-visible {
  color: var(--neon-a);
  background: rgba(0,245,212,0.06);
  box-shadow: 0 0 0 2px rgba(0,245,212,0.18);
}

/* ===== Player View (NO SCROLL) ===== */
.player-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 10px 18px;
  padding-bottom: calc(var(--safe-bottom) + 10px);
  overflow: hidden;
  gap: 8px;
}

/* ===== Continue Banner (floating) ===== */
.continue-banner {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,245,212,0.06);
  border: var(--border-a);
  border-left: 3px solid var(--neon-a);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  backdrop-filter: blur(10px);
}

.continue-info { flex: 1; min-width: 0; }
.continue-book {
  font-family: 'Orbitron', monospace;
  font-size: 10px;
  font-weight: 700;
  color: var(--neon-a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.continue-pos {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: var(--text2);
  margin-top: 1px;
}

.continue-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: transparent;
  border: 1px solid var(--neon-a);
  color: var(--neon-a);
  border-radius: 4px;
  padding: 5px 10px;
  font-family: 'Orbitron', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.continue-btn:hover { background: rgba(0,245,212,0.1); }
.continue-close { flex-shrink: 0; width: 32px; height: 32px; }

/* ===== Cover Section (flexible height) ===== */
.cover-section {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.cover-container {
  position: relative;
  height: 100%;
  max-height: 100%;
  aspect-ratio: 1;
  max-width: 100%;
}

.cover-art {
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: var(--bg2);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(0,245,212,0.2);
  box-shadow: 0 0 8px rgba(0,245,212,0.1), 0 16px 48px rgba(0,0,0,0.5);
  transition: box-shadow 0.5s ease, border-color 0.5s ease;
}

.cover-art.playing {
  animation: cover-pulse 3s ease-in-out infinite;
  border-color: rgba(0,245,212,0.4);
}

@keyframes cover-pulse {
  0%,100% { box-shadow: 0 0 8px rgba(0,245,212,0.1), 0 16px 48px rgba(0,0,0,0.5); }
  50%      { box-shadow: 0 0 20px rgba(0,245,212,0.25), 0 20px 60px rgba(0,0,0,0.6), 0 0 60px rgba(123,47,255,0.15); }
}

/* Cover image */
.cover-art-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.6s ease;
  z-index: 2;
}
.cover-art-img.visible { opacity: 1; }
.cover-art-img.visible ~ .cover-placeholder { opacity: 0 !important; }

/* Vinyl placeholder */
.cover-placeholder {
  width: 65%;
  height: 65%;
  transition: opacity 0.5s ease;
  z-index: 1;
  position: relative;
}
.cover-art.playing .cover-placeholder { opacity: 0.06; }

/* Visualizer canvas вЂ” subtle background element, fills cover */
.viz-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
  z-index: 1; /* behind cover image, above placeholder */
}
.cover-art.playing .viz-canvas { opacity: 0.4; }

/* Now playing badge */
.now-playing-badge {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(5,5,20,0.9);
  border: 1px solid var(--neon-a);
  color: var(--neon-a);
  font-family: 'Orbitron', monospace;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 2px 10px;
  border-radius: 3px;
  white-space: nowrap;
  box-shadow: var(--glow-a);
  opacity: 0;
  transition: opacity 0.3s;
  backdrop-filter: blur(8px);
}
.cover-art.playing ~ .now-playing-badge { opacity: 1; }

/* ===== Track Info (compact) ===== */
.track-info {
  flex-shrink: 0;
  text-align: center;
  padding-top: 4px;
}

.track-title {
  font-family: 'Orbitron', 'Courier New', monospace;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
  text-shadow: 0 0 20px rgba(200,222,255,0.3);
}

.track-author {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: 0;
}

/* ===== Progress Range (car-friendly вЂ” 8px tall) ===== */
.progress-container { flex-shrink: 0; width: 100%; }

.progress-range {
  --p: 0%;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--neon-a) var(--p), rgba(20,20,60,0.6) var(--p));
  cursor: pointer;
  outline: none;
  border: none;
  margin-bottom: 6px;
  box-shadow: 0 0 8px rgba(0,245,212,0.15);
  transition: height var(--t);
}
.progress-range:hover, .progress-range:active { height: 10px; }

.progress-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--neon-a);
  cursor: pointer;
  box-shadow: var(--glow-a);
  border: 2px solid rgba(0,0,0,0.25);
}
.progress-range::-moz-range-thumb {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: var(--neon-a);
  border: 2px solid rgba(0,0,0,0.25);
  cursor: pointer;
  box-shadow: var(--glow-a);
}
.progress-range::-moz-range-progress { background: var(--neon-a); border-radius: 4px; height: 8px; }

.time-labels {
  display: flex;
  justify-content: space-between;
  font-family: 'Share Tech Mono', monospace;
  font-size: 13px;
  color: var(--text2);
}

/* ===== Controls ===== */
.controls {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.play-btn {
  width: 66px;
  height: 66px;
  border-radius: 50%;
  border: 2px solid var(--neon-a);
  background: rgba(0,245,212,0.06);
  color: var(--neon-a);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--glow-a);
  transition: all var(--t);
  -webkit-tap-highlight-color: transparent;
}
.play-btn svg { width: 24px; height: 24px; }
.play-btn .play-icon { margin-left: 3px; }
.play-btn:hover { background: rgba(0,245,212,0.12); box-shadow: 0 0 24px var(--neon-a), 0 0 60px rgba(0,245,212,0.25); }
.play-btn:active { transform: scale(0.93); }
.play-btn:focus { outline: none; }
.play-btn:focus-visible { box-shadow: 0 0 0 2px rgba(0,245,212,0.18), var(--glow-a); }

.skip-btn {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 1px solid rgba(0,245,212,0.18);
  background: rgba(8,8,32,0.5);
  color: var(--text2);
  backdrop-filter: blur(8px);
}
.skip-btn svg { width: 22px; height: 22px; pointer-events: none; }
.skip-btn:hover { color: var(--neon-a); border-color: var(--neon-a); box-shadow: var(--glow-a); background: rgba(0,245,212,0.06); }
.skip-btn:active { transform: scale(0.92); }
.skip-btn:focus { outline: none; }
.skip-btn:focus-visible {
  color: var(--neon-a);
  border-color: var(--neon-a);
  box-shadow: var(--glow-a);
  background: rgba(0,245,212,0.06);
}

.skip-label {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'Share Tech Mono', monospace;
  font-size: 8px;
  color: inherit;
  line-height: 1;
  pointer-events: none;
}

.hidden { display: none !important; }

/* ===== Bottom Toolbar (glassmorphism) ===== */
.bottom-toolbar {
  flex-shrink: 0;
  display: flex;
  align-items: stretch;
  gap: 6px;
  background: rgba(5,5,25,0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0,245,212,0.12);
  border-radius: 14px;
  padding: 6px;
}

.toolbar-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  color: var(--text2);
  cursor: pointer;
  padding: 7px 4px;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0;
  transition: all var(--t);
  -webkit-tap-highlight-color: transparent;
}

.toolbar-btn:hover {
  color: var(--neon-a);
  background: rgba(0,245,212,0.07);
  border-color: rgba(0,245,212,0.2);
}
.toolbar-btn:active { transform: scale(0.94); }
.toolbar-btn:focus { outline: none; }
.toolbar-btn:focus-visible {
  color: var(--neon-a);
  background: rgba(0,245,212,0.07);
  border-color: rgba(0,245,212,0.2);
}

.toolbar-btn-accent { color: rgba(255,45,120,0.7); }
.toolbar-btn-accent:hover { color: var(--neon-b); background: rgba(255,45,120,0.07); border-color: rgba(255,45,120,0.2); }

.speed-display { cursor: pointer; }
.speed-val {
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--neon-a);
  line-height: 1;
}
.speed-txt { color: var(--text2); font-size: 12px; font-family: 'Inter', sans-serif; font-weight: 600; }

/* ===== Sheets (slide-up panels) ===== */
.sheet-overlay {
  position: absolute;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: flex-end;
  background: rgba(0,0,10,0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.28s ease;
}

.sheet-overlay.open {
  opacity: 1;
  pointer-events: all;
}

.sheet {
  width: 100%;
  max-height: 78vh;
  background: rgba(5,5,28,0.92);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(0,245,212,0.15);
  border-bottom: none;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94);
  padding-bottom: calc(var(--safe-bottom) + 8px);
}

.sheet-overlay.open .sheet { transform: translateY(0); }

.sheet-handle {
  width: 36px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  margin: 10px auto 0;
  flex-shrink: 0;
}

.sheet-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 10px;
  border-bottom: 1px solid rgba(0,245,212,0.1);
  flex-shrink: 0;
}

.sheet-title {
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 2px;
  color: var(--neon-a);
  text-shadow: var(--glow-a);
}

.sheet-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sheet-close { width: 34px; height: 34px; }

.sheet-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.sheet-body::-webkit-scrollbar { width: 2px; }
.sheet-body::-webkit-scrollbar-thumb { background: rgba(0,245,212,0.2); }

/* ===== Chapters / Playlist inside sheet ===== */
.playlist-count {
  font-family: 'Share Tech Mono', monospace;
  font-size: 11px;
  color: var(--text2);
}

.playlist-items {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0 4px;
}

.playlist-group-header {
  font-family: 'Orbitron', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
  color: var(--neon-c);
  padding: 10px 10px 4px;
  text-transform: uppercase;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t);
  -webkit-tap-highlight-color: transparent;
}
.playlist-item:hover  { background: rgba(0,245,212,0.05); }
.playlist-item.active { background: rgba(0,245,212,0.09); border-left: 2px solid var(--neon-a); padding-left: 8px; }
.playlist-item.no-file { opacity: 0.3; cursor: not-allowed; }

.playlist-num { width: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.track-num { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--text2); }
.playlist-info { flex: 1; min-width: 0; }
.playlist-name { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.playlist-bar { height: 2px; background: rgba(255,255,255,0.05); border-radius: 1px; margin-top: 3px; overflow: hidden; }
.playlist-bar-fill { height: 100%; background: linear-gradient(90deg, var(--neon-a), var(--neon-b)); border-radius: inherit; }
.playlist-duration { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: var(--text2); flex-shrink: 0; }

.playing-bars { display: flex; align-items: flex-end; gap: 2px; height: 12px; }
.playing-bars span { display: block; width: 3px; border-radius: 1px; background: var(--neon-a); box-shadow: 0 0 4px var(--neon-a); animation: bar-anim 0.6s ease-in-out infinite alternate; }
.playing-bars span:nth-child(1) { height: 30%; animation-delay: 0s; }
.playing-bars span:nth-child(2) { height: 100%; animation-delay: 0.12s; }
.playing-bars span:nth-child(3) { height: 55%; animation-delay: 0.25s; }
@keyframes bar-anim { from { transform: scaleY(0.3); } to { transform: scaleY(1); } }

/* ===== Bookmarks inside sheet ===== */
.add-bookmark-btn { color: var(--neon-b) !important; }
.add-bookmark-btn:hover { background: rgba(255,45,120,0.08) !important; }

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 4px 12px;
}

.bookmarks-empty {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text2);
  text-align: center;
  padding: 24px 16px;
  opacity: 0.8;
}

.bookmark-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.bookmark-jump {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,45,120,0.04);
  border: 1px solid rgba(255,45,120,0.12);
  border-radius: var(--radius-sm);
  padding: 8px 10px;
  cursor: pointer;
  transition: background var(--t), border-color var(--t);
  -webkit-tap-highlight-color: transparent;
  text-align: left;
}
.bookmark-jump:hover { background: rgba(255,45,120,0.09); border-color: rgba(255,45,120,0.3); }

.bookmark-time-label {
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  color: var(--neon-b);
  flex-shrink: 0;
}

.bookmark-chapter {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 400;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-delete-btn {
  background: none;
  border: none;
  color: var(--text2);
  cursor: pointer;
  font-size: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: color var(--t), background var(--t);
  flex-shrink: 0;
}
.bookmark-delete-btn:hover { color: var(--neon-b); background: rgba(255,45,120,0.08); }

.return-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: transparent;
  border: 1px solid rgba(0,245,212,0.22);
  color: var(--neon-a);
  border-radius: var(--radius-sm);
  padding: 9px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  width: calc(100% - 24px);
  margin: 4px 12px 8px;
  transition: all var(--t);
  -webkit-tap-highlight-color: transparent;
}
.return-btn:hover { background: rgba(0,245,212,0.07); border-color: var(--neon-a); }
.return-btn:active { transform: scale(0.97); }

/* ===== Settings Sheet ===== */
.settings-group {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,245,212,0.07);
}
.settings-group:last-child { border-bottom: none; }

.settings-label {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text2);
  margin-bottom: 10px;
}

.settings-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.settings-version {
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  color: var(--neon-a);
  text-shadow: var(--glow-a);
}

.settings-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.settings-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.settings-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-width: 120px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(0,245,212,0.14);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--t);
  -webkit-tap-highlight-color: transparent;
}
.settings-action-btn:hover { border-color: var(--neon-a); color: var(--neon-a); background: rgba(0,245,212,0.06); }
.settings-action-btn:active { transform: scale(0.97); }

.danger-action { border-color: rgba(255,45,120,0.15); color: var(--text2); }
.danger-action:hover { border-color: var(--neon-b) !important; color: var(--neon-b) !important; background: rgba(255,45,120,0.07) !important; }
.danger-strong { border-color: rgba(255,45,120,0.25); color: rgba(255,45,120,0.7); }

/* Theme Switcher (segmented control) */
.theme-switcher {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(0,245,212,0.14);
  border-radius: 10px;
  padding: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color var(--t);
}
.theme-switcher:hover { border-color: rgba(0,245,212,0.28); }

.theme-switcher-track {
  display: flex;
  gap: 3px;
}

.theme-switcher-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 8px;
  border-radius: 7px;
  border: 1px solid transparent;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  transition: all 0.22s;
  pointer-events: none;
}

/* Active segment вЂ” driven by data-theme on <html>, no JS needed */
[data-theme="dark"]  .theme-dark-opt {
  background: rgba(0,245,212,0.1);
  border-color: rgba(0,245,212,0.3);
  color: var(--neon-a);
  text-shadow: 0 0 8px rgba(0,245,212,0.4);
}
[data-theme="light"] .theme-light-opt {
  background: rgba(124,58,237,0.09);
  border-color: rgba(124,58,237,0.3);
  color: #7c3aed;
}

/* Light theme overrides for the switcher */
html[data-theme="light"] .theme-switcher {
  background: rgba(0,0,0,0.03);
  border-color: rgba(124,58,237,0.14);
}
html[data-theme="light"] .theme-switcher:hover { border-color: rgba(124,58,237,0.3); }
html[data-theme="light"] .theme-switcher-option { color: #374151; }

/* Volume in settings */
.volume-slider {
  flex: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: rgba(20,20,60,0.6);
  border-radius: 3px;
  outline: none;
  cursor: pointer;
  border: 1px solid rgba(0,245,212,0.1);
}
.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--neon-a);
  cursor: pointer;
  box-shadow: var(--glow-a);
}
.volume-slider::-moz-range-thumb {
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--neon-a);
  border: none;
  cursor: pointer;
}

/* Sleep timer in settings */
.sleep-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  align-items: center;
}

.sleep-btn {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(0,245,212,0.14);
  color: var(--text2);
  border-radius: var(--radius-sm);
  padding: 8px 16px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--t);
  -webkit-tap-highlight-color: transparent;
}
.sleep-btn:hover { border-color: var(--neon-a); color: var(--neon-a); background: rgba(0,245,212,0.05); }
.sleep-btn.active { background: rgba(0,245,212,0.09); border-color: var(--neon-a); color: var(--neon-a); box-shadow: var(--glow-a); }
.sleep-btn:active { transform: scale(0.95); }

.sleep-cancel { margin-left: auto; border-color: rgba(255,45,120,0.2); color: var(--neon-b); }
.sleep-cancel:hover { border-color: var(--neon-b) !important; color: var(--neon-b) !important; background: rgba(255,45,120,0.06) !important; }

.sleep-countdown {
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: var(--neon-a);
  text-shadow: var(--glow-a);
  animation: sleep-tick 1s ease-in-out infinite;
}
.sleep-countdown svg { flex-shrink: 0; opacity: 0.7; }

@keyframes sleep-tick { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }

#sleepTime.warning { color: var(--neon-b); text-shadow: var(--glow-b); }

/* ===== Library Sidebar ===== */
.library-panel {
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: min(340px, 88vw);
  background: rgba(4,4,20,0.96);
  border-right: 1px solid rgba(0,245,212,0.15);
  box-shadow: 4px 0 40px rgba(0,245,212,0.05);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding-top: var(--safe-top);
}
.library-panel.open { transform: translateX(0); }

.library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid rgba(0,245,212,0.1);
  flex-shrink: 0;
}
.library-header h3 {
  font-family: 'Orbitron', monospace;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 3px;
  color: var(--neon-a);
  text-shadow: var(--glow-a);
}

/* Visible close button in library header */
#closeLibrary {
  width: 44px;
  height: 44px;
  color: var(--text);
  border: 1px solid rgba(0,245,212,0.2);
  border-radius: 10px;
  background: rgba(0,245,212,0.06);
}
#closeLibrary:hover  { color: var(--neon-b); border-color: rgba(255,45,120,0.4); background: rgba(255,45,120,0.08); }
#closeLibrary:active { transform: scale(0.9); }
#closeLibrary svg    { width: 18px; height: 18px; }

.library-list {
  flex: 1;
  overflow-y: auto;
  padding: 6px 0;
}
.library-list::-webkit-scrollbar { width: 2px; }
.library-list::-webkit-scrollbar-thumb { background: rgba(0,245,212,0.2); }

/* Empty state */
.empty-library {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  height: 220px;
  color: var(--text2);
  text-align: center;
  padding: 24px;
}
.empty-library svg { opacity: 0.3; color: var(--neon-a); }
.empty-library p { font-size: 13px; line-height: 1.7; }

/* Library Group */
.library-group { margin: 3px 8px; }

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background var(--t);
  border: 1px solid transparent;
}
.group-header:hover { background: rgba(0,245,212,0.04); border-color: rgba(0,245,212,0.1); }

.library-group.active > .group-header { background: rgba(0,245,212,0.07); border-color: rgba(0,245,212,0.14); }

.group-toggle { color: var(--text2); transition: transform var(--t); flex-shrink: 0; display: flex; }
.group-toggle svg { width: 14px; height: 14px; }
.library-group.expanded .group-toggle { transform: rotate(90deg); }

.group-cover {
  width: 42px; height: 42px;
  border-radius: 8px;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(123,47,255,0.3);
  color: var(--neon-c);
}
.group-cover svg { width: 20px; height: 20px; }

.group-info { flex: 1; min-width: 0; }
.group-name { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.group-meta { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text2); margin-bottom: 4px; }
.group-actions { display: flex; flex-shrink: 0; }

.group-tracks {
  padding: 2px 0 4px 18px;
  border-left: 1px solid rgba(0,245,212,0.08);
  margin-left: 18px;
  margin-bottom: 4px;
}

/* Library Item */
.library-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  cursor: pointer;
  transition: background var(--t);
  border-radius: var(--radius-sm);
  margin: 1px 8px;
  border: 1px solid transparent;
}
.library-item:hover { background: rgba(0,245,212,0.04); border-color: rgba(0,245,212,0.08); }
.library-item.active { background: rgba(0,245,212,0.07); border-color: rgba(0,245,212,0.14); border-left-color: var(--neon-a); border-left-width: 2px; padding-left: 9px; }
.library-item.no-file { opacity: 0.35; cursor: default; }

.library-item-cover {
  width: 42px; height: 42px;
  border-radius: 8px;
  background: var(--surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(0,245,212,0.14);
  color: var(--neon-a);
  overflow: hidden;
}
.library-item-cover svg { width: 20px; height: 20px; }

@keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.library-item-cover.spinning svg { animation: spin-slow 3s linear infinite; }

.library-item-info { flex: 1; min-width: 0; }
.library-item-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 3px; }
.library-item-meta { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: var(--text2); display: flex; align-items: center; gap: 4px; margin-bottom: 4px; }
.library-progress-bar { height: 2px; background: rgba(255,255,255,0.04); border-radius: 1px; overflow: hidden; }
.library-progress-fill { height: 100%; background: linear-gradient(90deg, var(--neon-a), var(--neon-b)); }
.library-item-actions { display: flex; align-items: center; gap: 2px; flex-shrink: 0; }

.lib-action-btn {
  background: none; border: none; color: var(--text2); cursor: pointer;
  font-size: 13px; width: 28px; height: 28px;
  border-radius: 4px; display: flex; align-items: center; justify-content: center;
  transition: all var(--t);
}
.lib-action-btn:hover { color: var(--neon-a); background: rgba(0,245,212,0.08); }

.library-item-delete {
  background: none; border: none; color: var(--text2); cursor: pointer;
  padding: 4px; border-radius: 4px; display: flex; align-items: center;
  transition: color var(--t);
}
.library-item-delete:hover { color: var(--neon-b); }
.library-item-delete svg { width: 14px; height: 14px; }

.badge-done   { color: var(--neon-d); font-size: 10px; font-weight: 700; }
.badge-upload { color: #f59e0b; font-size: 10px; font-weight: 700; }

/* ===== Overlay ===== */
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(3px);
  z-index: 99;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.overlay.visible { opacity: 1; pointer-events: all; cursor: pointer; }

/* ===== Toast ===== */
.toast {
  position: fixed;
  bottom: calc(var(--safe-bottom) + 80px);
  left: 50%;
  transform: translateX(-50%) translateY(16px);
  background: rgba(5,5,25,0.95);
  color: var(--neon-a);
  padding: 8px 16px;
  border: var(--border-a);
  border-radius: 4px;
  font-family: 'Share Tech Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.5px;
  box-shadow: var(--glow-a), 0 4px 20px rgba(0,0,0,0.5);
  z-index: 9000;
  opacity: 0;
  transition: all 0.25s ease;
  pointer-events: none;
  white-space: nowrap;
}
.toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }

/* ===== Help Button ===== */
.help-btn { color: var(--neon-c) !important; }
.help-btn:hover { color: var(--neon-a) !important; background: rgba(123,47,255,0.1) !important; }

/* ===== PWA Guide Sheet ===== */
.sheet-guide { max-height: 85vh; }

.guide-installed {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  text-align: center;
}
.guide-installed-icon {
  width: 64px; height: 64px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--neon-c), var(--neon-a));
  display: flex; align-items: center; justify-content: center;
  font-size: 30px;
  box-shadow: 0 0 24px rgba(0,245,212,0.35);
}
.guide-installed h3 {
  font-family: 'Orbitron', monospace;
  font-size: 14px;
  color: var(--neon-a);
  letter-spacing: 1px;
}
.guide-installed p {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
}

.guide-platform-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(0,245,212,0.12);
}
.guide-platform-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: 20px;
}
.guide-platform-icon.ios-icon    { background: linear-gradient(135deg,#1c1c3a,#2d2d5a); border: 1px solid rgba(0,245,212,0.2); }
.guide-platform-icon.android-icon { background: linear-gradient(135deg,#1c311c,#1e4d1e); border: 1px solid rgba(61,220,132,0.25); }
.guide-platform-title {
  font-family: 'Orbitron', monospace;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.5px;
}
.guide-platform-sub {
  font-size: 11px;
  color: var(--text2);
  margin-top: 2px;
}

.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.guide-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.guide-step-num {
  width: 26px; height: 26px;
  border-radius: 50%;
  background: rgba(123,47,255,0.2);
  border: 1.5px solid var(--neon-c);
  color: var(--neon-c);
  display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', monospace;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}
.guide-step-body {
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--text);
}
.guide-step-body strong {
  color: var(--neon-a);
  font-weight: 600;
}

/* Inline icon pill вЂ” shows the actual button to tap */
.guide-icon-pill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(0,245,212,0.1);
  border: 1px solid rgba(0,245,212,0.28);
  border-radius: 7px;
  padding: 2px 8px 2px 6px;
  vertical-align: middle;
  margin: 0 2px;
  color: var(--neon-a);
  font-size: 12px;
  font-family: 'Share Tech Mono', monospace;
  white-space: nowrap;
}
.guide-icon-pill.android {
  background: rgba(61,220,132,0.1);
  border-color: rgba(61,220,132,0.28);
  color: #3ddc84;
}
.guide-icon-pill svg { flex-shrink: 0; }

.guide-note {
  margin-top: 18px;
  padding: 10px 12px;
  background: rgba(123,47,255,0.08);
  border-left: 3px solid var(--neon-c);
  border-radius: 0 8px 8px 0;
  font-size: 12px;
  color: var(--text2);
  line-height: 1.5;
}
.guide-note strong { color: var(--neon-c); }

.guide-divider {
  margin: 22px 0 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text3);
  font-size: 11px;
  font-family: 'Share Tech Mono', monospace;
}
.guide-divider::before, .guide-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(0,245,212,0.1);
}

/* Light theme adjustments */
html[data-theme="light"] .guide-step-num {
  background: rgba(124,58,237,0.1);
}
html[data-theme="light"] .guide-icon-pill {
  background: rgba(124,58,237,0.08);
  border-color: rgba(124,58,237,0.25);
  color: #7c3aed;
}
html[data-theme="light"] .guide-icon-pill.android {
  background: rgba(22,163,74,0.08);
  border-color: rgba(22,163,74,0.25);
  color: #16a34a;
}
html[data-theme="light"] .guide-note {
  background: rgba(124,58,237,0.06);
}
html[data-theme="light"] .guide-step-body { color: #1e293b; }
html[data-theme="light"] .guide-installed p { color: #64748b; }

/* ==========================================================
   LIGHT THEME
   ========================================================== */
html[data-theme="light"] {
  --bg:        #f2f2f7;
  --bg2:       #ffffff;
  --surface:   rgba(255,255,255,0.95);
  --surface2:  rgba(235,235,245,0.7);
  --glass:     rgba(255,255,255,0.75);
  --glass-border: rgba(124,58,237,0.18);

  --neon-a:    #7c3aed;
  --neon-b:    #db2777;
  --neon-c:    #6d28d9;
  --neon-d:    #059669;

  --text:      #111827;
  --text2:     #374151;
  --text3:     #6b7280;

  --glow-a:    0 2px 10px rgba(124,58,237,0.15);
  --glow-b:    0 2px 10px rgba(219,39,119,0.12);
  --glow-c:    0 2px 10px rgba(109,40,217,0.12);

  --border-a:  1px solid rgba(124,58,237,0.15);
  --border-b:  1px solid rgba(219,39,119,0.12);
}

html[data-theme="light"] .scanlines { display: none; }
html[data-theme="light"] .app { background: #f2f2f7; }
html[data-theme="light"] .cover-bg { filter: blur(40px) brightness(0.7) saturate(0.5); }

html[data-theme="light"] .header {
  background: rgba(242,242,247,0.88);
  border-bottom: 1px solid rgba(0,0,0,0.08);
}
html[data-theme="light"] .header-title { color: #6d28d9; text-shadow: none; }
html[data-theme="light"] .icon-btn { color: #6b7280; }
html[data-theme="light"] .icon-btn:hover { color: #7c3aed; background: rgba(124,58,237,0.07); }

html[data-theme="light"] .cover-art {
  background: #fff;
  border: 1px solid rgba(0,0,0,0.08);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}
html[data-theme="light"] .cover-art.playing { animation: cover-pulse-light 3s ease-in-out infinite; border-color: rgba(124,58,237,0.25); }
@keyframes cover-pulse-light {
  0%,100% { box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
  50%      { box-shadow: 0 12px 48px rgba(124,58,237,0.2), 0 0 40px rgba(124,58,237,0.1); }
}
html[data-theme="light"] .cover-art.playing .viz-canvas { opacity: 0.25; }
html[data-theme="light"] .now-playing-badge { background: #fff; border-color: rgba(124,58,237,0.25); color: #7c3aed; box-shadow: 0 2px 8px rgba(124,58,237,0.1); text-shadow: none; }

html[data-theme="light"] .track-title  { color: #111827; text-shadow: none; }
html[data-theme="light"] .track-author { color: #374151; }

html[data-theme="light"] .progress-range {
  background: linear-gradient(90deg, #7c3aed var(--p), #e5e7eb var(--p));
  box-shadow: none;
}
html[data-theme="light"] .progress-range::-webkit-slider-thumb { background: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.2); }
html[data-theme="light"] .progress-range::-moz-range-thumb { background: #7c3aed; }
html[data-theme="light"] .progress-range::-moz-range-progress { background: #7c3aed; }
html[data-theme="light"] .time-labels { color: #374151; }

html[data-theme="light"] .play-btn {
  background: #7c3aed; border: 2px solid #7c3aed; color: #fff;
  box-shadow: 0 4px 20px rgba(124,58,237,0.35);
}
html[data-theme="light"] .play-btn:hover { background: #6d28d9; border-color: #6d28d9; box-shadow: 0 6px 28px rgba(124,58,237,0.45); }
html[data-theme="light"] .skip-btn { background: #fff; border: 1px solid rgba(0,0,0,0.1); color: #6b7280; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
html[data-theme="light"] .skip-btn:hover { border-color: #7c3aed; color: #7c3aed; box-shadow: 0 2px 10px rgba(124,58,237,0.15); }

html[data-theme="light"] .bottom-toolbar {
  background: rgba(255,255,255,0.7);
  border-color: rgba(124,58,237,0.12);
  backdrop-filter: blur(16px);
}
html[data-theme="light"] .toolbar-btn { background: rgba(124,58,237,0.03); border-color: rgba(124,58,237,0.08); color: #374151; }
html[data-theme="light"] .toolbar-btn:hover { color: #7c3aed; background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.2); }
html[data-theme="light"] .toolbar-btn-accent { color: #db2777; }
html[data-theme="light"] .toolbar-btn-accent:hover { color: #db2777; background: rgba(219,39,119,0.06); border-color: rgba(219,39,119,0.2); }
html[data-theme="light"] .speed-val { color: #7c3aed; }
html[data-theme="light"] .speed-txt { color: #374151; }

html[data-theme="light"] .sheet { background: rgba(255,255,255,0.95); border-color: rgba(124,58,237,0.12); }
html[data-theme="light"] .sheet-handle { background: rgba(0,0,0,0.15); }
html[data-theme="light"] .sheet-header { border-bottom-color: rgba(0,0,0,0.08); }
html[data-theme="light"] .sheet-title { color: #7c3aed; text-shadow: none; }
html[data-theme="light"] .sheet-overlay { background: rgba(0,0,20,0.35); }

html[data-theme="light"] .playlist-group-header { color: #7c3aed; }
html[data-theme="light"] .playlist-name   { color: #111827; }
html[data-theme="light"] .playlist-duration { color: #374151; }
html[data-theme="light"] .playlist-item:hover { background: rgba(124,58,237,0.04); }
html[data-theme="light"] .playlist-item.active { background: rgba(124,58,237,0.07); border-left-color: #7c3aed; }
html[data-theme="light"] .track-num { color: #6b7280; }
html[data-theme="light"] .playing-bars span { background: #7c3aed; box-shadow: none; }
html[data-theme="light"] .playlist-bar-fill { background: linear-gradient(90deg, #7c3aed, #db2777); }

html[data-theme="light"] .bookmark-jump { background: rgba(219,39,119,0.03); border-color: rgba(219,39,119,0.12); }
html[data-theme="light"] .bookmark-jump:hover { background: rgba(219,39,119,0.07); border-color: rgba(219,39,119,0.25); }
html[data-theme="light"] .bookmark-time-label { color: #db2777; }
html[data-theme="light"] .bookmark-chapter { color: #374151; }
html[data-theme="light"] .bookmark-delete-btn:hover { color: #db2777; background: rgba(219,39,119,0.06); }
html[data-theme="light"] .return-btn { border-color: rgba(124,58,237,0.2); color: #7c3aed; box-shadow: 0 2px 8px rgba(124,58,237,0.08); }
html[data-theme="light"] .return-btn:hover { background: rgba(124,58,237,0.06); }
html[data-theme="light"] .add-bookmark-btn { color: #db2777 !important; }

html[data-theme="light"] .settings-group { border-bottom-color: rgba(0,0,0,0.06); }
html[data-theme="light"] .settings-label { color: #374151; }
html[data-theme="light"] .settings-version { color: #7c3aed; text-shadow: none; }
html[data-theme="light"] .settings-action-btn { background: #fff; border-color: rgba(0,0,0,0.12); color: #1f2937; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
html[data-theme="light"] .settings-action-btn:hover { border-color: #7c3aed; color: #7c3aed; background: #fff; box-shadow: none; }
html[data-theme="light"] .danger-action { border-color: rgba(239,68,68,0.2); color: #6b7280; }
html[data-theme="light"] .danger-action:hover { border-color: #ef4444 !important; color: #ef4444 !important; background: rgba(239,68,68,0.04) !important; }
html[data-theme="light"] .danger-strong { border-color: rgba(239,68,68,0.3); color: rgba(239,68,68,0.8); }

html[data-theme="light"] .volume-slider { background: #e5e7eb; border-color: rgba(0,0,0,0.08); }
html[data-theme="light"] .volume-slider::-webkit-slider-thumb { background: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.18); }
html[data-theme="light"] .volume-slider::-moz-range-thumb { background: #7c3aed; }

html[data-theme="light"] .sleep-btn { background: #fff; border-color: rgba(0,0,0,0.12); color: #1f2937; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
html[data-theme="light"] .sleep-btn:hover { border-color: #7c3aed; color: #7c3aed; background: rgba(124,58,237,0.04); }
html[data-theme="light"] .sleep-btn.active { background: rgba(124,58,237,0.12); border-color: #7c3aed; color: #6d28d9; box-shadow: 0 2px 10px rgba(124,58,237,0.22); font-weight: 700; }
html[data-theme="light"] .sleep-cancel { border-color: rgba(219,39,119,0.25); color: #db2777; }
html[data-theme="light"] .sleep-cancel:hover { border-color: #db2777 !important; color: #db2777 !important; background: rgba(219,39,119,0.05) !important; }
html[data-theme="light"] .sleep-countdown { color: #7c3aed; text-shadow: none; }
html[data-theme="light"] #sleepTime.warning { color: #db2777; text-shadow: none; }

html[data-theme="light"] .library-panel { background: rgba(255,255,255,0.98); border-right-color: rgba(0,0,0,0.08); box-shadow: 4px 0 24px rgba(0,0,0,0.08); }
html[data-theme="light"] .library-header { border-bottom-color: rgba(0,0,0,0.08); }
html[data-theme="light"] .library-header h3 { color: #7c3aed; text-shadow: none; }
html[data-theme="light"] .library-item:hover { background: rgba(124,58,237,0.04); border-color: rgba(124,58,237,0.08); }
html[data-theme="light"] .library-item.active { background: rgba(124,58,237,0.07); border-color: rgba(124,58,237,0.14); border-left-color: #7c3aed; }
html[data-theme="light"] .library-item-title { color: #111827; }
html[data-theme="light"] .library-item-meta  { color: #374151; }
html[data-theme="light"] .library-item-cover { background: #f5f3ff; border-color: rgba(124,58,237,0.15); color: #7c3aed; }
html[data-theme="light"] .library-progress-fill { background: linear-gradient(90deg, #7c3aed, #db2777); }
html[data-theme="light"] .group-header:hover { background: rgba(124,58,237,0.04); border-color: rgba(124,58,237,0.08); }
html[data-theme="light"] .library-group.active > .group-header { background: rgba(124,58,237,0.06); border-color: rgba(124,58,237,0.12); }
html[data-theme="light"] .group-cover { background: #f5f3ff; border-color: rgba(124,58,237,0.2); color: #7c3aed; }
html[data-theme="light"] .group-name { color: #111827; }
html[data-theme="light"] .group-meta { color: #374151; }
html[data-theme="light"] .lib-action-btn:hover { color: #7c3aed; background: rgba(124,58,237,0.07); }
html[data-theme="light"] .library-item-delete:hover { color: #ef4444; }
html[data-theme="light"] .badge-done   { color: #059669; }
html[data-theme="light"] .badge-upload { color: #d97706; }

html[data-theme="light"] .overlay { background: rgba(0,0,0,0.3); }

html[data-theme="light"] .toast { background: rgba(255,255,255,0.97); color: #7c3aed; border-color: rgba(124,58,237,0.2); box-shadow: 0 4px 16px rgba(0,0,0,0.1); }

html[data-theme="light"] .continue-banner { background: rgba(124,58,237,0.04); border-left-color: #7c3aed; border-color: rgba(124,58,237,0.16); }
html[data-theme="light"] .continue-book   { color: #6d28d9; }
html[data-theme="light"] .continue-pos    { color: #6b7280; }
html[data-theme="light"] .continue-btn    { border-color: #7c3aed; color: #7c3aed; }
html[data-theme="light"] .continue-btn:hover { background: rgba(124,58,237,0.07); }

html[data-theme="light"] .update-banner { background: rgba(255,255,255,0.97); color: #7c3aed; border-color: rgba(124,58,237,0.25); box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
html[data-theme="light"] .update-now-btn { background: #7c3aed; }
html[data-theme="light"] .update-close-btn { background: rgba(0,0,0,0.04); border-color: rgba(0,0,0,0.1); color: #9ca3af; }
html[data-theme="light"] .update-close-btn:hover { background: rgba(219,39,119,0.06); border-color: rgba(219,39,119,0.25); color: #db2777; }

html[data-theme="light"] .empty-library { color: #9ca3af; }
html[data-theme="light"] .empty-library svg { color: #c4b5fd; }

@media (hover: none) {
  .icon-btn:hover,
  .play-btn:hover,
  .skip-btn:hover,
  .toolbar-btn:hover,
  .toolbar-btn-accent:hover,
  .playlist-item:hover,
  .bookmark-jump:hover,
  .settings-action-btn:hover,
  .sleep-btn:hover,
  .library-item:hover,
  .lib-action-btn:hover,
  .group-header:hover,
  .continue-btn:hover,
  .update-now-btn:hover,
  .update-close-btn:hover,
  .help-btn:hover {
    color: inherit;
    background: revert;
    border-color: revert;
    box-shadow: none;
  }

  html[data-theme="light"] .icon-btn:hover,
  html[data-theme="light"] .play-btn:hover,
  html[data-theme="light"] .skip-btn:hover,
  html[data-theme="light"] .toolbar-btn:hover,
  html[data-theme="light"] .toolbar-btn-accent:hover,
  html[data-theme="light"] .playlist-item:hover,
  html[data-theme="light"] .bookmark-jump:hover,
  html[data-theme="light"] .settings-action-btn:hover,
  html[data-theme="light"] .sleep-btn:hover,
  html[data-theme="light"] .library-item:hover,
  html[data-theme="light"] .lib-action-btn:hover,
  html[data-theme="light"] .group-header:hover,
  html[data-theme="light"] .continue-btn:hover,
  html[data-theme="light"] .update-now-btn:hover,
  html[data-theme="light"] .update-close-btn:hover,
  html[data-theme="light"] .help-btn:hover {
    color: inherit;
    background: revert;
    border-color: revert;
    box-shadow: none;
  }
}

'@ | Set-Content -LiteralPath 'style.css' -Encoding UTF8

@'
'use strict';

// ===== State =====
const state = {
  library:         [],
  currentId:       null,
  isPlaying:       false,
  speed:           1,
  covers:          {},   // item/group id -> cover blob URL
  coverTypes:      {},   // item/group id -> mime type
  preBookmarkTime: null, // { trackId, time } вЂ” saved before bookmark jump
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
const updateBanner    = document.getElementById('updateBanner');
const updateBannerText= document.getElementById('updateBannerText') || updateBanner?.querySelector('span');
const updateBtn       = document.getElementById('updateBtn');
const updateDismiss   = document.getElementById('updateDismiss');
const appVersionValue = document.getElementById('appVersionValue');
const checkUpdatesBtn = document.getElementById('checkUpdatesBtn');

const APP_VERSION = window.APP_VERSION || 'dev';

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

// ===== App Version / Service Worker =====
let swRegistration = null;
let swUpdateReady = false;
let swManualCheckInFlight = false;
let swRefreshPending = false;

function setAppVersionUI() {
  if (appVersionValue) appVersionValue.textContent = `v${APP_VERSION}`;
}

function showUpdateBanner(version = null) {
  swUpdateReady = true;
  if (updateBannerText) {
    updateBannerText.textContent = version ? `Version ${version} is ready` : 'New version available';
  }
  if (updateBanner) updateBanner.hidden = false;
}

function hideUpdateBanner() {
  if (updateBanner) updateBanner.hidden = true;
}

function bindWaitingWorker(reg) {
  if (!reg) return;
  swRegistration = reg;
  if (reg.waiting) showUpdateBanner();
}

function watchInstallingWorker(worker, reg) {
  if (!worker) return;
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed' && navigator.serviceWorker.controller) {
      bindWaitingWorker(reg);
      if (swManualCheckInFlight) showToast('Update found. Tap Update.');
    }
  });
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
    swRegistration = reg;
    bindWaitingWorker(reg);

    if (reg.installing) watchInstallingWorker(reg.installing, reg);
    reg.addEventListener('updatefound', () => watchInstallingWorker(reg.installing, reg));

    setInterval(() => {
      reg.update().catch(() => {});
    }, 60000);

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (swRefreshPending) return;
      swRefreshPending = true;
      window.location.reload();
    });
  } catch (e) {
    console.warn('[SW] registration failed:', e);
  }
}

async function checkForUpdates({ manual = false } = {}) {
  if (!('serviceWorker' in navigator)) {
    if (manual) showToast('Updates are not supported here');
    return;
  }

  if (!swRegistration) {
    swRegistration = await navigator.serviceWorker.getRegistration('./') || await navigator.serviceWorker.getRegistration();
  }

  if (!swRegistration) {
    if (manual) showToast('Service worker is not ready yet');
    return;
  }

  if (swRegistration.waiting) {
    showUpdateBanner();
    if (manual) showToast('Update is ready');
    return;
  }

  swManualCheckInFlight = manual;
  try {
    await swRegistration.update();
    await new Promise(resolve => setTimeout(resolve, 1200));
    if (swRegistration.waiting || swUpdateReady) {
      showUpdateBanner();
      if (manual) showToast('Update is ready');
    } else if (manual) {
      showToast(`You already have v${APP_VERSION}`);
    }
  } catch (e) {
    console.warn('[SW] update check failed:', e);
    if (manual) showToast('Update check failed');
  } finally {
    swManualCheckInFlight = false;
  }
}

updateDismiss?.addEventListener('click', hideUpdateBanner);
updateBtn?.addEventListener('click', () => {
  if (swRegistration?.waiting) {
    hideUpdateBanner();
    swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return;
  }
  checkForUpdates({ manual: true });
});
checkUpdatesBtn?.addEventListener('click', () => checkForUpdates({ manual: true }));

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
    // Bars max at 32% of canvas height вЂ” subtle background element (3Г— smaller than 96%)
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

function inferImageType(name = '') {
  const lower = name.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  return 'image/jpeg';
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
        <h3>РЈР–Р• РЈРЎРўРђРќРћР’Р›Р•РќРћ</h3>
        <p>РџСЂРёР»РѕР¶РµРЅРёРµ СЂР°Р±РѕС‚Р°РµС‚ РєР°Рє PWA<br>Рё РґРѕР±Р°РІР»РµРЅРѕ РЅР° РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅ.</p>
      </div>`;
    return;
  }

  const iosPill     = `<span class="guide-icon-pill">${SVG_IOS_SHARE} РџРѕРґРµР»РёС‚СЊСЃСЏ</span>`;
  const androidPill = `<span class="guide-icon-pill android">${SVG_ANDROID_DOTS} РњРµРЅСЋ</span>`;

  const iosSteps = `
    <div class="guide-platform-header">
      <div class="guide-platform-icon ios-icon">рџЌЋ</div>
      <div>
        <div class="guide-platform-title">iPhone / iPad</div>
        <div class="guide-platform-sub">Safari Browser</div>
      </div>
    </div>
    <div class="guide-steps">
      ${guideStep(1, 'РћС‚РєСЂРѕР№С‚Рµ СЌС‚Сѓ СЃС‚СЂР°РЅРёС†Сѓ РІ Р±СЂР°СѓР·РµСЂРµ <strong>Safari</strong>')}
      ${guideStep(2, `РќР°Р¶РјРёС‚Рµ РєРЅРѕРїРєСѓ ${iosPill} <strong>РІРЅРёР·Сѓ</strong> СЌРєСЂР°РЅР°`)}
      ${guideStep(3, 'РџСЂРѕРєСЂСѓС‚РёС‚Рµ РІРЅРёР· Рё РЅР°Р¶РјРёС‚Рµ <strong>В«РќР° СЌРєСЂР°РЅ "Р”РѕРјРѕР№"В»</strong>')}
      ${guideStep(4, 'РќР°Р¶РјРёС‚Рµ <strong>В«Р”РѕР±Р°РІРёС‚СЊВ»</strong> РІ РїСЂР°РІРѕРј РІРµСЂС…РЅРµРј СѓРіР»Сѓ')}
    </div>
    <div class="guide-note">
      <strong>Р’Р°Р¶РЅРѕ:</strong> РєРЅРѕРїРєР° РџРѕРґРµР»РёС‚СЊСЃСЏ РґРѕСЃС‚СѓРїРЅР° С‚РѕР»СЊРєРѕ РІ Safari.<br>
      Р’ Chrome РЅР° iOS РµС‘ РЅРµС‚.
    </div>`;

  const androidSteps = `
    <div class="guide-platform-header">
      <div class="guide-platform-icon android-icon">рџ¤–</div>
      <div>
        <div class="guide-platform-title">Android</div>
        <div class="guide-platform-sub">Chrome Browser</div>
      </div>
    </div>
    <div class="guide-steps">
      ${guideStep(1, 'РћС‚РєСЂРѕР№С‚Рµ СЌС‚Сѓ СЃС‚СЂР°РЅРёС†Сѓ РІ Р±СЂР°СѓР·РµСЂРµ <strong>Chrome</strong>')}
      ${guideStep(2, `РќР°Р¶РјРёС‚Рµ ${androidPill} <strong>РІ РїСЂР°РІРѕРј РІРµСЂС…РЅРµРј СѓРіР»Сѓ</strong> СЌРєСЂР°РЅР°`)}
      ${guideStep(3, 'Р’С‹Р±РµСЂРёС‚Рµ <strong>В«Р”РѕР±Р°РІРёС‚СЊ РЅР° РіР»Р°РІРЅС‹Р№ СЌРєСЂР°РЅВ»</strong> РёР»Рё <strong>В«РЈСЃС‚Р°РЅРѕРІРёС‚СЊ РїСЂРёР»РѕР¶РµРЅРёРµВ»</strong>')}
      ${guideStep(4, 'РќР°Р¶РјРёС‚Рµ <strong>В«Р”РѕР±Р°РІРёС‚СЊВ»</strong> РёР»Рё <strong>В«РЈСЃС‚Р°РЅРѕРІРёС‚СЊВ»</strong>')}
    </div>
    <div class="guide-note">
      <strong>РЎРѕРІРµС‚:</strong> Chrome РјРѕР¶РµС‚ СЃР°Рј РїСЂРµРґР»РѕР¶РёС‚СЊ СѓСЃС‚Р°РЅРѕРІРєСѓ вЂ” РёС‰Рё Р±Р°РЅРЅРµСЂ РІРЅРёР·Сѓ СЌРєСЂР°РЅР°.
    </div>`;

  if (platform === 'ios') {
    guideContent.innerHTML = iosSteps;
  } else if (platform === 'android') {
    guideContent.innerHTML = androidSteps;
  } else {
    // Desktop вЂ” show both
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
    if (valEl) valEl.textContent = v.toFixed(1) + 'Г—';
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
  showToast(`Speed: ${next.toFixed(1)}Г—`);
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
function getCoverKey(track, group) {
  return group?.id || track?.id || null;
}

function getCoverUrl(track, group) {
  const key = getCoverKey(track, group);
  return key ? (state.covers[key] || null) : null;
}

function getCoverType(track, group) {
  const key = getCoverKey(track, group);
  return key ? (state.coverTypes[key] || null) : null;
}

function setStoredCover(key, file) {
  if (!key || !file) return;
  if (state.covers[key]) URL.revokeObjectURL(state.covers[key]);
  state.covers[key] = URL.createObjectURL(file);
  state.coverTypes[key] = file.type || inferImageType(file.name);
}

function clearStoredCover(key) {
  if (!key) return;
  if (state.covers[key]) URL.revokeObjectURL(state.covers[key]);
  delete state.covers[key];
  delete state.coverTypes[key];
}

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
  setCoverImage(getCoverUrl(track, group));
}

// ===== Continue Banner =====
function showContinueBanner(track, group, pos) {
  continueBookName.textContent    = group ? `${group.name} вЂє ${track.name}` : track.name;
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
        <p>No audiobooks yet.<br/>Use вљ™ Settings to add files.</p>
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
          <div class="group-meta">${tracks.length} tracks В· ${formatTime(total)}${pct > 0 ? ` В· ${pct}%` : ''}</div>
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
          ${done ? '<span class="badge-done">вњ“</span>' : pct > 0 ? `<span>В· ${pct}%</span>` : ''}
          ${noFile ? '<span class="badge-upload">вљ </span>' : ''}
        </div>
        <div class="library-progress-bar"><div class="library-progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="library-item-actions">
        ${pct > 0 ? `<button class="lib-action-btn" data-reset="${track.id}" title="Reset">в†©</button>` : ''}
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
  const coverUrl = state.covers[book.id];
  return `
    <div class="library-item ${isActive ? 'active' : ''} ${noFile ? 'no-file' : ''}" data-id="${book.id}">
      <div class="library-item-cover ${isActive && state.isPlaying ? 'spinning' : ''}">
        ${coverUrl
          ? `<img src="${coverUrl}" alt="" style="width:100%;height:100%;object-fit:cover;" />`
          : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z"/></svg>`}
      </div>
      <div class="library-item-info">
        <div class="library-item-title">${escapeHtml(book.name)}</div>
        <div class="library-item-meta">
          <span>${formatTime(book.duration || 0)}</span>
          ${done ? '<span class="badge-done">вњ“ done</span>' : pct > 0 ? `<span>В· ${pct}%</span>` : ''}
          ${noFile ? '<span class="badge-upload">вљ  re-upload</span>' : ''}
        </div>
        <div class="library-progress-bar"><div class="library-progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="library-item-actions">
        ${pct > 0 ? `<button class="lib-action-btn" data-reset="${book.id}" title="Reset">в†©</button>` : ''}
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
      <span class="playlist-duration">${track.duration ? formatTime(track.duration) : noFile ? 'вљ ' : 'вЂ”'}</span>
    </div>`;
}

function renderAll() { renderLibrary(); }

// ===== Player =====
function getTrackArtist(track, group) {
  return group?.name || track?.artist || 'AI Audio Reader';
}

function updatePlayerTitle(track, group) {
  trackTitle.textContent  = track.name;
  trackAuthor.textContent = (group ? group.name + ' В· ' : '') + formatSize(track.size);
}

function updatePlayerTitle(track, group) {
  trackTitle.textContent = track.name;
  trackAuthor.textContent = getTrackArtist(track, group);
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
    trackAuthor.textContent = (group ? group.name + ' В· ' : '') + formatSize(track.size) + ' В· ' + formatTime(audio.duration);
    updatePlayerTitle(track, group);
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

function seekBy(seconds) {
  if (!audio.src) return;
  const duration = Number.isFinite(audio.duration) ? audio.duration : 0;
  const maxTime = duration > 0 ? duration : Number.MAX_SAFE_INTEGER;
  audio.currentTime = Math.max(0, Math.min(maxTime, audio.currentTime + seconds));
  updateProgress();
}

function syncPlaybackState() {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.playbackState = state.isPlaying ? 'playing' : 'paused';
}

function updateMediaSession(track, group) {
  if (!('mediaSession' in navigator) || !track) return;
  const coverUrl = getCoverUrl(track, group);
  const coverType = getCoverType(track, group) || 'image/jpeg';
  navigator.mediaSession.metadata = new MediaMetadata({
    title: track.name,
    artist: getTrackArtist(track, group),
    album: group?.name || 'AI Audio Reader',
    artwork: coverUrl
      ? [{ src: coverUrl, sizes: '512x512', type: coverType }]
      : [{ src: new URL('icons/icon.svg', window.location.href).href, sizes: 'any', type: 'image/svg+xml' }],
  });
}

function initMediaSession() {
  if (!('mediaSession' in navigator)) return;
  navigator.mediaSession.setActionHandler('play', playAudio);
  navigator.mediaSession.setActionHandler('pause', pauseAudio);
  navigator.mediaSession.setActionHandler('previoustrack', () => seekBy(-15));
  navigator.mediaSession.setActionHandler('nexttrack', () => seekBy(15));
  navigator.mediaSession.setActionHandler('seekbackward', ({ seekOffset }) => seekBy(-(seekOffset || 15)));
  navigator.mediaSession.setActionHandler('seekforward', ({ seekOffset }) => seekBy(seekOffset || 15));
  try {
    navigator.mediaSession.setActionHandler('seekto', ({ seekTime }) => {
      if (isFinite(seekTime)) {
        audio.currentTime = seekTime;
        updateProgress();
      }
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
      setStoredCover(group.id, coverFile);
      await dbPut('cover_' + group.id, coverFile);
      if (state.currentId) {
        const ctx = findTrack(state.currentId);
        if (ctx?.group?.id === group.id) {
          applyCoverForTrack(ctx.track, ctx.group);
          updateMediaSession(ctx.track, ctx.group);
        }
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
    const rootCoverFile = pendingCovers.__root__;
    if (existing) {
      if (existing.url) URL.revokeObjectURL(existing.url);
      existing.url = URL.createObjectURL(file);
      await dbPut(existing.id, file);
      if (rootCoverFile) {
        setStoredCover(existing.id, rootCoverFile);
        await dbPut('cover_' + existing.id, rootCoverFile);
        if (state.currentId === existing.id) {
          applyCoverForTrack(existing, null);
          updateMediaSession(existing, null);
        }
      }
      continue;
    }
    const id  = generateId();
    const url = URL.createObjectURL(file);
    const book = { id, type: 'single', name, size: file.size, url, duration: 0 };
    state.library.push(book);
    await dbPut(id, file);
    if (rootCoverFile) {
      setStoredCover(id, rootCoverFile);
      await dbPut('cover_' + id, rootCoverFile);
      if (state.currentId === id) {
        applyCoverForTrack(book, null);
        updateMediaSession(book, null);
      }
    }
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
    if (first) {
      const ctx = findTrack(first.id);
      updatePlayerTitle(ctx.track, ctx.group);
      applyCoverForTrack(ctx.track, ctx.group);
      updateMediaSession(ctx.track, ctx.group);
    }
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
  for (const key of Object.keys(state.covers)) clearStoredCover(key);
  state.covers = {};
  state.coverTypes = {};

  state.library = [];
  state.currentId = null;
  state.preBookmarkTime = null;

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(PROGRESS_KEY);
  localStorage.removeItem(CURRENT_KEY);
  localStorage.removeItem(BOOKMARKS_KEY);
  await dbClearAll();

  setCoverImage(null);
  hideContinueBanner();
  resetPlayerUI();
  if (returnBtn) returnBtn.hidden = true;
  renderBookmarks();
  renderAll();
  closeAllSheets();
  showToast('Library cleared');
}

// ===== Reset ALL Data =====
async function resetAll() {
  if (!confirm('Reset ALL data? Library, bookmarks, settings вЂ” everything will be deleted.')) return;

  audio.pause(); audio.src = '';
  state.isPlaying = false;

  for (const item of state.library) {
    if (item.type === 'single' && item.url) URL.revokeObjectURL(item.url);
    if (item.type === 'group') item.tracks.forEach(t => { if (t.url) URL.revokeObjectURL(t.url); });
  }
  for (const key of Object.keys(state.covers)) clearStoredCover(key);

  state.library          = [];
  state.currentId        = null;
  state.covers           = {};
  state.coverTypes       = {};
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
audio.addEventListener('play',  () => { state.isPlaying = true;  updatePlayUI(); syncPlaybackState(); renderAll(); if (chaptersOverlay.classList.contains('open')) renderPlaylist(); });
audio.addEventListener('pause', () => {
  state.isPlaying = false; updatePlayUI(); syncPlaybackState(); renderAll();
  if (state.currentId) saveProgress(state.currentId, audio.currentTime);
});
audio.addEventListener('ended', () => {
  state.isPlaying = false; updatePlayUI();
  if (state.currentId) saveProgress(state.currentId, 0);
  renderAll(); playNext();
});
audio.addEventListener('loadedmetadata', () => { durationEl.textContent = formatTime(audio.duration); updateProgress(); });
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

rewindBtn.addEventListener('click',  () => seekBy(-15));
forwardBtn.addEventListener('click', () => seekBy(15));

function blurControlButton(event) {
  const button = event.currentTarget;
  window.setTimeout(() => button.blur(), 0);
}

[rewindBtn, forwardBtn, playBtn].forEach(btn => {
  btn?.addEventListener('pointerup', blurControlButton);
  btn?.addEventListener('pointercancel', blurControlButton);
});

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
  group.collapsed = !group.collapsed;
  saveLibraryMeta();
  renderLibrary();
}

async function removeGroup(groupId) {
  const idx = state.library.findIndex(g => g.type === 'group' && g.id === groupId);
  if (idx === -1) return;
  const group = state.library[idx];
  const removedTrackIds = group.tracks.map(t => t.id);
  let stopPlayback = false;
  for (const t of group.tracks) {
    if (t.url) URL.revokeObjectURL(t.url);
    clearProgress(t.id);
    await dbDelete(t.id);
    if (t.id === state.currentId) stopPlayback = true;
  }
  if (state.covers[group.id]) {
    clearStoredCover(group.id);
    await dbDelete('cover_' + group.id);
    if (stopPlayback) setCoverImage(null);
  }
  state.library.splice(idx, 1);
  removeBookmarksByTrackIds(removedTrackIds);
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
  if (state.covers[id]) {
    clearStoredCover(id);
    await dbDelete('cover_' + id);
  }
  clearProgress(id);
  removeBookmarksByTrackIds([id]);
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
    removeBookmarksByTrackIds([trackId]);
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
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = null;
    navigator.mediaSession.playbackState = 'none';
  }
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

function removeBookmarksByTrackIds(trackIds) {
  if (!trackIds?.length) return;
  const blockedIds = new Set(trackIds);
  storeBookmarks(loadBookmarks().filter(b => !blockedIds.has(b.trackId)));
  if (state.preBookmarkTime && blockedIds.has(state.preBookmarkTime.trackId)) {
    state.preBookmarkTime = null;
    if (returnBtn) returnBtn.hidden = true;
  }
  renderBookmarks();
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
        <span class="bookmark-chapter">${escapeHtml(b.chapterName)}${b.groupName ? ` В· ${escapeHtml(b.groupName)}` : ''}</span>
      </button>
      <button class="bookmark-delete-btn" data-delete-bookmark="${b.id}" title="Delete">Г—</button>
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
  setAppVersionUI();
  await registerServiceWorker();

  try { db = await openDB(); } catch (e) { console.warn('IndexedDB unavailable:', e); }

  const meta = loadLibraryMeta();
  state.library = meta;

  if (db && state.library.length > 0) {
    const storedIds = new Set(await dbGetAllIds());
    for (const item of state.library) {
      if (item.type === 'single' && storedIds.has(item.id)) {
        const f = await dbGet(item.id);
        if (f) item.url = URL.createObjectURL(f);
        const coverId = 'cover_' + item.id;
        if (storedIds.has(coverId)) {
          const coverFile = await dbGet(coverId);
          if (coverFile) {
            state.covers[item.id] = URL.createObjectURL(coverFile);
            state.coverTypes[item.id] = coverFile.type || inferImageType(coverFile.name);
          }
        }
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
          if (coverFile) {
            state.covers[item.id] = URL.createObjectURL(coverFile);
            state.coverTypes[item.id] = coverFile.type || inferImageType(coverFile.name);
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
      updateMediaSession(ctx.track, ctx.group);
      const pos = loadProgress(lastId);
      if (pos > 5) showContinueBanner(ctx.track, ctx.group, pos);
    }
  }

  renderAll();
}

init();

'@ | Set-Content -LiteralPath 'script.js' -Encoding UTF8

@'
/* =====================================================
   AI Audio Reader - Service Worker
   ===================================================== */

importScripts('./version.js');

const APP_VERSION = self.APP_VERSION || 'dev';
const CACHE_VERSION = self.CACHE_VERSION || `air-${APP_VERSION}`;
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './version.js',
  './icons/icon.svg',
];

self.addEventListener('install', event => {
  console.log(`[SW] Installing ${APP_VERSION}...`);
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', event => {
  console.log(`[SW] Activating ${APP_VERSION}...`);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_VERSION)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.startsWith('blob:')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

'@ | Set-Content -LiteralPath 'sw.js' -Encoding UTF8


