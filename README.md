# draw

A small, local-first whiteboard for sketches, diagrams, and ideas.

`draw` is a static browser app with an optional Electron desktop shell. It has no backend or account system. Drawings stay in the current browser or desktop profile until you export them.

## Features

- Freehand drawing with pointer pressure and pen smoothing.
- Rectangle, diamond, ellipse, line, arrow, and text tools.
- Selection, marquee selection, move, resize, duplicate, and delete.
- Eraser with a visible target circle and matching hit area.
- Undo and redo for drawing, style, name, theme, and canvas changes.
- Undo and redo history stored with the local drawing state.
- Zoom controls, fit to content, and canvas panning.
- Light, dark, and system themes.
- Editable `.excalidraw.json` export and PNG export.
- Local profile name and initials.
- Responsive layout with a mobile inspector drawer.
- macOS desktop packaging through Electron.

## Quick start

### Requirements

- Bun `1.4` or newer for source development and packaging.
- Node.js `22.12.0` or newer for syntax checks, Electron, and packaging.
- macOS for desktop packaging. Published desktop builds target Apple Silicon (`arm64`).
- A modern browser with Canvas and local storage support.

### Download the desktop app

Download the latest macOS build from [GitHub Releases](https://github.com/andrestobelem/draw/releases/latest). The published package is an Apple Silicon (`arm64`) DMG.

1. Open the downloaded `.dmg`.
2. Drag `draw` to `Applications`.
3. Open `draw` from `Applications`.

The app is unsigned and not notarized. If macOS blocks the first launch, Control-click the app, choose **Open**, and confirm. Intel Macs are not targeted by the published build.

### Run from source in a browser

```sh
bun install --frozen-lockfile
bun run web
```

Open <http://127.0.0.1:4173>. Set `PORT` to use another local port, for example `PORT=4174 bun run web`. The development server binds to loopback only.

### Run from source as a desktop app

```sh
bun run desktop
```

The desktop command opens the local app inside Electron. Browser and desktop versions share the same renderer and drawing behavior, but their local storage profiles are separate.

## Package macOS builds

Build an unpacked app for a fast smoke test:

```sh
bun run desktop:dir
```

Build unsigned macOS distributables:

```sh
bun run package:mac
```

Local builds target the host macOS architecture. The build writes a `.dmg` and `.zip` to `dist/`. The CI release workflow builds Apple Silicon (`arm64`) packages only and does not configure code signing, notarization, Windows, or Linux targets.

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

Click the zoom percentage to reset to 100%. Use **Fit to content** to frame the drawing. Hold `Space` while dragging to pan. Middle- or right-drag also pans. Hold `Cmd` on macOS, or `Ctrl` on other systems, while using the mouse wheel to zoom.

## Files and data

- `index.html` contains the app shell and static menus.
- `styles.css` contains the visual system and responsive layout.
- `app.js` contains drawing, rendering, state, persistence, and input handling.
- `server.mjs` provides the dependency-free Bun development server.
- `electron/main.cjs` creates the secure desktop window.
- `build/icon.icns` provides the macOS app icon.
- `package.json` contains Bun scripts and Electron Builder configuration.
- `bun.lock` records the installed JavaScript toolchain.
- `.github/workflows/ci.yml` validates source changes.
- `.github/workflows/release.yml` builds and publishes macOS releases.
- [`docs/USER_GUIDE.md`](docs/USER_GUIDE.md) covers drawing and file operations.
- [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) covers architecture, checks, and releases.

Drawings, document history, and redo history are stored in browser or desktop local storage. The profile name is stored separately. Clearing storage removes local drawings and profile data for that environment.

The editable export is a draw-specific JSON format with an `.excalidraw.json` filename. It is not native Excalidraw file compatibility. Exported files contain the drawing, name, and document settings, but not the local undo and redo stacks.

## Development

Useful commands:

```sh
bun install --frozen-lockfile
bun run web
bun run desktop
bun run check
bun run desktop:dir
bun run package:mac
```

There is no renderer bundler, automated test suite, or backend. Electron Builder packages the static renderer and the Electron entrypoint for macOS. See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for architecture, smoke checks, and the automated release flow.

## Distribution

For browser distribution, serve the repository files from a web server. For desktop distribution, use the published [GitHub Releases](https://github.com/andrestobelem/draw/releases/latest) or run `bun run package:mac` locally.

### Automated macOS releases

The `CI` workflow validates pull requests and pushes to `main` with the locked Bun dependencies, JavaScript syntax checks, and an unpacked macOS build. To publish a desktop release:

1. Update the `version` in `package.json`.
2. Run the release checklist in [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md).
3. Commit the version change.
4. Create a matching annotated tag and push it with the commit:

   ```sh
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin main --follow-tags
   ```

The `Release macOS` workflow requires an annotated tag, checks that the tag matches `package.json`, builds on an Apple Silicon runner, and publishes the `.dmg` and `.zip` files to [GitHub Releases](https://github.com/andrestobelem/draw/releases/latest). Builds are unsigned; macOS may show a Gatekeeper warning on first launch.

The current published release is [`v1.0.0`](https://github.com/andrestobelem/draw/releases/tag/v1.0.0) and predates the workflow's annotated-tag validation.

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for the full terms.
