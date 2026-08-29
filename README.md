# draw

A small, local-first whiteboard for sketches, diagrams, and ideas.

`draw` is a static browser app with an optional Electron desktop shell. It has no backend. Your drawing stays in the current browser or desktop profile until you export it.

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
- macOS desktop packaging through Electron.

## Quick start

### Requirements

- Bun `1.4` or newer for project commands.
- macOS for building the desktop distributables.
- A modern browser with Canvas and local storage support.

### Install

```sh
bun install
```

### Run in a browser

```sh
bun run web
```

Open <http://127.0.0.1:4173>.

### Run the desktop app

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

The build writes a `.dmg` and `.zip` to `dist/`. The current configuration targets macOS only and intentionally does not configure code signing, notarization, Windows, or Linux targets.

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
- `server.mjs` provides the dependency-free Bun development server.
- `electron/main.cjs` creates the secure desktop window.
- `build/icon.icns` provides the macOS app icon.
- `package.json` contains Bun scripts and Electron Builder configuration.
- `bun.lock` records the installed JavaScript toolchain.
- `docs/` contains the user and development guides.

Drawings and document history are stored in browser or desktop local storage. The profile name is stored separately. Clearing storage removes local drawings and profile data for that environment.

The editable export is a draw-specific JSON format. It is not native Excalidraw file compatibility. Exported files contain the drawing, name, and document settings, but not the local undo and redo stacks.

## Development

Useful commands:

```sh
bun run web
bun run desktop
bun run check
```

There is no renderer bundler or backend. Electron Builder packages the static renderer and the Electron entrypoint for macOS. See [`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for architecture, smoke checks, and the desktop release checklist.

## Distribution

For browser distribution, serve the repository files from a web server. For local desktop distribution, run `bun run package:mac` on macOS and share the generated artifacts from `dist/`.

### Automated macOS releases

The `CI` workflow validates pull requests and pushes to `main` with the locked Bun dependencies, JavaScript syntax checks, and an unpacked macOS build. To publish a desktop release:

1. Update the `version` in `package.json`.
2. Commit the version change.
3. Create a matching tag and push it with the commit:

   ```sh
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin main --follow-tags
   ```

The `Release macOS` workflow checks that the tag matches `package.json`, builds on an Apple Silicon runner, and publishes the `.dmg` and `.zip` files to [GitHub Releases](https://github.com/andrestobelem/draw/releases/latest). Builds are macOS arm64 and unsigned; code signing, notarization, Windows, and Linux targets are intentionally not configured.

Before distribution:

1. Install from the committed `bun.lock` and run the relevant smoke checks.
2. Test drawing, erasing, history, export, import, themes, and mobile layout.
3. Test the unsigned desktop app separately from the browser app.
4. Review the MIT terms in [`LICENSE`](LICENSE).
5. Keep commits focused and use the repository rules in [`AGENTS.md`](AGENTS.md).

## License

This project is licensed under the MIT License. See [`LICENSE`](LICENSE) for the full terms.
