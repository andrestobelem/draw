# Development Guide

## Project shape

`draw` has a dependency-free browser renderer and a small Electron desktop shell.

```text
.
├── index.html          Browser and desktop app shell
├── styles.css          Layout, components, themes, and responsive rules
├── app.js              State, rendering, input, history, and persistence
├── server.mjs          Bun development server
├── electron/
│   └── main.cjs        Secure Electron main process
├── build/
│   └── icon.icns       macOS app icon
├── package.json        Bun scripts and Electron Builder configuration
├── bun.lock            Locked JavaScript toolchain
├── README.md           Project overview
└── docs/
    ├── DEVELOPMENT.md  Development and release guide
    └── USER_GUIDE.md   User-facing guide
```

The renderer has no framework, backend, or bundler. Electron Builder packages the same static renderer with the desktop entrypoint. Generated artifacts are written to `dist/`, which is ignored by Git.

## Tooling

Use Bun `1.4` or newer for project commands:

```sh
bun install
bun run check
```

Run the browser version:

```sh
bun run web
```

Open <http://127.0.0.1:4173>. Do not open `index.html` directly when testing persistence, file imports, sharing, or other browser security-sensitive behavior.

Run the desktop version:

```sh
bun run desktop
```

The desktop shell loads `index.html` directly. The renderer keeps Node integration disabled, enables context isolation, and runs in a sandboxed window. The main process does not expose an IPC bridge because the current app only needs browser APIs.

## Implementation notes

- The app keeps document data in a single state object containing the drawing name, elements, and app state.
- History stores complete snapshots for document and style state. View navigation (`zoom`, `viewX`, `viewY`) is transient and is not part of undo and redo snapshots.
- Browser local storage persists the current document, history, redo history, and profile data.
- The browser and desktop builds use separate local storage profiles because their origins and storage locations differ.
- Canvas coordinates are transformed through the current view offset and zoom.
- The inspector renders controls from the current selection and app defaults.
- The mobile inspector is a clipped drawer. The workspace owns the positioning context so the closed drawer does not expand the page width.
- Export uses browser downloads. Share uses the Web Share API when available and clipboard text as the fallback.
- `electron/main.cjs` only owns the application window lifecycle. Keep renderer behavior in the existing browser files unless native integration is required.

When changing an exported symbol, inspect all references before editing it. Keep state transitions in the existing history path instead of adding one-off mutations.

## Checks

Run the JavaScript syntax check:

```sh
bun run check
```

Then run the app and exercise the changed behavior on the real canvas. At minimum, check the relevant path plus:

- Create, select, move, resize, duplicate, and delete.
- Undo and redo.
- Rename, new drawing, open, save, PNG export, and share fallback.
- Theme and profile controls.
- Eraser cursor and edge hit testing.
- Mobile layout at a narrow viewport, including the inspector drawer.
- Electron launch and local storage in the desktop profile.

There is no automated test suite or renderer build command in this repository. Browser and desktop smoke checks are the release gate for behavior changes.

## Editing rules

- Reuse the existing visual and interaction patterns.
- Keep user-facing text in simplified English unless a product language is intentionally changed.
- Preserve keyboard and pointer cancellation behavior.
- Avoid adding dependencies for functionality already available in the browser.
- Keep source files readable and avoid generated artifacts.

Commit rules are recorded in [`AGENTS.md`](../AGENTS.md): use scoped Conventional Commits, keep commits atomic, use simplified English, and do not add authorship trailers.

## macOS desktop release

Build an unpacked app for a local smoke test:

```sh
bun run desktop:dir
```

Build unsigned macOS distributables:

```sh
bun run package:mac
```

Electron Builder writes the `.dmg` and `.zip` artifacts to `dist/`. The current configuration targets the host macOS architecture and does not configure code signing, notarization, Windows, or Linux targets.

The GitHub Actions workflows use the `macos-15` Apple Silicon runner:

- `CI` runs on pull requests and pushes to `main`. It installs the locked dependencies, runs `bun run check`, and builds an unpacked app with `bun run desktop:dir`.
- `Release macOS` runs for tags matching `v*`. It checks the tag against `package.json`, runs `bun run package:mac`, and publishes the DMG and ZIP to GitHub Releases with the repository token.

Release checklist:

1. Run `bun install --frozen-lockfile` from the committed `bun.lock`.
2. Run `bun run check`.
3. Verify the browser version in a narrow and desktop viewport.
4. Verify the Electron app launches and renders the same drawing surface.
5. Test exporting and reopening a JSON file in both environments.
6. Run `bun run package:mac` and inspect the generated artifacts.
7. Update the `version` in `package.json` and commit it.
8. Create and push the matching annotated tag, for example `git tag -a v1.0.0 -m "Release v1.0.0" && git push origin main --follow-tags`.
9. Open the generated release at <https://github.com/andrestobelem/draw/releases/latest> and review the DMG and ZIP assets.
10. Review the MIT terms in [`LICENSE`](../LICENSE).

The app has no server-side configuration or environment variables. Browser deployment only needs a web server. Desktop packaging only needs macOS, Bun, and the locked dependencies. GitHub releases remain unsigned, so macOS may show a Gatekeeper warning on first launch.
