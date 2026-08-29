# User Guide

`draw` is a local-first whiteboard. It does not require an account or send drawings to a server. Your document, history, and profile stay in the current browser or desktop profile until you export them.

## Choose how to run draw

### Published macOS app

Download the latest Apple Silicon (`arm64`) build from [GitHub Releases](https://github.com/andrestobelem/draw/releases/latest):

1. Open the downloaded `.dmg`.
2. Drag `draw` to `Applications`.
3. Open `draw` from `Applications`.

The published app is unsigned and not notarized. If macOS blocks the first launch, Control-click the app, choose **Open**, and confirm. The published package targets Apple Silicon Macs.

### Browser version

When running from source, use Bun to start the local server:

```sh
bun install --frozen-lockfile
bun run web
```

Open <http://127.0.0.1:4173>. Set `PORT` to use another local port, for example `PORT=4174 bun run web`. The development server listens on this computer only.

A hosted browser deployment can serve the repository files from any web server. Do not open `index.html` directly when testing file imports, sharing, or other browser security-sensitive behavior.

### Desktop version from source

Run the Electron shell from the repository with:

```sh
bun run desktop
```

The browser and desktop versions use the same renderer and drawing behavior. They use separate local storage profiles, so a drawing saved in one environment does not automatically appear in the other.

## Start a drawing

1. Choose a tool from the left toolbar or press its shortcut.
2. Draw, click, or type on the canvas.
3. Use the properties inspector on the right to adjust the active tool or selected elements.

The save indicator in the top bar shows when the current document is saved locally. There is no account or cloud backup. Export important drawings as editable files or PNG images.

## Interface

- The left rail contains selection, drawing, shape, text, line, arrow, eraser, undo, and redo controls.
- The top bar contains the drawing menu, drawing name, appearance, keyboard help, share, export, and profile controls.
- The stage toolbar contains delete-selection, current tool, properties-panel, and zoom controls.
- The properties inspector shows default styles when nothing is selected and element properties when something is selected.

On small screens, the properties inspector becomes a drawer. Use the sliders button in the stage toolbar to open or close it.

## Draw and edit

### Freehand lines

Choose **Draw** and drag across the canvas. Pen pressure is used when the input device provides it. When no element is selected, use **Pen > Assistance** in the inspector:

- **Off** keeps the raw stroke.
- **Soft** applies the recommended smoothing.
- **Strong** produces a steadier stroke.

### Shapes and connectors

Choose **Rectangle**, **Diamond**, **Ellipse**, **Line**, or **Arrow**, then drag from the start point to the end point. Rectangles, diamonds, and ellipses support fills; lines and arrows use stroke settings.

### Text

Choose **Text**, click the canvas, and type. Press `Enter` to finish a text edit. Use `Shift + Enter` for a new line. Press `Escape` to cancel an empty or unfinished text edit.

For a selected text element, the inspector controls font family, size, and alignment. Available fonts are hand-drawn, sans serif, serif, and monospace.

### Select and transform

Choose **Select** and click an element. Drag a selected element to move it. Drag a handle to resize it. Drag on empty canvas to create a marquee selection.

Use `Shift` while selecting to add or remove elements from the current selection. Press `Cmd/Ctrl + A` to select all. Duplicate or delete the selection from the inspector, toolbar, or keyboard.

### Erase

Choose **Eraser**. The red circle shows the active erase area. Point at an element and click or drag across it. The visible circle and the hit area use the same radius.

## Style and canvas settings

The inspector changes the defaults when nothing is selected and changes selected elements otherwise. Depending on the active element, it can control:

- Stroke and background colors, including transparent background.
- Stroke width: 1, 2, 4, or 8.
- Line style: solid, dashed, or dotted.
- Fill style for shapes: solid or hachure.
- Opacity from 10% to 100%.
- Text font, size, and alignment.
- Whiteboard canvas background presets.

## View the canvas

- Use the **−**, percentage, and **+** controls to zoom out, reset to 100%, or zoom in.
- Use **Fit to content** to frame the current drawing.
- Hold `Space` while dragging to pan.
- Middle-drag or right-drag to pan.
- Drag with no selection to create a marquee selection when using **Select**.
- Hold `Cmd` on macOS, or `Ctrl` on other systems, while scrolling to zoom. Without the modifier, scrolling pans the canvas.

## History

Use the undo and redo buttons, or use the keyboard shortcuts. History covers visible drawing changes and document changes such as:

- Creating, moving, resizing, duplicating, and deleting elements.
- Text edits and style changes.
- Drawing name, theme, and canvas background changes.

Canceling a pan, transform, text edit, or marquee selection restores the state from before that interaction. History is stored locally and is not included in exported files.

## Name a drawing

Click the drawing name in the top bar. On small screens, open the draw menu and choose **Rename drawing**. Drawing names are trimmed and limited to 80 characters.

## Open and export files

Click the **draw** logo to open the file menu:

- **New drawing** clears the current document after confirmation.
- **Open file** imports an existing JSON sketch.
- **Rename drawing** changes the document name.
- **Save to device** downloads the editable file.

Use **Export** in the top bar for image and editable-file exports:

- **PNG image** downloads a raster image with the current whiteboard background.
- **Draw file** downloads an app-specific `.excalidraw.json` JSON file for later editing.

**Share** uses the browser share sheet when available. Otherwise, it copies the serialized drawing data to the clipboard. Sharing is not a cloud upload.

The editable JSON format is specific to this app. It is not native Excalidraw file compatibility. It preserves the drawing, name, and document settings, but not browser-local undo and redo history.

## Themes and profile

- Choose **System**, **Light**, or **Dark** from the appearance control.
- Open the profile control to set a display name or return to **Guest**.

The display name is limited to 60 characters. Theme and profile settings are saved locally in the current browser or desktop profile.

## Keyboard reference

| Action | Shortcut |
| --- | --- |
| Select | `V` or `1` |
| Draw | `P` or `6` |
| Text | `T` or `8` |
| Rectangle | `R` or `2` |
| Diamond | `D` or `3` |
| Ellipse | `E` or `4` |
| Arrow | `A` or `5` |
| Line | `L` or `7` |
| Undo | `Cmd/Ctrl + Z` |
| Redo | `Cmd/Ctrl + Shift + Z` or `Cmd/Ctrl + Y` |
| Duplicate | `Cmd/Ctrl + D` |
| Select all | `Cmd/Ctrl + A` |
| Delete | `Delete` or `Backspace` |
| New drawing | `Cmd/Ctrl + N` |
| Open file | `Cmd/Ctrl + O` |
| Save to device | `Cmd/Ctrl + S` |
| Export PNG | `Cmd/Ctrl + E` |
| Zoom in | `Cmd/Ctrl + +` or `Cmd/Ctrl + =` |
| Zoom out | `Cmd/Ctrl + -` |
| Pan canvas | Hold `Space` while dragging |
| Keyboard help | `?` |

The eraser is selected from the toolbar and has no keyboard shortcut. The keyboard help button opens the same shortcut reference inside the app.

## Storage and safety

Drawings, history, redo history, theme, and profile data are stored locally by the current browser or desktop profile. Clearing site or app storage removes that local data. Save an editable file before clearing storage or changing environments.

The desktop shell runs the renderer without Node integration, with context isolation and sandboxing enabled. The app does not expose a native file-sync or cloud service.

For development details and the release process, see [`docs/DEVELOPMENT.md`](DEVELOPMENT.md). The published desktop builds are available from [GitHub Releases](https://github.com/andrestobelem/draw/releases/latest).
