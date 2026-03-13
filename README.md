# 📷 Photo & Music App 🎵

A single-page web application that lets you **capture photos with your camera** and **listen to music** — all in one place. No frameworks, no dependencies — just plain HTML, CSS, and JavaScript.

## Features

### 📷 Camera / Photo
- Start your device camera directly in the browser
- Capture photos with a single click
- View all captured photos in a gallery grid
- Download any photo as a PNG file
- Delete unwanted photos from the gallery

### 🎵 Music Player
- Upload one or multiple audio files (MP3, OGG, WAV, etc.)
- Full-featured player with **Play / Pause**, **Previous**, and **Next** controls
- Seek bar to jump to any position in a track
- Volume slider
- Playlist with track names and durations
- Auto-advances to the next track when one finishes
- Remove individual tracks from the playlist
- Spinning album-art animation while playing

## How to Run

Open `index.html` in any modern browser — no build step or server required.

> **Note:** Camera access requires a secure context (HTTPS or `localhost`). If you open the file directly from disk and the camera does not start, serve it via a local HTTP server, e.g.:
> ```bash
> npx serve .
> # or
> python3 -m http.server
> ```

## File Structure

```
photo-music-app/
├── index.html   # App structure & markup
├── style.css    # Dark-theme responsive styles
└── app.js       # Camera & music player logic
```

## Browser Support

Works in all modern browsers (Chrome, Firefox, Edge, Safari) that support:
- `MediaDevices.getUserMedia` (camera)
- `HTML5 <audio>` element (music)
- `URL.createObjectURL` (local file playback)
