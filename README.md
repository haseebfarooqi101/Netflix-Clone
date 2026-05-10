<<<<<<< HEAD
# Netflix-Clone
=======
# Netflix Clone

A pixel-perfect Netflix clone that streams your local MKV movie library with metadata pulled from TMDB.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add the tudum sound

Download a tudum-style sound effect and place it at:

```
public/sounds/tudum.mp3
```

### 3. Run the app

**Both servers at once (recommended):**

```bash
npm run dev
```

This starts:

- Next.js frontend → http://localhost:3000
- Express backend → http://localhost:3001

**Or run separately:**

```bash
npm run dev:next    # frontend
npm run dev:server  # backend
```

## Usage

1. Open http://localhost:3000
2. Sign in (any email + password with 4+ chars)
3. Select or create a profile
4. Browse your movies — metadata, posters, and trailers load automatically from TMDB

## Movie folder structure

Your movies should be in `D:/movies` in folders like:

```
D:/movies/
  Interstellar (2014) [2160p] [4K] [BluRay]/
    Interstellar.2014.2160p.mkv
  Dune (2021) [2160p] [4K]/
    Dune.2021.mkv
```

The server parses folder names to extract title + year, then fetches metadata from TMDB.

## Features

- Netflix-identical login page
- Profile selector + management (up to 5 profiles)
- Hero banner with auto-playing YouTube trailers
- Hover cards with trailer previews
- Full video player with keyboard shortcuts:
  - `Space` / `K` — play/pause
  - `←` / `J` — rewind 10s
  - `→` / `L` — skip 10s
  - `M` — mute
  - `F` — fullscreen
  - `↑` / `↓` — volume
- My List
- Search
- Account & profile settings
- Tudum splash on first load
>>>>>>> 6643834 (1)
