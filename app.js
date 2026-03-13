/* ================================================================
   Photo & Music App — JavaScript
   ================================================================ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────
     TAB SWITCHING
  ────────────────────────────────────────── */
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanels.forEach((p) => p.classList.add('hidden'));

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const panelId = btn.getAttribute('aria-controls');
      document.getElementById(panelId).classList.remove('hidden');
    });
  });

  /* ══════════════════════════════════════════
     CAMERA / PHOTO SECTION
  ══════════════════════════════════════════ */
  const video          = document.getElementById('video');
  const canvas         = document.getElementById('snapshot-canvas');
  const startCameraBtn = document.getElementById('start-camera-btn');
  const captureBtn     = document.getElementById('capture-btn');
  const stopCameraBtn  = document.getElementById('stop-camera-btn');
  const cameraStatus   = document.getElementById('camera-status');
  const galleryGrid    = document.getElementById('gallery-grid');
  const galleryEmpty   = document.getElementById('gallery-empty');
  const photoCount     = document.getElementById('photo-count');

  let mediaStream = null;
  let photoIndex  = 0;

  function updateGalleryEmpty() {
    const count = galleryGrid.querySelectorAll('.gallery-item').length;
    galleryEmpty.style.display = count === 0 ? 'block' : 'none';
    photoCount.textContent = count;
  }

  startCameraBtn.addEventListener('click', async () => {
    try {
      cameraStatus.textContent = 'Requesting camera access…';
      mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      video.srcObject = mediaStream;
      captureBtn.disabled    = false;
      stopCameraBtn.disabled = false;
      startCameraBtn.disabled = true;
      cameraStatus.textContent = '✅ Camera is live';
    } catch (err) {
      cameraStatus.textContent = `⚠️ Camera error: ${err.message}`;
    }
  });

  captureBtn.addEventListener('click', () => {
    if (!mediaStream) return;

    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataURL = canvas.toDataURL('image/png');
    photoIndex += 1;

    const item  = document.createElement('div');
    item.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = dataURL;
    img.alt = `Captured photo ${photoIndex}`;

    const actions = document.createElement('div');
    actions.className = 'img-actions';

    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = '⬇ Save';
    downloadBtn.setAttribute('aria-label', `Save photo ${photoIndex}`);
    downloadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `photo-${photoIndex}.png`;
      link.click();
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑 Delete';
    deleteBtn.setAttribute('aria-label', `Delete photo ${photoIndex}`);
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      item.remove();
      updateGalleryEmpty();
    });

    actions.appendChild(downloadBtn);
    actions.appendChild(deleteBtn);
    item.appendChild(img);
    item.appendChild(actions);
    galleryGrid.prepend(item);
    updateGalleryEmpty();
    cameraStatus.textContent = `📸 Photo ${photoIndex} captured!`;
  });

  stopCameraBtn.addEventListener('click', () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }
    video.srcObject = null;
    captureBtn.disabled     = true;
    stopCameraBtn.disabled  = true;
    startCameraBtn.disabled = false;
    cameraStatus.textContent = '⏹ Camera stopped.';
  });

  updateGalleryEmpty();

  /* ══════════════════════════════════════════
     MUSIC PLAYER SECTION
  ══════════════════════════════════════════ */
  const musicUpload   = document.getElementById('music-upload');
  const playPauseBtn  = document.getElementById('play-pause-btn');
  const prevBtn       = document.getElementById('prev-btn');
  const nextBtn       = document.getElementById('next-btn');
  const seekBar       = document.getElementById('seek-bar');
  const volumeBar     = document.getElementById('volume-bar');
  const currentTimeEl = document.getElementById('current-time');
  const durationEl    = document.getElementById('duration');
  const trackTitle    = document.getElementById('track-title');
  const trackArtist   = document.getElementById('track-artist');
  const playlistEl    = document.getElementById('playlist');
  const playlistEmpty = document.getElementById('playlist-empty');
  const trackCount    = document.getElementById('track-count');
  const nowPlayingArt = document.getElementById('now-playing-art');

  const audio     = new Audio();
  audio.volume    = 0.8;

  let tracks       = [];   // { name, url, duration }
  let currentIndex = -1;

  /* ---- Helpers ---- */
  function formatTime(secs) {
    if (!isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function updatePlaylistUI() {
    const count = tracks.length;
    playlistEmpty.style.display = count === 0 ? 'block' : 'none';
    trackCount.textContent = count;
  }

  function setActiveItem(index) {
    playlistEl.querySelectorAll('.playlist-item').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
  }

  function loadTrack(index) {
    if (index < 0 || index >= tracks.length) return;

    if (audio.src && audio.src.startsWith('blob:')) {
      URL.revokeObjectURL(audio.src);
    }

    currentIndex = index;
    const track  = tracks[index];

    audio.src = track.url;
    audio.load();

    trackTitle.textContent  = track.name;
    trackArtist.textContent = 'Local file';
    seekBar.value           = 0;
    currentTimeEl.textContent = '0:00';
    durationEl.textContent    = '0:00';
    playPauseBtn.disabled     = false;

    setActiveItem(index);
    playTrack();
  }

  function playTrack() {
    audio.play().then(() => {
      playPauseBtn.textContent = '⏸';
      playPauseBtn.setAttribute('aria-label', 'Pause');
      nowPlayingArt.classList.add('spinning');
    }).catch(() => {});
  }

  function pauseTrack() {
    audio.pause();
    playPauseBtn.textContent = '▶';
    playPauseBtn.setAttribute('aria-label', 'Play');
    nowPlayingArt.classList.remove('spinning');
  }

  /* ---- File Upload ---- */
  musicUpload.addEventListener('change', () => {
    const files = Array.from(musicUpload.files);
    if (!files.length) return;

    files.forEach((file) => {
      const objectURL = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^.]+$/, '');

      // Probe duration via temp Audio element
      const probe = new Audio();
      probe.src   = objectURL;
      probe.addEventListener('loadedmetadata', () => {
        const dur = probe.duration;
        tracks.push({ name: cleanName, url: objectURL, duration: dur });
        addPlaylistItem(tracks.length - 1, cleanName, dur);
        updatePlaylistUI();
      });
      probe.addEventListener('error', () => {
        tracks.push({ name: cleanName, url: objectURL, duration: NaN });
        addPlaylistItem(tracks.length - 1, cleanName, NaN);
        updatePlaylistUI();
      });
    });

    musicUpload.value = '';
  });

  function addPlaylistItem(index, name, duration) {
    const li = document.createElement('li');
    li.className = 'playlist-item';
    li.setAttribute('role', 'option');
    li.dataset.index = index;

    const numSpan  = document.createElement('span');
    numSpan.className = 'track-num';
    numSpan.textContent = index + 1;

    const infoDiv  = document.createElement('div');
    infoDiv.className = 'track-info';

    const nameEl = document.createElement('div');
    nameEl.className = 'name';
    nameEl.textContent = name;

    const durEl  = document.createElement('div');
    durEl.className = 'dur';
    durEl.textContent = isFinite(duration) ? formatTime(duration) : '—';

    infoDiv.appendChild(nameEl);
    infoDiv.appendChild(durEl);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.setAttribute('aria-label', `Remove ${name}`);
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeTrack(index);
    });

    li.appendChild(numSpan);
    li.appendChild(infoDiv);
    li.appendChild(removeBtn);

    li.addEventListener('click', () => loadTrack(Number(li.dataset.index)));

    playlistEl.appendChild(li);
  }

  function removeTrack(index) {
    const track = tracks[index];
    if (track) URL.revokeObjectURL(track.url);
    tracks.splice(index, 1);

    // Rebuild playlist DOM (simple approach for correctness)
    playlistEl.innerHTML = '';
    tracks.forEach((t, i) => addPlaylistItem(i, t.name, t.duration));

    if (currentIndex === index) {
      audio.pause();
      audio.src = '';
      playPauseBtn.textContent = '▶';
      playPauseBtn.disabled    = true;
      trackTitle.textContent   = 'No track selected';
      trackArtist.textContent  = '—';
      nowPlayingArt.classList.remove('spinning');
      currentIndex = -1;
    } else if (currentIndex > index) {
      currentIndex -= 1;
    }

    setActiveItem(currentIndex);
    updatePlaylistUI();
  }

  /* ---- Playback Controls ---- */
  playPauseBtn.addEventListener('click', () => {
    if (currentIndex === -1 && tracks.length > 0) {
      loadTrack(0);
      return;
    }
    if (audio.paused) {
      playTrack();
    } else {
      pauseTrack();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (!tracks.length) return;
    const idx = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
    loadTrack(idx);
  });

  nextBtn.addEventListener('click', () => {
    if (!tracks.length) return;
    const idx = (currentIndex + 1) % tracks.length;
    loadTrack(idx);
  });

  audio.addEventListener('ended', () => {
    if (!tracks.length) return;
    const idx = (currentIndex + 1) % tracks.length;
    loadTrack(idx);
  });

  /* ---- Seek Bar ---- */
  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    seekBar.value = (audio.currentTime / audio.duration) * 100;
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
  });

  seekBar.addEventListener('input', () => {
    if (audio.duration) {
      audio.currentTime = (seekBar.value / 100) * audio.duration;
    }
  });

  /* ---- Volume ---- */
  volumeBar.addEventListener('input', () => {
    audio.volume = parseFloat(volumeBar.value);
  });

  updatePlaylistUI();

})();
