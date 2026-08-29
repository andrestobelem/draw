# draw

A small, local-first whiteboard for sketches, diagrams, and ideas.

`draw` is a static browser app. It has no backend and no build step. Your drawing stays in the browser until you export it.

## Features

- Freehand drawing with pointer pressure and pen smoothing.
- Rectangle, diamond, ellipse, line, arrow, and text tools.
- Selection, marquee selection, move, resize, duplicate, and delete.
- Eraser with a visible target circle and matching hit area.
- Undo and redo for drawing, style, name, theme, and canvas changes.
- Undo and redo history stored with the local drawing state.
- Zoom controls, fit to content, and canvas panning.
- Light, dark, and system themes.
- Editable draw file export and PNG export.
- Local profile name and initials.
- Responsive layout with a mobile inspector drawer.

## Quick start

### Requirements

- Python 3 for the simplest local server.
- A modern browser with Canvas and local storage support.

### Run with Python

```sh
python3 -m http.server 4173
```

Open <http://127.0.0.1:4173>.

### Run with npm

The project has no npm dependencies. If npm is available, use either script:

```sh
npm run dev
# or
npm start
```

Both scripts start the same Python server on port `4173`.

## Controls

### Tools

| Tool | Shortcut |
| --- | --- |
| Select | `V` or `1` |
| Draw | `P` or `6` |
| Text | `T` or `8` |
| Rectangle | `R` or `2` |
| Diamond | `D` or `3` |
| Ellipse | `E` or `4` |
| Arrow | `A` or `5` |
| Line | `L` or `7` |
| Eraser | Toolbar |

### Actions

| Action | Shortcut |
| --- | --- |
| Undo | `Cmd/Ctrl + Z` |
| Redo | `Cmd/Ctrl + Shift + Z` or `Cmd/Ctrl + Y` |
| Duplicate selection | `Cmd/Ctrl + D` |
| Select all | `Cmd/Ctrl + A` |
| Delete selection | `Delete` or `Backspace` |
| New drawing | `Cmd/Ctrl + N` |
| Open draw file | `Cmd/Ctrl + O` |
| Save draw file | `Cmd/Ctrl + S` |
| Export PNG | `Cmd/Ctrl + E` |
| Keyboard help | `?` |

Hold `Space` while dragging to pan. Middle- or right-drag also pans. Use the zoom controls, or hold `Cmd`/`Ctrl` while using the mouse wheel.

## Files and data

- `index.html` contains the app shell and static menus.
- `styles.css` contains the visual system and responsive layout.
- `app.js` contains drawing, rendering, state, persistence, and input handling.
- `package.json` contains the optional local-server scripts.
- `docs/` contains the user and development guides.

Drawings and document history are stored in browser local storage. The profile name is stored separately. Clearing browser storage removes local drawings and profile data.

The editable export is a draw-specific JSON format. It is not native Excalidraw file compatibility. Exported files contain the drawing, name, and document settings, but not the local undo and redo stacks.

## Development

There is no dependency install, bundler, or build step.

```sh
npm run dev
node --check app.js
```

Use the browser to verify changes on the real drawing surface. See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for the working conventions and release checklist.

## Distribution

For a static deployment, serve the repository files from a web server. The app entry point is `index.html`.

Before public distribution:

1. Serve the app over HTTPS when hosted publicly.
2. Test drawing, erasing, history, export, import, themes, and mobile layout.
3. Review the MIT terms in [`LICENSE`](LICENSE) before distributing the project.
4. Keep commits focused and use the repository rules in [`AGENTS.md`](AGENTS.md).

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for the full terms.
