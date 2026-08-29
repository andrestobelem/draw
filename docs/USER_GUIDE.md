# User Guide

## Start a drawing

1. Open `draw` in a browser.
2. Choose a tool from the toolbar.
3. Draw on the canvas.
4. Use the inspector to change stroke, fill, width, style, opacity, and smoothing.

The current drawing is saved in the browser automatically. There is no account or server storage.

## Draw and edit

### Freehand lines

Choose **Draw** and drag across the canvas. Pen pressure is used when the input device provides it. Change pen smoothing in the inspector when no element is selected.

### Shapes and connectors

Choose **Rectangle**, **Diamond**, **Ellipse**, **Line**, or **Arrow**, then drag from the start point to the end point. Use the inspector to adjust colors, stroke width, stroke style, fill, and opacity.

### Text

Choose **Text**, click the canvas, and type. Finish with `Enter` or click elsewhere. Press `Escape` to cancel an empty or unfinished text edit.

### Select and transform

Choose **Select** and click an element. Drag a selected element to move it. Drag a handle to resize it. Drag on empty canvas to create a marquee selection.

Use `Shift` while selecting to add or remove elements from the current selection.

### Erase

Choose **Eraser**. The red circle shows the active erase area. Point at an element and click or drag across it. The visible circle and the hit area use the same radius.

## View the canvas

- Use the zoom controls in the stage toolbar.
- Use **Fit to content** to frame the drawing.
- Hold `Space` while dragging to pan.
- Middle-drag or right-drag to pan.
- Hold `Cmd` on macOS, or `Ctrl` on other systems, while scrolling to zoom.

On small screens, the inspector starts closed so the canvas remains usable. Use the sliders button in the stage toolbar to open it.

## History

Use the undo and redo buttons, or use the keyboard shortcuts. History covers visible drawing changes and document changes such as:

- Creating, moving, resizing, duplicating, and deleting elements.
- Text edits and style changes.
- Drawing name, theme, and canvas background changes.

Canceling a pan, transform, or marquee selection restores the state from before that interaction.

## Name a drawing

Click the drawing name in the top bar on desktop. On small screens, open the logo menu and choose **Rename drawing**. Names are trimmed and limited to 80 characters.

## Open and export files

Open the logo menu for file actions:

- **New drawing** clears the current document after confirmation.
- **Open** imports a draw JSON file.
- **Save** downloads an editable draw JSON file.
- **Export PNG** downloads a raster image with the current canvas background.
- **Share** uses the browser share sheet when available. Otherwise, it copies the drawing data to the clipboard.

The JSON format is specific to this app. It preserves the drawing and document settings, but it does not include browser-local undo and redo history.

## Themes and profile

- Choose **System**, **Light**, or **Dark** from the theme control.
- Open the profile control to set a display name and initials.

Both settings are saved locally in the current browser.

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
| Open | `Cmd/Ctrl + O` |
| Save | `Cmd/Ctrl + S` |
| Export PNG | `Cmd/Ctrl + E` |
| Keyboard help | `?` |
