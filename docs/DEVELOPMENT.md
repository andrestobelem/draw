# Development Guide

## Project shape

`draw` is a dependency-free static web app.

```text
.
├── index.html          App shell and static controls
├── styles.css          Layout, components, themes, and responsive rules
├── app.js              State, rendering, input, history, and persistence
├── package.json        Optional local-server scripts
├── README.md           Project overview
└── docs/
    ├── DEVELOPMENT.md  Development and release guide
    └── USER_GUIDE.md   User-facing guide
```

There is no bundler, framework, backend, or generated source directory.

## Local development

Start the local server from the repository root:

```sh
npm run dev
```

Or use Python directly:

```sh
python3 -m http.server 4173
```

Open <http://127.0.0.1:4173> and test the app through the browser. Do not open `index.html` directly when testing persistence, file imports, sharing, or other browser security-sensitive behavior.

## Implementation notes

- The app keeps document data in a single state object containing the drawing name, elements, and app state.
- History stores complete snapshots so undo and redo cover document and view changes consistently.
- Browser local storage persists the current document, history, redo history, and profile data.
- Canvas coordinates are transformed through the current view offset and zoom.
- The inspector renders controls from the current selection and app defaults.
- The mobile inspector is a clipped drawer. The workspace owns the positioning context so the closed drawer does not expand the page width.
- Export uses browser downloads. Share uses the Web Share API when available and clipboard text as the fallback.

When changing an exported symbol, inspect all references before editing it. Keep state transitions in the existing history path instead of adding one-off mutations.

## Checks

Run the JavaScript syntax check:

```sh
node --check app.js
```

Then run the app and exercise the changed behavior on the real canvas. At minimum, check the relevant path plus:

- Create, select, move, resize, duplicate, and delete.
- Undo and redo.
- Rename, new drawing, open, save, PNG export, and share fallback.
- Theme and profile controls.
- Eraser cursor and edge hit testing.
- Mobile layout at a narrow viewport, including the inspector drawer.

There is no automated test suite or build command in this repository today. Browser smoke checks are the release gate for behavior changes.

## Editing rules

- Reuse the existing visual and interaction patterns.
- Keep user-facing text in simplified English unless a product language is intentionally changed.
- Preserve keyboard and pointer cancellation behavior.
- Avoid adding dependencies for functionality already available in the browser.
- Keep source files readable and avoid generated artifacts.

Commit rules are recorded in [`AGENTS.md`](../AGENTS.md): use Conventional Commits, keep commits atomic, use simplified English, and do not add authorship trailers.

## Static release checklist

1. Run `node --check app.js`.
2. Start the local server and verify the changed behavior in a browser.
3. Test a narrow viewport and a desktop viewport.
4. Test exporting and reopening a JSON file.
5. Confirm that no debug UI or temporary files are included.
6. Serve the static files from the deployment host.
7. Add a license before public redistribution.

The app has no server-side configuration or environment variables. Deployment only needs a web server that can serve `index.html`, `styles.css`, and `app.js`.
