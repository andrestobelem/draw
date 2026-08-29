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
├── .github/
│   └── workflows/
│       ├── ci.yml      Pull request and main branch checks
│       └── release.yml Tag-triggered macOS release
├── package.json        Bun scripts and Electron Builder configuration
├── bun.lock            Locked JavaScript toolchain
├── README.md           Project overview
└── docs/
    ├── DEVELOPMENT.md  Development and release guide
    └── USER_GUIDE.md   User-facing guide
```

The renderer has no framework, backend, or bundler. Electron Builder packages the same static renderer with the desktop entrypoint. Generated artifacts are written to `dist/`, which is ignored by Git.

## Tooling

Use Bun `1.4.0` or newer and Node.js `22.12.0` or newer for project commands. Install the committed dependency versions before running checks:

```sh
bun install --frozen-lockfile
```

Available commands:

| Command | Purpose |
| --- | --- |
| `bun run web` | Start the local browser server on `127.0.0.1:4173`. |
| `bun run desktop` | Open the renderer in the Electron desktop shell. |
| `bun run check` | Check the JavaScript syntax in the renderer, server, and main process. |
| `bun run desktop:dir` | Build an unpacked macOS app for a smoke test. |
| `bun run package:mac` | Build the macOS DMG and ZIP distributables. |

`bun run web` accepts an optional `PORT` environment variable, for example `PORT=4174 bun run web`. The server always binds to loopback. Do not open `index.html` directly when testing persistence, file imports, sharing, or other browser security-sensitive behavior.

The desktop shell loads `index.html` directly. Its renderer keeps Node integration disabled, enables context isolation, and runs in a sandboxed window. The main process does not expose an IPC bridge because the current app only needs browser APIs.

## Implementation notes

- The app keeps document data in a single state object containing the drawing name, elements, and app state.
- History stores complete snapshots for document and style state. View navigation (`zoom`, `viewX`, `viewY`) is transient and is not part of undo and redo snapshots.
- Browser local storage persists the current document, history, redo history, and profile data.
- Browser and desktop builds use separate local storage profiles because their origins and storage locations differ.
- Canvas coordinates are transformed through the current view offset and zoom.
- The inspector renders canvas defaults when nothing is selected and element properties when elements are selected.
- The mobile inspector is a clipped drawer. The workspace owns the positioning context so the closed drawer does not expand the page width.
- Export uses browser downloads. Editable files use the app-specific `.excalidraw.json` format and PNG export uses the current canvas background.
- Share uses the Web Share API when available and clipboard text as the fallback.
- `electron/main.cjs` only owns the application window lifecycle. Keep renderer behavior in the existing browser files unless native integration is required.

When changing an exported symbol, inspect all references before editing it. Keep state transitions in the existing history path instead of adding one-off mutations.

## Checks

Run the local syntax and packaging checks:

```sh
bun install --frozen-lockfile
bun run check
bun run desktop:dir
```

Then run the app and exercise the changed behavior on the real canvas. At minimum, check the relevant path plus:

- Create, select, move, resize, duplicate, and delete.
- Undo and redo, including canceled transforms and marquee selections.
- Rename, new drawing, open file, save to device, PNG export, and share fallback.
- Canvas background, element styles, text properties, pen assistance, and theme controls.
- Eraser cursor and edge hit testing.
- Mobile layout at a narrow viewport, including the inspector drawer.
- Electron launch and local storage in the desktop profile.

There is no automated renderer test suite in this repository. GitHub Actions runs the syntax check and an unpacked macOS build for pull requests and pushes to `main`; visual browser and desktop smoke checks remain necessary before publishing.

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

Local Electron Builder builds target the host macOS architecture. They write the `.dmg` and `.zip` artifacts to `dist/`. The release workflow uses the `macos-15` Apple Silicon runner and publishes arm64 packages only.

The GitHub Actions workflows are:

- `CI` runs on pull requests and pushes to `main`. It installs the locked dependencies, runs `bun run check`, and builds an unpacked app with `bun run desktop:dir`.
- `Release macOS` runs for tags matching `v*`. It checks the tag against `package.json`, runs `bun run package:mac`, and publishes the DMG and ZIP to GitHub Releases with the repository `GITHUB_TOKEN`.

No signing or notarization secrets are configured. The release workflow intentionally does not target Windows or Linux.

Release checklist:

1. Update the `version` in `package.json`.
2. Run `bun install --frozen-lockfile` from the committed `bun.lock`.
3. Run `bun run check`.
4. Verify the browser version at desktop and narrow viewports.
5. Verify the Electron app launches and renders the same drawing surface.
6. Test exporting and reopening an editable `.excalidraw.json` file in both environments.
7. Run `bun run desktop:dir` and `bun run package:mac` locally when the release needs a local inspection.
8. Commit the version change with a scoped Conventional Commit.
9. Create and push the matching annotated tag:

   ```sh
   git tag -a vX.Y.Z -m "Release vX.Y.Z"
   git push origin main --follow-tags
   ```

10. Open the generated release at <https://github.com/andrestobelem/draw/releases/latest> and review the DMG and ZIP assets.
11. Review the MIT terms in [`LICENSE`](../LICENSE).

The renderer has no server-side configuration or environment variables. The local Bun server accepts only the optional `PORT`; browser deployment only needs a web server. GitHub releases remain unsigned, so macOS may show a Gatekeeper warning on first launch.

The current published release is [`v1.0.0`](https://github.com/andrestobelem/draw/releases/tag/v1.0.0). See [`README.md`](../README.md) for the user-facing download path and [`USER_GUIDE.md`](USER_GUIDE.md) for app usage.
