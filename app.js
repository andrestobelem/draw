(() => {
  "use strict";

  const STORAGE_KEY = "excalidraw-clone-state-v1";
  const PROFILE_STORAGE_KEY = "draw-profile-v1";
  const HISTORY_APP_STATE_KEYS = Object.freeze([
    "strokeColor",
    "backgroundColor",
    "canvasBackgroundColor",
    "canvasBackgroundAuto",
    "theme",
    "penSmoothing",
    "fillStyle",
    "strokeWidth",
    "strokeStyle",
    "opacity",
    "fontSize",
    "fontFamily",
    "textAlign",
  ]);
  const MAX_HISTORY = 80;
  const ERASER_RADIUS = 18;
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3.5;
  const GRID_SIZE = 24;
  const HAND_FONT = '"Chalkboard SE", "Marker Felt", "Noteworthy", "Comic Sans MS", "Segoe Print", "Bradley Hand", cursive';
  const UI_FONT = 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const VALID_TYPES = new Set(["rectangle", "diamond", "ellipse", "line", "arrow", "freedraw", "text"]);
  const STROKE_COLOR_PRESETS = [
    ["#34363f", "Ink"],
    ["#495057", "Slate"],
    ["#c92a2a", "Red"],
    ["#d9480f", "Orange"],
    ["#e67700", "Amber"],
    ["#2b8a3e", "Green"],
    ["#0b7285", "Teal"],
    ["#1864ab", "Blue"],
    ["#6741d9", "Purple"],
    ["#a61e4d", "Pink"],
  ];
  const FILL_COLOR_PRESETS = [
    ["transparent", "Transparent"],
    ["#ffc9c9", "Blush"],
    ["#ffd8a8", "Peach"],
    ["#ffec99", "Lemon"],
    ["#b2f2bb", "Mint"],
    ["#96f2d7", "Aqua"],
    ["#a5d8ff", "Sky"],
    ["#d0bfff", "Lavender"],
    ["#fcc2d7", "Rose"],
    ["#f1f3f5", "Gray"],
  ];
  const WHITEBOARD_COLOR_PRESETS = [
    ["#ffffff", "White"],
    ["#f8f9fc", "Soft white"],
    ["#fff8e1", "Vanilla"],
    ["#fff0f6", "Rose"],
    ["#f3f0ff", "Lavender"],
    ["#e7f5ff", "Sky"],
    ["#e6fcf5", "Mint"],
    ["#f1f3f5", "Fog"],
    ["#202124", "Charcoal"],
  ];
  const THEME_MODES = ["light", "dark", "system"];
  const THEME_LABELS = { light: "Light", dark: "Dark", system: "System" };
  const PEN_SMOOTHING_MODES = ["off", "soft", "strong"];
  const canvas = document.querySelector("#canvas");
  const stage = document.querySelector("#stage");
  const ctx = canvas.getContext("2d");
  const inspector = document.querySelector("#inspector");
  const inspectorToggleButton = document.querySelector("#inspector-toggle-button");
  const textEditorLayer = document.querySelector("#text-editor-layer");
  const welcomeTip = document.querySelector("#welcome-tip");
  const coordinateLabel = document.querySelector("#cursor-coordinates");
  const zoomValue = document.querySelector("#zoom-value");
  const pointerMode = document.querySelector("#pointer-mode");
  const saveStatus = document.querySelector("#save-status");
  const toast = document.querySelector("#toast");
  const eraserCursor = document.querySelector("#eraser-cursor");
  const helpModal = document.querySelector("#help-modal");
  const dialogModal = document.querySelector("#dialog-modal");
  const dialogEyebrow = document.querySelector("#dialog-eyebrow");
  const dialogTitle = document.querySelector("#dialog-title");
  const dialogMessage = document.querySelector("#dialog-message");
  const dialogInput = document.querySelector("#dialog-input");
  const dialogCancelButton = document.querySelector("#dialog-cancel-button");
  const dialogConfirmButton = document.querySelector("#dialog-confirm-button");
  const exportPopover = document.querySelector("#export-popover");
  const filePopover = document.querySelector("#file-popover");
  const fileInput = document.querySelector("#file-input");
  const themeButton = document.querySelector("#theme-button");
  const themePopover = document.querySelector("#theme-popover");
  const profileButton = document.querySelector("#profile-button");
  const profilePopover = document.querySelector("#profile-popover");
  const profileNameInput = document.querySelector("#profile-name-input");
  const avatarInitials = document.querySelector("#avatar-initials");
  const avatarPlaceholder = document.querySelector("#avatar-placeholder");
  const profilePreviewInitials = document.querySelector("#profile-preview-initials");
  const profilePreviewPlaceholder = document.querySelector("#profile-preview-placeholder");
  const profilePreviewName = document.querySelector("#profile-preview-name");

  const toolNames = {
    selection: "Select",
    draw: "Draw",
    text: "Text",
    rectangle: "Rectangle",
    diamond: "Diamond",
    ellipse: "Ellipse",
    arrow: "Arrow",
    line: "Line",
    eraser: "Eraser",
  };

  const toolShortcuts = {
    v: "selection",
    1: "selection",
    p: "draw",
    6: "draw",
    t: "text",
    8: "text",
    r: "rectangle",
    2: "rectangle",
    d: "diamond",
    3: "diamond",
    e: "ellipse",
    4: "ellipse",
    a: "arrow",
    5: "arrow",
    l: "line",
    7: "line",
  };

  const defaultAppState = {
    tool: "selection",
    viewX: null,
    viewY: null,
    zoom: 1,
    strokeColor: "#34363f",
    backgroundColor: "transparent",
    canvasBackgroundColor: "#f8f9fc",
    canvasBackgroundAuto: true,
    theme: "system",
    penSmoothing: "soft",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    opacity: 100,
    fontSize: 28,
    fontFamily: "hand",
    textAlign: "left",
    selectedElementIds: {},
  };

  function createInitialState() {
    return {
      type: "excalidraw-clone",
      version: 1,
      name: "Untitled sketch",
      elements: [],
      appState: { ...defaultAppState },
    };
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return `element-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function isFiniteNumber(value) {
    return typeof value === "number" && Number.isFinite(value);
  }

  function safeNumber(value, fallback) {
    return isFiniteNumber(value) ? value : fallback;
  }

  function isHexColor(value) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  }
  function pressureForPoint(point) {
    const pressure = safeNumber(point?.pressure, 0.5);
    return pressure > 0 ? Math.min(1, pressure) : 0.5;
  }
  function pointerPressure(event) {
    return pressureForPoint({ pressure: event?.pressure });
  }

  function pointerTime(event) {
    return isFiniteNumber(event?.timeStamp) && event.timeStamp > 0 ? event.timeStamp : window.performance.now();
  }

  function filterAlpha(cutoff, deltaSeconds) {
    const safeCutoff = Math.max(0.1, cutoff);
    const tau = 1 / (2 * Math.PI * safeCutoff);
    return 1 / (1 + tau / deltaSeconds);
  }

  function createPenFilter(point, time) {
    return {
      rawX: point.x,
      rawY: point.y,
      filteredX: point.x,
      filteredY: point.y,
      pressure: pressureForPoint(point),
      velocityX: 0,
      velocityY: 0,
      time,
    };
  }

  function filterPenPoint(filter, point, time, mode) {
    if (!filter || mode === "off") return point;
    const elapsed = isFiniteNumber(time) && isFiniteNumber(filter.time) ? (time - filter.time) / 1000 : 1 / 60;
    const deltaSeconds = Math.max(1 / 240, Math.min(0.1, elapsed));
    const minCutoff = mode === "strong" ? 1.35 : 2.6;
    const beta = mode === "strong" ? 0.04 : 0.055;
    const derivativeAlpha = filterAlpha(1, deltaSeconds);
    const rawVelocityX = (point.x - filter.rawX) / deltaSeconds;
    const rawVelocityY = (point.y - filter.rawY) / deltaSeconds;
    filter.velocityX = derivativeAlpha * rawVelocityX + (1 - derivativeAlpha) * filter.velocityX;
    filter.velocityY = derivativeAlpha * rawVelocityY + (1 - derivativeAlpha) * filter.velocityY;
    const cutoff = minCutoff + beta * Math.hypot(filter.velocityX, filter.velocityY);
    const valueAlpha = filterAlpha(cutoff, deltaSeconds);
    const pressureAlpha = Math.min(1, valueAlpha * 1.35);
    filter.pressure += pressureAlpha * (pressureForPoint(point) - filter.pressure);
    const filtered = {
      x: filter.filteredX + valueAlpha * (point.x - filter.filteredX),
      y: filter.filteredY + valueAlpha * (point.y - filter.filteredY),
      pressure: filter.pressure,
    };
    filter.rawX = point.x;
    filter.rawY = point.y;
    filter.filteredX = filtered.x;
    filter.filteredY = filtered.y;
    filter.time = time;
    return filtered;
  }
  function appendFilteredPenPoint(element, pointerState, event, mode) {
    const screen = getLocalPoint(event);
    const world = screenToWorld(screen);
    const rawPoint = { x: world.x, y: world.y, pressure: pointerPressure(event) };
    pointerState.lastRawPoint = rawPoint;
    const point = filterPenPoint(pointerState.penFilter, rawPoint, pointerTime(event), mode);
    const points = element.points || [];
    const last = points[points.length - 1];
    if (!last || Math.hypot(last.x - point.x, last.y - point.y) > 1.5 / state.appState.zoom) points.push(point);
  }


  function sanitizeElement(element) {
    if (!element || !VALID_TYPES.has(element.type)) return null;
    const safe = {
      id: typeof element.id === "string" ? element.id : createId(),
      type: element.type,
      x: safeNumber(element.x, 0),
      y: safeNumber(element.y, 0),
      width: safeNumber(element.width, 0),
      height: safeNumber(element.height, 0),
      strokeColor: isHexColor(element.strokeColor) ? element.strokeColor : defaultAppState.strokeColor,
      backgroundColor: element.backgroundColor === "transparent" || isHexColor(element.backgroundColor) ? element.backgroundColor : "transparent",
      fillStyle: ["solid", "hachure"].includes(element.fillStyle) ? element.fillStyle : "solid",
      strokeWidth: [1, 2, 4, 8].includes(element.strokeWidth) ? element.strokeWidth : 2,
      strokeStyle: ["solid", "dashed", "dotted"].includes(element.strokeStyle) ? element.strokeStyle : "solid",
      opacity: Math.min(100, Math.max(0, safeNumber(element.opacity, 100))),
      roughness: safeNumber(element.roughness, 1),
      fontSize: Math.max(10, safeNumber(element.fontSize, 28)),
      fontFamily: ["hand", "sans", "serif", "mono"].includes(element.fontFamily) ? element.fontFamily : "hand",
      textAlign: ["left", "center", "right"].includes(element.textAlign) ? element.textAlign : "left",
    };
    if (element.type === "freedraw") {
      safe.points = Array.isArray(element.points)
        ? element.points.filter((point) => isFiniteNumber(point?.x) && isFiniteNumber(point?.y)).map((point) => ({ x: point.x, y: point.y, pressure: pressureForPoint(point) }))
        : [];
    }
    if (element.type === "text") {
      safe.text = typeof element.text === "string" ? element.text : "";
    }
    return safe;
  }

  function normalizeState(raw) {
    const source = raw?.state && typeof raw.state === "object" ? raw.state : raw;
    const base = createInitialState();
    if (!source || typeof source !== "object") return base;
    const appState = source.appState && typeof source.appState === "object" ? source.appState : {};
    const elements = Array.isArray(source.elements) ? source.elements.map(sanitizeElement).filter(Boolean) : [];
    const normalized = {
      type: "excalidraw-clone",
      version: 1,
      name: typeof source.name === "string" && source.name.trim() ? source.name.trim().slice(0, 80) : base.name,
      elements,
      appState: {
        ...defaultAppState,
        ...appState,
        tool: toolNames[appState.tool] ? appState.tool : "selection",
        zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, safeNumber(appState.zoom, 1))),
        viewX: isFiniteNumber(appState.viewX) ? appState.viewX : null,
        viewY: isFiniteNumber(appState.viewY) ? appState.viewY : null,
        strokeColor: isHexColor(appState.strokeColor) ? appState.strokeColor : defaultAppState.strokeColor,
        backgroundColor: appState.backgroundColor === "transparent" || isHexColor(appState.backgroundColor) ? appState.backgroundColor : "transparent",
        canvasBackgroundColor: isHexColor(appState.canvasBackgroundColor) ? appState.canvasBackgroundColor : defaultAppState.canvasBackgroundColor,
        canvasBackgroundAuto: appState.canvasBackgroundAuto !== false && (!isHexColor(appState.canvasBackgroundColor) || appState.canvasBackgroundColor === defaultAppState.canvasBackgroundColor),
        theme: THEME_MODES.includes(appState.theme) ? appState.theme : defaultAppState.theme,
        penSmoothing: PEN_SMOOTHING_MODES.includes(appState.penSmoothing) ? appState.penSmoothing : defaultAppState.penSmoothing,
        fillStyle: ["solid", "hachure"].includes(appState.fillStyle) ? appState.fillStyle : "solid",
        strokeWidth: [1, 2, 4, 8].includes(appState.strokeWidth) ? appState.strokeWidth : 2,
        strokeStyle: ["solid", "dashed", "dotted"].includes(appState.strokeStyle) ? appState.strokeStyle : "solid",
        opacity: Math.min(100, Math.max(0, safeNumber(appState.opacity, 100))),
        fontSize: Math.max(10, safeNumber(appState.fontSize, 28)),
        fontFamily: ["hand", "sans", "serif", "mono"].includes(appState.fontFamily) ? appState.fontFamily : "hand",
        textAlign: ["left", "center", "right"].includes(appState.textAlign) ? appState.textAlign : "left",
        selectedElementIds: {},
      },
    };
    return normalized;
  }

  function readStoredState() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeState(JSON.parse(raw)) : createInitialState();
    } catch {
      return createInitialState();
    }
  }
  function snapshotAppState() {
    const snapshot = {};
    for (const key of HISTORY_APP_STATE_KEYS) snapshot[key] = state.appState[key];
    return snapshot;
  }

  function createHistorySnapshot() {
    return {
      name: state.name,
      elements: clone(state.elements),
      appState: snapshotAppState(),
    };
  }

  function normalizeHistorySnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object" || !Array.isArray(snapshot.elements)) return null;
    const normalized = normalizeState({
      type: "excalidraw-clone",
      version: 1,
      name: snapshot.name,
      elements: snapshot.elements,
      appState: { ...defaultAppState, ...(snapshot.appState || {}) },
    });
    const appState = {};
    for (const key of HISTORY_APP_STATE_KEYS) appState[key] = normalized.appState[key];
    return { name: normalized.name, elements: normalized.elements, appState };
  }

  function normalizeHistoryList(value) {
    if (!Array.isArray(value)) return [];
    return value.slice(-MAX_HISTORY).map(normalizeHistorySnapshot).filter(Boolean);
  }

  function readStoredHistory() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return {
        history: normalizeHistoryList(parsed?.history),
        redoHistory: normalizeHistoryList(parsed?.redoHistory),
      };
    } catch {
      return { history: [], redoHistory: [] };
    }
  }

  function sanitizeProfileName(value) {
    return typeof value === "string" ? value.trim().slice(0, 60) : "";
  }

  function readStoredProfile() {
    try {
      const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return { name: sanitizeProfileName(parsed?.name) };
    } catch {
      return { name: "" };
    }
  }

  function profileInitials(name) {
    const words = sanitizeProfileName(name).split(/\s+/).filter(Boolean);
    if (!words.length) return "";
    if (words.length === 1) return Array.from(words[0]).slice(0, 2).join("").toUpperCase();
    const first = Array.from(words[0])[0];
    const last = Array.from(words[words.length - 1])[0];
    return (first + last).toUpperCase();
  }

  let profile = readStoredProfile();

  function updateProfilePreview() {
    const name = sanitizeProfileName(profileNameInput.value);
    const initials = profileInitials(name);
    profilePreviewInitials.textContent = initials;
    profilePreviewInitials.toggleAttribute("hidden", !initials);
    profilePreviewPlaceholder.toggleAttribute("hidden", Boolean(initials));
    profilePreviewName.textContent = name || "Guest";
  }

  function renderProfile() {
    const initials = profileInitials(profile.name);
    avatarInitials.textContent = initials;
    avatarInitials.toggleAttribute("hidden", !initials);
    avatarPlaceholder.toggleAttribute("hidden", Boolean(initials));
    profileButton.setAttribute("aria-label", "Account: " + (profile.name || "Guest"));
    profileButton.setAttribute("aria-expanded", String(!profilePopover.hidden));
    profileNameInput.value = profile.name;
    updateProfilePreview();
  }

  function saveProfile() {
    profile = { name: sanitizeProfileName(profileNameInput.value) };
    try {
      if (profile.name) window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      else window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      // Profile remains available for this session when storage is unavailable.
    }
    renderProfile();
    closePopovers();
    showToast(profile.name ? "Profile saved" : "Guest profile selected");
  }

  function resetProfile() {
    profile = { name: "" };
    try {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    } catch {
      // Profile remains reset for this session when storage is unavailable.
    }
    renderProfile();
    closePopovers();
    showToast("Guest profile selected");
  }
  let state = readStoredState();
  const storedHistory = readStoredHistory();
  let history = storedHistory.history;
  let redoHistory = storedHistory.redoHistory;
  let pointer = null;
  let spacePressed = false;
  let saveTimer = null;
  let toastTimer = null;
  let dialogRequest = null;
  let dialogRestoreFocus = null;
  let textEditor = null;
  let devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  let systemThemeQuery = null;
  let wasSmallViewport = false;

  function prefersDarkSystem() {
    return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function resolvedTheme() {
    return state.appState.theme === "system" ? (prefersDarkSystem() ? "dark" : "light") : state.appState.theme;
  }

  function updateThemeControls() {
    if (!themeButton || !themePopover) return;
    const mode = state.appState.theme;
    const resolved = resolvedTheme();
    themeButton.dataset.resolvedTheme = resolved;
    themeButton.setAttribute("aria-label", "Theme: " + THEME_LABELS[mode] + " (" + resolved + ")");
    themeButton.setAttribute("aria-expanded", String(!themePopover.hidden));
    themePopover.querySelectorAll("[data-theme-mode]").forEach((button) => {
      const active = button.dataset.themeMode === mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-checked", String(active));
    });
  }

  function applyTheme() {
    const resolved = resolvedTheme();
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    updateThemeControls();
    updateGrid();
  }

  function watchSystemTheme() {
    if (typeof window.matchMedia !== "function") return;
    systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (state.appState.theme === "system") applyTheme();
    };
    if (typeof systemThemeQuery.addEventListener === "function") systemThemeQuery.addEventListener("change", handleChange);
    else systemThemeQuery.addListener?.(handleChange);
  }

  function setTheme(mode) {
    if (!THEME_MODES.includes(mode)) return;
    if (state.appState.theme === mode) {
      closePopovers();
      return;
    }
    const before = createHistorySnapshot();
    state.appState.theme = mode;
    closePopovers();
    applyTheme();
    commit(before, THEME_LABELS[mode] + " theme selected");
    showToast(THEME_LABELS[mode] + " theme selected");
  }

  function getCanvasSize() {
    return { width: stage.clientWidth, height: stage.clientHeight };
  }

  function updateInspectorToggle() {
    if (!inspectorToggleButton) return;
    const isCollapsed = inspector.classList.contains("is-collapsed");
    inspectorToggleButton.setAttribute("aria-expanded", String(!isCollapsed));
    inspectorToggleButton.setAttribute("aria-label", isCollapsed ? "Open properties" : "Close properties");
  }

  function syncInspectorViewport() {
    const isSmallViewport = window.innerWidth <= 700;
    if (isSmallViewport !== wasSmallViewport) {
      inspector.classList.toggle("is-collapsed", isSmallViewport);
      wasSmallViewport = isSmallViewport;
    }
    updateInspectorToggle();
  }

  function resizeCanvas() {
    const { width, height } = getCanvasSize();
    devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * devicePixelRatio));
    canvas.height = Math.max(1, Math.floor(height * devicePixelRatio));
    if (!isFiniteNumber(state.appState.viewX)) state.appState.viewX = width / 2;
    if (!isFiniteNumber(state.appState.viewY)) state.appState.viewY = height / 2;
    draw();
    updateGrid();
    syncInspectorViewport();
  }

  function worldToScreen(point) {
    return {
      x: point.x * state.appState.zoom + state.appState.viewX,
      y: point.y * state.appState.zoom + state.appState.viewY,
    };
  }

  function screenToWorld(point) {
    return {
      x: (point.x - state.appState.viewX) / state.appState.zoom,
      y: (point.y - state.appState.viewY) / state.appState.zoom,
    };
  }

  function getLocalPoint(event) {
    const rect = stage.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function hideEraserCursor() {
    eraserCursor.hidden = true;
  }

  function updateEraserCursor(screenPoint) {
    const visible = state.appState.tool === "eraser" && (!pointer || pointer.kind !== "pan");
    eraserCursor.hidden = !visible;
    if (!visible) return;
    eraserCursor.style.left = screenPoint.x + "px";
    eraserCursor.style.top = screenPoint.y + "px";
  }

  function effectiveCanvasBackground() {
    return resolvedTheme() === "dark" && state.appState.canvasBackgroundAuto ? "#202124" : state.appState.canvasBackgroundColor;
  }
  function effectiveStrokeColor(element) {
    const color = element.strokeColor || defaultAppState.strokeColor;
    return resolvedTheme() === "dark" && color === defaultAppState.strokeColor ? "#e6e7ee" : color;
  }
  function updateGrid() {
    const scale = GRID_SIZE * state.appState.zoom;
    const x = ((state.appState.viewX % scale) + scale) % scale;
    const y = ((state.appState.viewY % scale) + scale) % scale;
    stage.style.backgroundColor = effectiveCanvasBackground();
    stage.style.backgroundSize = `${scale}px ${scale}px`;
    stage.style.backgroundPosition = `${x}px ${y}px`;
  }

  function fontStack(fontFamily) {
    switch (fontFamily) {
      case "sans":
        return UI_FONT;
      case "serif":
        return "Georgia, Cambria, serif";
      case "mono":
        return 'ui-monospace, SFMono-Regular, Menlo, monospace';
      default:
        return HAND_FONT;
    }
  }

  function dashForStyle(strokeStyle) {
    if (strokeStyle === "dashed") return [9, 7];
    if (strokeStyle === "dotted") return [2, 7];
    return [];
  }

  function getTextLines(text, maxWidth) {
    const paragraphs = String(text || "").split("\n");
    const lines = [];
    for (const paragraph of paragraphs) {
      if (!paragraph) {
        lines.push("");
        continue;
      }
      const words = paragraph.split(/\s+/);
      let line = "";
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (maxWidth && ctx.measureText(candidate).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      lines.push(line);
    }
    return lines.length ? lines : [""];
  }

  function getTextMetrics(element) {
    const fontSize = Math.max(10, element.fontSize || 28);
    ctx.save();
    ctx.font = `${fontSize}px ${fontStack(element.fontFamily)}`;
    const maxWidth = element.width > 0 ? element.width : 360;
    const lines = getTextLines(element.text, maxWidth);
    const measured = lines.reduce((longest, line) => Math.max(longest, ctx.measureText(line).width), 0);
    ctx.restore();
    return {
      lines,
      width: element.width > 0 ? element.width : Math.max(24, measured + 5),
      height: element.height > 0 ? element.height : Math.max(fontSize * 1.28, lines.length * fontSize * 1.28),
      lineHeight: fontSize * 1.28,
    };
  }

  function getBounds(element) {
    if (element.type === "freedraw") {
      const points = element.points || [];
      if (!points.length) return { x: element.x, y: element.y, width: 1, height: 1 };
      let minX = points[0].x;
      let minY = points[0].y;
      let maxX = points[0].x;
      let maxY = points[0].y;
      for (const point of points) {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      }
      return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
    }
    if (element.type === "text") {
      const metrics = getTextMetrics(element);
      return { x: element.x, y: element.y, width: Math.max(1, metrics.width), height: Math.max(1, metrics.height) };
    }
    if (element.type === "line" || element.type === "arrow") {
      const endX = element.x + element.width;
      const endY = element.y + element.height;
      return {
        x: Math.min(element.x, endX),
        y: Math.min(element.y, endY),
        width: Math.max(1, Math.abs(element.width)),
        height: Math.max(1, Math.abs(element.height)),
      };
    }
    return {
      x: Math.min(element.x, element.x + element.width),
      y: Math.min(element.y, element.y + element.height),
      width: Math.max(1, Math.abs(element.width)),
      height: Math.max(1, Math.abs(element.height)),
    };
  }

  function smoothFreehandPoints(points, mode) {
    const clean = Array.isArray(points) ? points.map((point) => ({ x: point.x, y: point.y, pressure: pressureForPoint(point) })) : [];
    if (mode === "off" || clean.length < 3) return clean;
    let smoothed = clean;
    const passes = mode === "strong" ? 2 : 1;
    const centerWeight = mode === "strong" ? 3 : 2;
    const totalWeight = centerWeight + 2;
    for (let pass = 0; pass < passes; pass += 1) {
      const next = [smoothed[0]];
      for (let index = 1; index < smoothed.length - 1; index += 1) {
        const previous = smoothed[index - 1];
        const current = smoothed[index];
        const following = smoothed[index + 1];
        next.push({
          x: (previous.x + current.x * centerWeight + following.x) / totalWeight,
          y: (previous.y + current.y * centerWeight + following.y) / totalWeight,
          pressure: (previous.pressure + current.pressure * centerWeight + following.pressure) / totalWeight,
        });
      }
      next.push(smoothed[smoothed.length - 1]);
      smoothed = next;
    }
    return smoothed;
  }

  function selectionBounds(elements) {
    if (!elements.length) return null;
    const first = getBounds(elements[0]);
    let minX = first.x;
    let minY = first.y;
    let maxX = first.x + first.width;
    let maxY = first.y + first.height;
    for (const element of elements.slice(1)) {
      const bounds = getBounds(element);
      minX = Math.min(minX, bounds.x);
      minY = Math.min(minY, bounds.y);
      maxX = Math.max(maxX, bounds.x + bounds.width);
      maxY = Math.max(maxY, bounds.y + bounds.height);
    }
    return { x: minX, y: minY, width: Math.max(1, maxX - minX), height: Math.max(1, maxY - minY) };
  }

  function buildShapePath(context, element) {
    const bounds = getBounds(element);
    if (element.type === "rectangle") {
      context.rect(bounds.x, bounds.y, bounds.width, bounds.height);
      return;
    }
    if (element.type === "ellipse") {
      context.ellipse(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
        Math.max(0.5, bounds.width / 2),
        Math.max(0.5, bounds.height / 2),
        0,
        0,
        Math.PI * 2,
      );
      return;
    }
    context.moveTo(bounds.x + bounds.width / 2, bounds.y);
    context.lineTo(bounds.x + bounds.width, bounds.y + bounds.height / 2);
    context.lineTo(bounds.x + bounds.width / 2, bounds.y + bounds.height);
    context.lineTo(bounds.x, bounds.y + bounds.height / 2);
    context.closePath();
  }

  function drawHachure(context, element, bounds) {
    context.save();
    context.clip();
    context.strokeStyle = element.backgroundColor;
    context.globalAlpha = Math.min(1, (element.opacity ?? 100) / 100 + 0.04);
    context.lineWidth = Math.max(0.8, element.strokeWidth * 0.55);
    context.setLineDash([]);
    const spacing = Math.max(7, 13 - element.strokeWidth);
    for (let start = bounds.x - bounds.height; start < bounds.x + bounds.width + bounds.height; start += spacing) {
      context.beginPath();
      context.moveTo(start, bounds.y + bounds.height);
      context.lineTo(start + bounds.height, bounds.y);
      context.stroke();
    }
    context.restore();
  }

  function traceFreehandPath(context, points) {
    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1];
      const current = points[index];
      const middleX = (previous.x + current.x) / 2;
      const middleY = (previous.y + current.y) / 2;
      context.quadraticCurveTo(previous.x, previous.y, middleX, middleY);
    }
    const last = points[points.length - 1];
    context.lineTo(last.x, last.y);
  }

  function fillFreehandSegment(context, start, end, startRadius, endRadius) {
    let directionX = end.x - start.x;
    let directionY = end.y - start.y;
    const directionLength = Math.hypot(directionX, directionY);
    if (directionLength <= 0.001) return;
    directionX /= directionLength;
    directionY /= directionLength;
    const normalX = -directionY;
    const normalY = directionX;
    context.beginPath();
    context.moveTo(start.x + normalX * startRadius, start.y + normalY * startRadius);
    context.lineTo(end.x + normalX * endRadius, end.y + normalY * endRadius);
    context.lineTo(end.x - normalX * endRadius, end.y - normalY * endRadius);
    context.lineTo(start.x - normalX * startRadius, start.y - normalY * startRadius);
    context.closePath();
    context.fill();
  }

  function freehandTaper(index, lastIndex) {
    const distanceToEdge = Math.min(index, lastIndex - index);
    const progress = Math.min(1, distanceToEdge / 2);
    const eased = progress * progress * (3 - 2 * progress);
    return 0.68 + eased * 0.32;
  }

  function drawFreehandStroke(context, element) {
    const points = element.points || [];
    if (points.length < 2) return;
    if (element.strokeStyle !== "solid") {
      traceFreehandPath(context, points);
      context.stroke();
      return;
    }

    const radii = [];
    const baseWidth = Math.max(0.75, element.strokeWidth || 2);
    for (let index = 0; index < points.length; index += 1) {
      const point = points[index];
      const edgeTaper = freehandTaper(index, points.length - 1);
      const pressureScale = 0.74 + pressureForPoint(point) * 0.52;
      radii.push(Math.max(0.42, baseWidth * 0.5 * edgeTaper * pressureScale));
    }

    context.save();
    context.globalAlpha *= 0.08;
    context.lineWidth = Math.max(0.8, baseWidth * 1.25);
    traceFreehandPath(context, points);
    context.stroke();
    context.restore();

    context.fillStyle = context.strokeStyle;
    for (let index = 1; index < points.length; index += 1) {
      fillFreehandSegment(context, points[index - 1], points[index], radii[index - 1], radii[index]);
    }
    context.beginPath();
    for (let index = 0; index < points.length; index += 1) {
      context.moveTo(points[index].x + radii[index], points[index].y);
      context.arc(points[index].x, points[index].y, radii[index], 0, Math.PI * 2);
    }
    context.fill();
  }

  function drawElement(context, element) {
    const alpha = Math.min(1, Math.max(0, (element.opacity ?? 100) / 100));
    context.save();
    context.globalAlpha = alpha;
    context.strokeStyle = effectiveStrokeColor(element);
    context.fillStyle = element.backgroundColor || "transparent";
    context.lineWidth = Math.max(0.75, element.strokeWidth || 2);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.setLineDash(dashForStyle(element.strokeStyle));

    if (element.type === "text") {
      const metrics = getTextMetrics(element);
      context.font = `${element.fontSize || 28}px ${fontStack(element.fontFamily)}`;
      context.fillStyle = effectiveStrokeColor(element);
      context.textBaseline = "top";
      context.textAlign = element.textAlign || "left";
      const anchor = element.textAlign === "center" ? element.x + metrics.width / 2 : element.textAlign === "right" ? element.x + metrics.width : element.x;
      metrics.lines.forEach((line, index) => context.fillText(line, anchor, element.y + index * metrics.lineHeight));
      context.restore();
      return;
    }

    if (element.type === "freedraw") {
      drawFreehandStroke(context, element);
      context.restore();
      return;
    }

    if (element.type === "line" || element.type === "arrow") {
      const startX = element.x;
      const startY = element.y;
      const endX = element.x + element.width;
      const endY = element.y + element.height;
      context.beginPath();
      context.moveTo(startX, startY);
      context.lineTo(endX, endY);
      context.stroke();
      if (element.type === "arrow") {
        const angle = Math.atan2(endY - startY, endX - startX);
        const headLength = Math.max(10, 4 + element.strokeWidth * 3.1);
        context.setLineDash([]);
        context.beginPath();
        context.moveTo(endX, endY);
        context.lineTo(endX - headLength * Math.cos(angle - Math.PI / 7), endY - headLength * Math.sin(angle - Math.PI / 7));
        context.moveTo(endX, endY);
        context.lineTo(endX - headLength * Math.cos(angle + Math.PI / 7), endY - headLength * Math.sin(angle + Math.PI / 7));
        context.stroke();
      }
      context.restore();
      return;
    }

    const bounds = getBounds(element);
    context.beginPath();
    buildShapePath(context, element);
    if (element.backgroundColor && element.backgroundColor !== "transparent") {
      if (element.fillStyle === "hachure") {
        drawHachure(context, element, bounds);
      } else {
        context.fillStyle = element.backgroundColor;
        context.fill();
      }
    }
    context.stroke();
    context.restore();
  }

  function drawSelectionOverlay() {
    const selected = getSelectedElements();
    const bounds = selectionBounds(selected);
    if (!bounds) return;
    const topLeft = worldToScreen({ x: bounds.x, y: bounds.y });
    const bottomRight = worldToScreen({ x: bounds.x + bounds.width, y: bounds.y + bounds.height });
    const x = topLeft.x;
    const y = topLeft.y;
    const width = Math.max(4, bottomRight.x - topLeft.x);
    const height = Math.max(4, bottomRight.y - topLeft.y);
    ctx.save();
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.strokeStyle = "#6965db";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(x - 4, y - 4, width + 8, height + 8);
    ctx.setLineDash([]);
    if (selected.length === 1) {
      const handles = getHandlePoints(bounds);
      for (const handle of handles) {
        ctx.beginPath();
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#6965db";
        ctx.lineWidth = 1.2;
        ctx.arc(handle.x, handle.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  function getHandlePoints(bounds) {
    const topLeft = worldToScreen({ x: bounds.x, y: bounds.y });
    const bottomRight = worldToScreen({ x: bounds.x + bounds.width, y: bounds.y + bounds.height });
    const centerX = (topLeft.x + bottomRight.x) / 2;
    const centerY = (topLeft.y + bottomRight.y) / 2;
    return [
      { name: "nw", x: topLeft.x, y: topLeft.y },
      { name: "n", x: centerX, y: topLeft.y },
      { name: "ne", x: bottomRight.x, y: topLeft.y },
      { name: "e", x: bottomRight.x, y: centerY },
      { name: "se", x: bottomRight.x, y: bottomRight.y },
      { name: "s", x: centerX, y: bottomRight.y },
      { name: "sw", x: topLeft.x, y: bottomRight.y },
      { name: "w", x: topLeft.x, y: centerY },
    ];
  }

  function drawMarquee() {
    if (!pointer || pointer.kind !== "marquee") return;
    const start = worldToScreen(pointer.startWorld);
    const end = worldToScreen(pointer.currentWorld);
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    ctx.save();
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.fillStyle = "rgba(105, 101, 219, 0.08)";
    ctx.strokeStyle = "rgba(105, 101, 219, 0.75)";
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 4]);
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
  }

  function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.save();
    ctx.translate(state.appState.viewX || 0, state.appState.viewY || 0);
    ctx.scale(state.appState.zoom, state.appState.zoom);
    for (const element of state.elements) drawElement(ctx, element);
    ctx.restore();
    drawSelectionOverlay();
    drawMarquee();
  }

  function getSelectedIds() {
    return Object.keys(state.appState.selectedElementIds || {}).filter((id) => state.appState.selectedElementIds[id]);
  }

  function getSelectedElements() {
    const ids = new Set(getSelectedIds());
    return state.elements.filter((element) => ids.has(element.id));
  }

  function setSelection(elementsOrIds, shouldRender = true) {
    const ids = Array.isArray(elementsOrIds) ? elementsOrIds.map((item) => (typeof item === "string" ? item : item.id)) : [];
    const known = new Set(state.elements.map((element) => element.id));
    state.appState.selectedElementIds = Object.fromEntries(ids.filter((id) => known.has(id)).map((id) => [id, true]));
    if (shouldRender) renderAll({ save: false });
  }

  function hitTest(point, extraTolerance = 0) {
    for (let index = state.elements.length - 1; index >= 0; index -= 1) {
      if (elementContainsPoint(state.elements[index], point, extraTolerance)) return state.elements[index];
    }
    return null;
  }

  function distanceToSegment(point, start, end) {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const lengthSquared = dx * dx + dy * dy;
    if (!lengthSquared) return Math.hypot(point.x - start.x, point.y - start.y);
    const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
    return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
  }

  function pointInDiamond(point, bounds) {
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;
    return Math.abs(point.x - centerX) / (bounds.width / 2) + Math.abs(point.y - centerY) / (bounds.height / 2) <= 1;
  }

  function elementContainsPoint(element, point, extraTolerance = 0) {
    const tolerance = Math.max(5 / state.appState.zoom, element.strokeWidth || 2) + extraTolerance;
    const bounds = getBounds(element);
    if (element.type === "text") {
      return point.x >= bounds.x - tolerance && point.x <= bounds.x + bounds.width + tolerance && point.y >= bounds.y - tolerance && point.y <= bounds.y + bounds.height + tolerance;
    }
    if (element.type === "line" || element.type === "arrow") {
      return distanceToSegment(point, { x: element.x, y: element.y }, { x: element.x + element.width, y: element.y + element.height }) <= tolerance + 5;
    }
    if (element.type === "freedraw") {
      const points = element.points || [];
      return points.some((current, index) => index > 0 && distanceToSegment(point, points[index - 1], current) <= tolerance + 5);
    }
    if (element.type === "diamond") {
      return pointInDiamond(point, bounds) || distanceToSegment(point, { x: bounds.x + bounds.width / 2, y: bounds.y }, { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }) <= tolerance;
    }
    if (element.type === "ellipse") {
      const normalizedX = (point.x - (bounds.x + bounds.width / 2)) / Math.max(1, bounds.width / 2);
      const normalizedY = (point.y - (bounds.y + bounds.height / 2)) / Math.max(1, bounds.height / 2);
      return normalizedX * normalizedX + normalizedY * normalizedY <= 1 + tolerance / Math.max(1, bounds.width / 2);
    }
    return point.x >= bounds.x - tolerance && point.x <= bounds.x + bounds.width + tolerance && point.y >= bounds.y - tolerance && point.y <= bounds.y + bounds.height + tolerance;
  }

  function getHandleAtPoint(screenPoint) {
    const selected = getSelectedElements();
    if (selected.length !== 1) return null;
    const bounds = getBounds(selected[0]);
    for (const handle of getHandlePoints(bounds)) {
      if (Math.hypot(handle.x - screenPoint.x, handle.y - screenPoint.y) <= 10) return handle.name;
    }
    return null;
  }

  function intersectsBounds(first, second) {
    return first.x <= second.x + second.width && first.x + first.width >= second.x && first.y <= second.y + second.height && first.y + first.height >= second.y;
  }

  function getConstrainedPoint(start, current, type, shouldConstrain) {
    if (!shouldConstrain) return current;
    const dx = current.x - start.x;
    const dy = current.y - start.y;
    if (["rectangle", "diamond", "ellipse"].includes(type)) {
      const size = Math.max(Math.abs(dx), Math.abs(dy));
      return { x: start.x + Math.sign(dx || 1) * size, y: start.y + Math.sign(dy || 1) * size };
    }
    if (type === "line" || type === "arrow") {
      const distance = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
      return { x: start.x + Math.cos(snapped) * distance, y: start.y + Math.sin(snapped) * distance };
    }
    return current;
  }

  function activeStyle() {
    const selected = getSelectedElements();
    const source = selected[0] || state.appState;
    return {
      strokeColor: source.strokeColor || state.appState.strokeColor,
      backgroundColor: source.backgroundColor ?? state.appState.backgroundColor,
      fillStyle: source.fillStyle || state.appState.fillStyle,
      strokeWidth: source.strokeWidth || state.appState.strokeWidth,
      strokeStyle: source.strokeStyle || state.appState.strokeStyle,
      opacity: source.opacity ?? state.appState.opacity,
      fontSize: source.fontSize || state.appState.fontSize,
      fontFamily: source.fontFamily || state.appState.fontFamily,
      textAlign: source.textAlign || state.appState.textAlign,
    };
  }

  function createElement(type, start, end = start) {
    const style = activeStyle();
    return {
      id: createId(),
      type,
      x: start.x,
      y: start.y,
      width: end.x - start.x,
      height: end.y - start.y,
      strokeColor: style.strokeColor,
      backgroundColor: style.backgroundColor,
      fillStyle: style.fillStyle,
      strokeWidth: style.strokeWidth,
      strokeStyle: style.strokeStyle,
      opacity: style.opacity,
      roughness: 1,
      fontSize: style.fontSize,
      fontFamily: style.fontFamily,
      textAlign: style.textAlign,
    };
  }

  function isDegenerate(element) {
    if (element.type === "freedraw") return !element.points || element.points.length < 2;
    if (element.type === "text") return !element.text?.trim();
    return Math.hypot(element.width, element.height) < 4;
  }

  function translateElement(element, dx, dy) {
    element.x += dx;
    element.y += dy;
    if (element.type === "freedraw") {
      element.points = (element.points || []).map((point) => ({ x: point.x + dx, y: point.y + dy, pressure: pressureForPoint(point) }));
    }
    return element;
  }

  function resizeElement(element, original, handle, current) {
    const originalBounds = getBounds(original);
    let left = originalBounds.x;
    let right = originalBounds.x + originalBounds.width;
    let top = originalBounds.y;
    let bottom = originalBounds.y + originalBounds.height;
    const minimum = 8;
    if (handle.includes("w")) left = Math.min(current.x, right - minimum);
    if (handle.includes("e")) right = Math.max(current.x, left + minimum);
    if (handle.includes("n")) top = Math.min(current.y, bottom - minimum);
    if (handle.includes("s")) bottom = Math.max(current.y, top + minimum);
    const next = { x: left, y: top, width: right - left, height: bottom - top };

    if (element.type === "freedraw") {
      const scaleX = originalBounds.width > 1 ? next.width / originalBounds.width : 1;
      const scaleY = originalBounds.height > 1 ? next.height / originalBounds.height : 1;
      element.points = (original.points || []).map((point) => ({
        x: next.x + (point.x - originalBounds.x) * scaleX,
        y: next.y + (point.y - originalBounds.y) * scaleY,
        pressure: pressureForPoint(point),
      }));
      element.x = next.x;
      element.y = next.y;
      element.width = next.width;
      element.height = next.height;
      return element;
    }
    element.x = next.x;
    element.y = next.y;
    element.width = next.width;
    element.height = next.height;
  }

  function applyMove(pointerState, current) {
    const dx = current.x - pointerState.startWorld.x;
    const dy = current.y - pointerState.startWorld.y;
    const originals = new Map(pointerState.originals.map((element) => [element.id, element]));
    state.elements = state.elements.map((element) => {
      const original = originals.get(element.id);
      return original ? translateElement(clone(original), dx, dy) : element;
    });
  }

  function applyResize(pointerState, current) {
    const target = state.elements.find((element) => element.id === pointerState.id);
    if (!target) return;
    resizeElement(target, pointerState.original, pointerState.handle, current);
  }

  function beginTextEditor(worldPoint, screenPoint) {
    finishTextEditor(false);
    const style = activeStyle();
    const editor = document.createElement("textarea");
    editor.className = "text-editor";
    editor.placeholder = "Type something…";
    editor.rows = 1;
    editor.spellcheck = false;
    editor.style.left = `${screenPoint.x}px`;
    editor.style.top = `${screenPoint.y}px`;
    editor.style.width = `${Math.max(190, 245 * state.appState.zoom)}px`;
    editor.style.fontSize = `${Math.max(13, style.fontSize * state.appState.zoom)}px`;
    editor.style.fontFamily = fontStack(style.fontFamily);
    editor.style.textAlign = style.textAlign;
    textEditorLayer.appendChild(editor);
    textEditor = { editor, worldPoint, style };
    editor.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        finishTextEditor(false);
      } else if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        finishTextEditor(true);
      }
    });
    editor.addEventListener("blur", () => finishTextEditor(true));
    window.requestAnimationFrame(() => editor.focus());
  }

  function finishTextEditor(shouldCommit) {
    if (!textEditor) return;
    const current = textEditor;
    textEditor = null;
    const text = current.editor.value;
    current.editor.remove();
    if (!shouldCommit || !text.trim()) return;
    const before = createHistorySnapshot();
    const temporary = {
      ...createElement("text", current.worldPoint),
      text,
      width: Math.max(140, Math.min(420, measureTextWidth(text, current.style) + 10)),
      height: 0,
    };
    const metrics = getTextMetrics(temporary);
    temporary.height = metrics.height;
    state.elements.push(temporary);
    setSelection([], false);
    commit(before, "Added text");
  }

  function measureTextWidth(text, style) {
    ctx.save();
    ctx.font = `${style.fontSize}px ${fontStack(style.fontFamily)}`;
    const longest = String(text).split("\n").reduce((width, line) => Math.max(width, ctx.measureText(line).width), 0);
    ctx.restore();
    return longest;
  }

  function startPointerInteraction(event) {
    if (textEditor) return;
    const screen = getLocalPoint(event);
    const world = screenToWorld(screen);
    coordinateLabel.textContent = `${Math.round(world.x)}, ${Math.round(world.y)}`;
    updateEraserCursor(screen);
    const shouldPan = event.button === 1 || event.button === 2 || spacePressed;
    if (shouldPan) {
      hideEraserCursor();
      event.preventDefault();
      pointer = {
        kind: "pan",
        pointerId: event.pointerId,
        startScreen: screen,
        viewX: state.appState.viewX,
        viewY: state.appState.viewY,
        moved: false,
      };
      stage.dataset.panning = "true";
      canvas.setPointerCapture?.(event.pointerId);
      return;
    }
    if (event.button !== 0) return;
    canvas.focus({ preventScroll: true });
    const tool = state.appState.tool;

    if (tool === "text") {
      beginTextEditor(world, screen);
      return;
    }

    if (tool === "eraser") {
      const hit = hitTest(world, ERASER_RADIUS / state.appState.zoom);
      if (hit) {
        const before = createHistorySnapshot();
        state.elements = state.elements.filter((element) => element.id !== hit.id);
        setSelection([], false);
        commit(before, "Erased element");
        showToast("Element erased");
      }
      return;
    }

    if (tool === "selection") {
      const handle = getHandleAtPoint(screen);
      const selected = getSelectedElements();
      if (handle && selected.length === 1) {
        pointer = {
          kind: "resize",
          pointerId: event.pointerId,
          startWorld: world,
          id: selected[0].id,
          handle,
          original: clone(selected[0]),
          before: createHistorySnapshot(),
          moved: false,
        };
        canvas.setPointerCapture?.(event.pointerId);
        return;
      }
      const hit = hitTest(world);
      if (hit) {
        if (event.shiftKey) {
          const selectedIds = new Set(getSelectedIds());
          if (selectedIds.has(hit.id)) selectedIds.delete(hit.id);
          else selectedIds.add(hit.id);
          setSelection([...selectedIds]);
          return;
        }
        if (!getSelectedIds().includes(hit.id)) setSelection([hit.id], false);
        pointer = {
          kind: "move",
          pointerId: event.pointerId,
          startWorld: world,
          originals: getSelectedElements().map(clone),
          before: createHistorySnapshot(),
          moved: false,
        };
        canvas.setPointerCapture?.(event.pointerId);
        return;
      }
      const previousSelection = getSelectedIds();
      setSelection([], false);
      pointer = {
        kind: "marquee",
        pointerId: event.pointerId,
        selection: previousSelection,
        startWorld: world,
        currentWorld: world,
        moved: false,
      };
      canvas.setPointerCapture?.(event.pointerId);
      draw();
      return;
    }

    const drawableTypes = new Set(["draw", "rectangle", "diamond", "ellipse", "arrow", "line"]);
    if (drawableTypes.has(tool)) {
      const before = createHistorySnapshot();
      const elementType = tool === "draw" ? "freedraw" : tool;
      const element = createElement(elementType, world, world);
      if (elementType === "freedraw") {
        const initialPoint = { x: world.x, y: world.y, pressure: pointerPressure(event) };
        element.points = [initialPoint];
      }
      state.elements.push(element);
      setSelection([], false);
      pointer = {
        kind: "create",
        pointerId: event.pointerId,
        id: element.id,
        startWorld: world,
        before,
        moved: false,
        penFilter: elementType === "freedraw" ? createPenFilter(element.points[0], pointerTime(event)) : null,
        lastRawPoint: elementType === "freedraw" ? element.points[0] : null,
      };
      canvas.setPointerCapture?.(event.pointerId);
      draw();
    }
  }

  function movePointerInteraction(event) {
    const screen = getLocalPoint(event);
    const world = screenToWorld(screen);
    coordinateLabel.textContent = `${Math.round(world.x)}, ${Math.round(world.y)}`;
    updateEraserCursor(screen);
    if (!pointer) return;
    if (pointer.pointerId !== event.pointerId) return;
    if (pointer.kind === "pan") {
      const dx = screen.x - pointer.startScreen.x;
      const dy = screen.y - pointer.startScreen.y;
      state.appState.viewX = pointer.viewX + dx;
      state.appState.viewY = pointer.viewY + dy;
      pointer.moved = pointer.moved || Math.abs(dx) + Math.abs(dy) > 1;
      updateGrid();
      draw();
      return;
    }
    const distance = Math.hypot(screen.x - worldToScreen(pointer.startWorld || world).x, screen.y - worldToScreen(pointer.startWorld || world).y);
    pointer.moved = pointer.moved || distance > 2;

    if (pointer.kind === "marquee") {
      pointer.currentWorld = world;
      draw();
      return;
    }
    if (pointer.kind === "move") {
      applyMove(pointer, world);
      draw();
      return;
    }
    if (pointer.kind === "resize") {
      applyResize(pointer, world);
      draw();
      return;
    }
    if (pointer.kind === "create") {
      const element = state.elements.find((item) => item.id === pointer.id);
      if (!element) return;
      const current = getConstrainedPoint(pointer.startWorld, world, element.type, event.shiftKey);
      if (element.type === "freedraw") {
        const coalescedEvents = typeof event.getCoalescedEvents === "function" ? event.getCoalescedEvents() : [];
        for (let index = 0; index < coalescedEvents.length; index += 1) {
          appendFilteredPenPoint(element, pointer, coalescedEvents[index], state.appState.penSmoothing);
        }
        appendFilteredPenPoint(element, pointer, event, state.appState.penSmoothing);
        element.x = pointer.startWorld.x;
        element.y = pointer.startWorld.y;
        element.width = world.x - pointer.startWorld.x;
        element.height = world.y - pointer.startWorld.y;
      } else {
        element.width = current.x - pointer.startWorld.x;
        element.height = current.y - pointer.startWorld.y;
      }
      draw();
    }
  }

  function finishPointerInteraction(event) {
    if (!pointer || pointer.pointerId !== event.pointerId) return;
    const finished = pointer;
    pointer = null;
    canvas.releasePointerCapture?.(event.pointerId);
    stage.dataset.panning = "false";

    if (finished.kind === "pan") {
      updateEraserCursor(getLocalPoint(event));
      if (finished.moved) scheduleSave();
      return;
    }
    if (finished.kind === "marquee") {
      if (finished.moved) {
        const first = finished.startWorld;
        const current = finished.currentWorld || first;
        const marquee = {
          x: Math.min(first.x, current.x),
          y: Math.min(first.y, current.y),
          width: Math.abs(current.x - first.x),
          height: Math.abs(current.y - first.y),
        };
        const selected = state.elements.filter((element) => intersectsBounds(getBounds(element), marquee));
        setSelection(selected);
      } else {
        renderAll({ save: false });
      }
      return;
    }
    if (finished.kind === "create") {
      const created = state.elements.find((element) => element.id === finished.id);
      if (!created || isDegenerate(created)) {
        state.elements = state.elements.filter((element) => element.id !== finished.id);
        setSelection([], false);
        renderAll({ save: false });
      } else {
        if (created.type === "freedraw") {
          const endpointScreen = getLocalPoint(event);
          const endpointWorld = screenToWorld(endpointScreen);
          const endpoint = { x: endpointWorld.x, y: endpointWorld.y, pressure: pointerPressure(event) };
          const lastPoint = created.points?.[created.points.length - 1];
          if (!lastPoint || Math.hypot(lastPoint.x - endpoint.x, lastPoint.y - endpoint.y) > 0.5 / state.appState.zoom) created.points.push(endpoint);
          created.points = smoothFreehandPoints(created.points, state.appState.penSmoothing);
          const bounds = getBounds(created);
          created.x = bounds.x;
          created.y = bounds.y;
          created.width = bounds.width;
          created.height = bounds.height;
        }
        commit(finished.before, `Created ${toolNames[state.appState.tool].toLowerCase()}`);
      }
      return;
    }
    if (finished.kind === "move" || finished.kind === "resize") {
      if (finished.moved) commit(finished.before, finished.kind === "move" ? "Moved selection" : "Resized selection");
      else renderAll({ save: false });
    }
  }

  function cancelPointerInteraction() {
    if (!pointer) return;
    const canceled = pointer;
    if (canceled.kind === "pan") {
      state.appState.viewX = canceled.viewX;
      state.appState.viewY = canceled.viewY;
    } else if (canceled.kind === "create" || canceled.kind === "move" || canceled.kind === "resize") {
      restoreHistorySnapshot(canceled.before);
    }
    if (canceled.pointerId != null && canvas.hasPointerCapture?.(canceled.pointerId)) {
      canvas.releasePointerCapture?.(canceled.pointerId);
    }
    pointer = null;
    if (canceled.kind === "marquee") setSelection(canceled.selection, false);
    stage.dataset.panning = "false";
    draw();
    renderAll({ save: false });
  }

  function restoreHistorySnapshot(snapshot) {
    state.name = snapshot.name;
    state.elements = clone(snapshot.elements);
    Object.assign(state.appState, snapshot.appState);
    state.appState.selectedElementIds = {};
    applyTheme();
  }

  function commit(before, message) {
    const after = createHistorySnapshot();
    if (JSON.stringify(before) === JSON.stringify(after)) {
      renderAll({ save: false });
      return false;
    }
    history.push(before);
    if (history.length > MAX_HISTORY) history.shift();
    redoHistory = [];
    renderAll();
    if (message) updateSaveLabel(message);
    return true;
  }

  function renderAll({ save = true, inspector: shouldRenderInspector = true } = {}) {
    draw();
    updateGrid();
    updateToolbar();
    updateWelcomeTip();
    updateHistoryButtons();
    if (shouldRenderInspector) renderInspector();
    if (save) scheduleSave();
  }

  function updateSaveLabel(message) {
    if (message) {
      saveStatus.textContent = message;
      window.setTimeout(() => {
        if (saveStatus.textContent === message) saveStatus.textContent = "Saved locally";
      }, 1600);
    }
  }

  function scheduleSave() {
    saveStatus.textContent = "Saving…";
    saveDot.classList.add("saving");
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, history, redoHistory }));
        saveStatus.textContent = "Saved locally";
      } catch {
        saveStatus.textContent = "Local save unavailable";
      }
      saveDot.classList.remove("saving");
    }, 280);
  }

  function updateToolbar() {
    document.querySelectorAll(".tool-button[data-tool]").forEach((button) => {
      button.classList.toggle("active", button.dataset.tool === state.appState.tool);
    });
    stage.dataset.tool = state.appState.tool;
    pointerMode.textContent = toolNames[state.appState.tool] || "Select";
    zoomValue.textContent = `${Math.round(state.appState.zoom * 100)}%`;
    document.querySelector("#scene-title").textContent = state.name;
    document.title = `draw — ${state.name}`;
  }

  function updateWelcomeTip() {
    welcomeTip.classList.toggle("is-hidden", state.elements.length > 0);
  }

  function updateHistoryButtons() {
    document.querySelector("#undo-button").disabled = history.length === 0;
    document.querySelector("#redo-button").disabled = redoHistory.length === 0;
    const hasSelection = getSelectedElements().length > 0;
    document.querySelector("#clear-selection-button").disabled = !hasSelection;
  }

  function toggleInspector() {
    inspector.classList.toggle("is-collapsed");
    updateInspectorToggle();
  }

  function changeTool(tool) {
    if (!toolNames[tool]) return;
    finishTextEditor(false);
    cancelPointerInteraction();
    hideEraserCursor();
    state.appState.tool = tool;
    renderAll({ save: false });
  }

  function undo() {
    finishTextEditor(true);
    if (!history.length) {
      showToast("Nothing to undo");
      return;
    }
    const current = createHistorySnapshot();
    const previous = history.pop();
    redoHistory.push(current);
    if (redoHistory.length > MAX_HISTORY) redoHistory.shift();
    restoreHistorySnapshot(previous);
    renderAll();
    showToast("Undid last action");
  }

  function redo() {
    finishTextEditor(true);
    if (!redoHistory.length) {
      showToast("Nothing to redo");
      return;
    }
    const current = createHistorySnapshot();
    const next = redoHistory.pop();
    history.push(current);
    if (history.length > MAX_HISTORY) history.shift();
    restoreHistorySnapshot(next);
    renderAll();
    showToast("Redid action");
  }

  function deleteSelected() {
    finishTextEditor(true);
    const selected = getSelectedIds();
    if (!selected.length) return;
    const before = createHistorySnapshot();
    const ids = new Set(selected);
    state.elements = state.elements.filter((element) => !ids.has(element.id));
    setSelection([], false);
    commit(before, "Deleted selection");
  }

  function duplicateSelected() {
    const selected = getSelectedElements();
    if (!selected.length) return;
    const before = createHistorySnapshot();
    const copies = selected.map((element) => {
      const copy = clone(element);
      copy.id = createId();
      translateElement(copy, 18, 18);
      return copy;
    });
    state.elements.push(...copies);
    setSelection(copies);
    commit(before, "Duplicated selection");
  }

  function selectAll() {
    setSelection(state.elements);
    showToast(`${state.elements.length} element${state.elements.length === 1 ? "" : "s"} selected`);
  }

  function mutateStyle(style, value) {
    if (style === "strokeColor" && !isHexColor(value)) return;
    if (style === "backgroundColor" && value !== "transparent" && !isHexColor(value)) return;
    const selected = getSelectedElements();
    if (!selected.length) {
      const before = createHistorySnapshot();
      state.appState[style] = value;
      commit(before, "Updated style");
      return;
    }
    const before = createHistorySnapshot();
    const ids = new Set(selected.map((element) => element.id));
    state.elements = state.elements.map((element) => ids.has(element.id) ? { ...element, [style]: value } : element);
    commit(before, "Updated style");
  }
  function setCanvasBackground(value) {
    if (!isHexColor(value)) return;
    if (value === state.appState.canvasBackgroundColor && state.appState.canvasBackgroundAuto === false) return;
    const before = createHistorySnapshot();
    state.appState.canvasBackgroundColor = value;
    state.appState.canvasBackgroundAuto = false;
    commit(before, "Updated canvas background");
  }
  function setPenSmoothing(mode) {
    if (!PEN_SMOOTHING_MODES.includes(mode) || state.appState.penSmoothing === mode) return;
    const before = createHistorySnapshot();
    state.appState.penSmoothing = mode;
    commit(before, "Updated pen assistance");
  }

  function zoomAt(screenPoint, nextZoom) {
    const oldZoom = state.appState.zoom;
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    if (clamped === oldZoom) return;
    const worldPoint = screenToWorld(screenPoint);
    state.appState.zoom = clamped;
    state.appState.viewX = screenPoint.x - worldPoint.x * clamped;
    state.appState.viewY = screenPoint.y - worldPoint.y * clamped;
    renderAll();
  }

  function zoomBy(factor) {
    const size = getCanvasSize();
    zoomAt({ x: size.width / 2, y: size.height / 2 }, state.appState.zoom * factor);
  }

  function fitToContent() {
    if (!state.elements.length) {
      state.appState.zoom = 1;
      const size = getCanvasSize();
      state.appState.viewX = size.width / 2;
      state.appState.viewY = size.height / 2;
      renderAll();
      return;
    }
    const bounds = selectionBounds(state.elements);
    const size = getCanvasSize();
    const padding = 90;
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min((size.width - padding * 2) / bounds.width, (size.height - padding * 2) / bounds.height)));
    state.appState.zoom = nextZoom;
    state.appState.viewX = size.width / 2 - (bounds.x + bounds.width / 2) * nextZoom;
    state.appState.viewY = size.height / 2 - (bounds.y + bounds.height / 2) * nextZoom;
    renderAll();
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function closePopovers() {
    exportPopover.hidden = true;
    filePopover.hidden = true;
    themePopover.hidden = true;
    profilePopover.hidden = true;
    themeButton.setAttribute("aria-expanded", "false");
    profileButton.setAttribute("aria-expanded", "false");
  }

  function finishDialog(value) {
    const request = dialogRequest;
    if (!request) return;
    dialogRequest = null;
    dialogModal.hidden = true;
    dialogInput.value = "";
    const focusTarget = dialogRestoreFocus;
    dialogRestoreFocus = null;
    request.resolve(value);
    if (focusTarget && focusTarget.isConnected) {
      window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
    }
  }

  function openDialog({ kind = "alert", eyebrow, title, message, initialValue = "", confirmLabel = "OK", cancelLabel = "Cancel" }) {
    if (dialogRequest) finishDialog(kind === "confirm" ? false : null);
    return new Promise((resolve) => {
      dialogRestoreFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      closePopovers();
      dialogRequest = { kind, resolve };
      dialogEyebrow.textContent = eyebrow || (kind === "prompt" ? "Rename drawing" : kind === "confirm" ? "Confirm action" : "Notice");
      dialogTitle.textContent = title;
      dialogMessage.textContent = message;
      dialogInput.hidden = kind !== "prompt";
      dialogInput.value = kind === "prompt" ? initialValue : "";
      dialogCancelButton.hidden = kind === "alert";
      dialogCancelButton.textContent = cancelLabel;
      dialogConfirmButton.textContent = confirmLabel;
      dialogModal.hidden = false;
      const focusTarget = kind === "prompt" ? dialogInput : dialogConfirmButton;
      window.requestAnimationFrame(() => {
        if (dialogRequest?.resolve !== resolve) return;
        focusTarget.focus({ preventScroll: true });
        if (kind === "prompt") dialogInput.select();
      });
    });
  }

  function togglePopover(popover) {
    const shouldOpen = popover.hidden;
    closePopovers();
    popover.hidden = !shouldOpen;
    if (popover === themePopover) themeButton.setAttribute("aria-expanded", String(!popover.hidden));
    if (popover === profilePopover) {
      profileButton.setAttribute("aria-expanded", String(!popover.hidden));
      if (!popover.hidden) {
        profileNameInput.value = profile.name;
        updateProfilePreview();
        window.requestAnimationFrame(() => {
          profileNameInput.focus();
          profileNameInput.select();
        });
      }
    }
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportJson() {
    const payload = {
      type: "excalidraw-clone",
      version: 1,
      name: state.name,
      elements: state.elements,
      appState: { ...state.appState, selectedElementIds: {} },
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), `${slugify(state.name)}.excalidraw.json`);
    closePopovers();
    showToast("Editable file downloaded");
  }

  function slugify(value) {
    return String(value || "drawing").toLowerCase().trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "drawing";
  }

  function exportPng() {
    const viewport = getCanvasSize();
    const contentBounds = state.elements.length ? selectionBounds(state.elements) : {
      ...screenToWorld({ x: 0, y: 0 }),
      width: viewport.width / state.appState.zoom,
      height: viewport.height / state.appState.zoom,
    };
    const padding = 48;
    const scale = 2;
    const output = document.createElement("canvas");
    output.width = Math.max(1, Math.ceil((contentBounds.width + padding * 2) * scale));
    output.height = Math.max(1, Math.ceil((contentBounds.height + padding * 2) * scale));
    const outputContext = output.getContext("2d");
    outputContext.scale(scale, scale);
    outputContext.fillStyle = effectiveCanvasBackground();
    outputContext.fillRect(0, 0, contentBounds.width + padding * 2, contentBounds.height + padding * 2);
    outputContext.translate(padding - contentBounds.x, padding - contentBounds.y);
    state.elements.forEach((element) => drawElement(outputContext, element));
    output.toBlob((blob) => {
      if (blob) downloadBlob(blob, `${slugify(state.name)}.png`);
    }, "image/png");
    closePopovers();
    showToast("PNG export ready");
  }

  function serializedState() {
    return JSON.stringify({
      type: "excalidraw-clone",
      version: 1,
      name: state.name,
      elements: state.elements,
      appState: { ...state.appState, selectedElementIds: {} },
    }, null, 2);
  }

  async function shareDrawing() {
    const data = serializedState();
    try {
      if (navigator.share) {
        await navigator.share({ title: state.name, text: data });
        showToast("Sketch shared");
        return;
      }
      await navigator.clipboard.writeText(data);
      showToast("Sketch data copied to clipboard");
    } catch {
      showToast("Sharing was cancelled");
    }
  }

  async function resetDrawing() {
    if (state.elements.length && !(await openDialog({
      kind: "confirm",
      title: "Start a new drawing?",
      message: "Your current sketch is saved locally.",
      confirmLabel: "Start new",
      cancelLabel: "Keep drawing",
    }))) return;
    state = createInitialState();
    history = [];
    redoHistory = [];
    const size = getCanvasSize();
    state.appState.viewX = size.width / 2;
    state.appState.viewY = size.height / 2;
    closePopovers();
    renderAll();
    showToast("New drawing created");
  }

  async function renameDrawing() {
    const nextName = await openDialog({
      kind: "prompt",
      title: "Rename drawing",
      message: "Choose a name for this sketch.",
      initialValue: state.name,
      confirmLabel: "Rename",
    });
    if (nextName === null) return;
    const cleaned = nextName.trim().slice(0, 80);
    if (!cleaned) return;
    const before = createHistorySnapshot();
    state.name = cleaned;
    commit(before, "Renamed drawing");
  }

  async function openFile(file) {
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      state = normalizeState(raw);
      history = [];
      redoHistory = [];
      if (!isFiniteNumber(state.appState.viewX)) state.appState.viewX = getCanvasSize().width / 2;
      if (!isFiniteNumber(state.appState.viewY)) state.appState.viewY = getCanvasSize().height / 2;
      closePopovers();
      renderAll();
      showToast("Sketch opened");
    } catch {
      showToast("That file could not be opened");
    } finally {
      fileInput.value = "";
    }
  }

  function renderPresetSwatches(style, value, presets, label) {
    return `
      <div class="color-presets" role="group" aria-label="${label}">
        ${presets.map(([preset, presetLabel]) => {
          const active = value === preset;
          const swatchClass = `preset-swatch${active ? " active" : ""}${preset === "transparent" ? " transparent" : ""}`;
          const swatchStyle = preset === "transparent" ? "" : ` style="background:${preset}"`;
          return `<button class="${swatchClass}"${swatchStyle} type="button" data-action="preset-color" data-style="${style}" data-value="${preset}" title="${presetLabel}" aria-label="${presetLabel}" aria-pressed="${active}"></button>`;
        }).join("")}
      </div>`;
  }

  function renderColorControl(label, style, value) {
    const inputValue = isHexColor(value) ? value : "#ffffff";
    const chipClass = value === "transparent" ? "color-chip transparent" : "color-chip";
    const chipStyle = value === "transparent" ? "" : ` style="background:${value}"`;
    const presets = style === "backgroundColor" ? FILL_COLOR_PRESETS : STROKE_COLOR_PRESETS;
    return `
      <div class="color-control">
        <div class="color-row">
          <span>${label}</span>
          <div class="color-picker">
            <button class="${chipClass}"${chipStyle} type="button" data-action="open-color-picker" data-style="${style}" aria-label="Choose ${label.toLowerCase()}"></button>
            <input class="color-input" id="${style}-picker" data-style="${style}" type="color" value="${inputValue}" aria-label="${label}" />
            <input class="color-hex" data-action="hex-color" data-style="${style}" value="${value === "transparent" ? "transparent" : value}" spellcheck="false" aria-label="${label} hex value" />
          </div>
        </div>
        ${renderPresetSwatches(style, value, presets, label + " color presets")}
      </div>`;
  }
  function renderCanvasBackgroundControl() {
    return `
      <div class="inspector-section canvas-background-section">
        <span class="section-label">Whiteboard</span>
        <div class="canvas-background-label"><span>Canvas background</span><code>${effectiveCanvasBackground()}</code></div>
        ${renderPresetSwatches("canvasBackgroundColor", effectiveCanvasBackground(), WHITEBOARD_COLOR_PRESETS, "Whiteboard background presets")}
      </div>`;
  }

  function commonValue(elements, key, fallback) {
    if (!elements.length) return fallback;
    const values = elements.map((element) => element[key]);
    return values.every((value) => value === values[0]) ? values[0] : "mixed";
  }

  function renderStyleControls(elements, showFill, title = "Style") {
    const style = elements[0] || state.appState;
    const strokeColor = commonValue(elements, "strokeColor", state.appState.strokeColor);
    const backgroundColor = commonValue(elements, "backgroundColor", state.appState.backgroundColor);
    const fillStyle = commonValue(elements, "fillStyle", state.appState.fillStyle);
    const strokeWidth = commonValue(elements, "strokeWidth", state.appState.strokeWidth);
    const strokeStyle = commonValue(elements, "strokeStyle", state.appState.strokeStyle);
    const opacity = commonValue(elements, "opacity", state.appState.opacity);
    const defaultStroke = strokeColor === "mixed" ? state.appState.strokeColor : strokeColor;
    const defaultBackground = backgroundColor === "mixed" ? state.appState.backgroundColor : backgroundColor;
    return `
      <div class="inspector-section">
        <span class="section-label">${title}</span>
        ${renderColorControl("Stroke", "strokeColor", defaultStroke)}
        ${showFill ? renderColorControl("Background", "backgroundColor", defaultBackground) : ""}
        <div class="field-row">
          <span class="range-label">Stroke width</span>
          <div class="stroke-options">
            ${[1, 2, 4, 8].map((value, index) => `<button class="segment-button${strokeWidth === value ? " active" : ""}" type="button" data-action="style" data-style="strokeWidth" data-value="${value}"><span class="stroke-preview ${index === 1 ? "medium" : index === 2 ? "thick" : index === 3 ? "heavy" : ""}"></span></button>`).join("")}
          </div>
        </div>
        <div class="field-row">
          <span class="range-label">Line style</span>
          <div class="fill-options">
            ${[["solid", "Solid"], ["dashed", "Dashed"], ["dotted", "Dotted"]].map(([value, label]) => `<button class="segment-button${strokeStyle === value ? " active" : ""}" type="button" data-action="style" data-style="strokeStyle" data-value="${value}">${label}</button>`).join("")}
          </div>
        </div>
        ${showFill ? `
          <div class="field-row">
            <span class="range-label">Fill</span>
            <div class="fill-options">
              ${[["solid", "Solid"], ["hachure", "Hachure"]].map(([value, label]) => `<button class="segment-button${fillStyle === value ? " active" : ""}" type="button" data-action="style" data-style="fillStyle" data-value="${value}">${label}</button>`).join("")}
            </div>
          </div>` : ""}
        <div class="field-row">
          <span class="range-label">Opacity</span>
          <div class="range-wrap">
            <input type="range" min="10" max="100" step="5" value="${opacity === "mixed" ? state.appState.opacity : opacity}" data-setting="opacity" aria-label="Opacity" />
            <span class="range-value" data-range-value>${opacity === "mixed" ? "—" : `${opacity}%`}</span>
          </div>
        </div>
      </div>`;
  }

  function renderTextControls(element) {
    if (!element) return "";
    const fontSize = element.fontSize || 28;
    return `
      <div class="inspector-section">
        <span class="section-label">Text</span>
        <div class="field-row">
          <label for="font-family-select">Font</label>
          <select id="font-family-select" class="select-input" data-setting="fontFamily">
            <option value="hand"${element.fontFamily === "hand" ? " selected" : ""}>Hand-drawn</option>
            <option value="sans"${element.fontFamily === "sans" ? " selected" : ""}>Sans serif</option>
            <option value="serif"${element.fontFamily === "serif" ? " selected" : ""}>Serif</option>
            <option value="mono"${element.fontFamily === "mono" ? " selected" : ""}>Monospace</option>
          </select>
        </div>
        <div class="field-row">
          <label for="font-size-input">Size</label>
          <input id="font-size-input" class="number-input" type="number" min="10" max="96" value="${fontSize}" data-setting="fontSize" />
        </div>
        <div class="field-row">
          <span class="range-label">Align</span>
          <div class="alignment-options">
            ${[["left", "Left"], ["center", "Center"], ["right", "Right"]].map(([value, label]) => `<button class="segment-button${element.textAlign === value ? " active" : ""}" type="button" data-action="style" data-style="textAlign" data-value="${value}">${label}</button>`).join("")}
          </div>
        </div>
      </div>`;
  }
  function renderPenControls() {
    return `
      <div class="inspector-section pen-section">
        <span class="section-label">Pen</span>
        <div class="field-row">
          <label for="pen-smoothing-select">Assistance</label>
          <select id="pen-smoothing-select" class="select-input" data-setting="penSmoothing">
            <option value="off"${state.appState.penSmoothing === "off" ? " selected" : ""}>Off · raw stroke</option>
            <option value="soft"${state.appState.penSmoothing === "soft" ? " selected" : ""}>Soft · recommended</option>
            <option value="strong"${state.appState.penSmoothing === "strong" ? " selected" : ""}>Strong · steadier</option>
          </select>
        </div>
        <small class="setting-hint">Soft reduces hand jitter while keeping the gesture natural.</small>
      </div>`;
  }

  function renderInspector() {
    const selected = getSelectedElements();
    const single = selected.length === 1 ? selected[0] : null;
    const selectedLabel = selected.length === 0 ? "Canvas" : selected.length === 1 ? toolNames[selected[0].type] || "Element" : `${selected.length} elements`;
    const subtitle = selected.length === 0 ? "Default styles" : selected.length === 1 ? "Selected element" : "Multi-selection";
    const showFill = selected.length === 0 || selected.some((element) => ["rectangle", "diamond", "ellipse"].includes(element.type));
    inspector.innerHTML = `
      <div class="inspector-head">
        <div class="inspector-title"><strong>${selectedLabel}</strong><span>${subtitle}</span></div>
        <button class="inspector-close" type="button" data-action="close-inspector" aria-label="Close properties panel"><svg viewBox="0 0 20 20"><path d="m6 6 8 8M14 6l-8 8" /></svg></button>
      </div>
      ${selected.length === 0 ? `
        <div class="inspector-section empty-inspector">
          <div class="empty-inspector-art"><svg viewBox="0 0 26 26"><path d="m6 4.4 13.8 9.7-5.7 1.1 3.1 5.3-2.6 1.5-3.1-5.4-4.1 4.5Z" /></svg></div>
          <div class="inspector-title"><strong>Make it yours</strong><span>Choose a tool, then draw anywhere on the canvas.</span></div>
        </div>
        ${renderCanvasBackgroundControl()}
      ` : ""}
      ${renderStyleControls(selected, showFill, selected.length === 0 ? "Default style" : "Appearance")}
      ${single?.type === "text" ? renderTextControls(single) : ""}
      ${selected.length === 0 ? renderPenControls() : ""}
      <div class="inspector-section">
        <span class="section-label">Actions</span>
        <div class="inspector-actions">
          ${selected.length ? `<button class="inspector-action" type="button" data-action="duplicate"><svg viewBox="0 0 20 20"><rect x="6.5" y="6.5" width="9" height="9" rx="1.5" /><path d="M13.5 6.5V5A1.5 1.5 0 0 0 12 3.5H5A1.5 1.5 0 0 0 3.5 5v7A1.5 1.5 0 0 0 5 13.5h1.5" /></svg>Duplicate</button>` : `<button class="inspector-action" type="button" data-action="clear-canvas"><svg viewBox="0 0 20 20"><path d="M4 6h12M8 6V4.5h4V6M6 8.2v6.3M10 8.2v6.3M14 8.2v6.3M5.2 16h9.6l.7-10H4.5l.7 10Z" /></svg>Clear all</button>`}
          ${selected.length ? `<button class="inspector-action danger" type="button" data-action="delete"><svg viewBox="0 0 20 20"><path d="M4 6h12M8 6V4.5h4V6M6 8.2v6.3M10 8.2v6.3M14 8.2v6.3M5.2 16h9.6l.7-10H4.5l.7 10Z" /></svg>Delete</button>` : `<button class="inspector-action" type="button" data-action="fit"><svg viewBox="0 0 20 20"><path d="M7 3.5H3.5V7M13 3.5h3.5V7M7 16.5H3.5V13M13 16.5h3.5V13" /></svg>Fit content</button>`}
        </div>
      </div>
      <div class="inspector-help"><strong>Keep exploring</strong>Hold <b>Shift</b> to select several elements. Hold <b>Space</b> while dragging to move around the infinite canvas.</div>`;
  }

  async function handleInspectorClick(event) {
    const target = event.target.closest("[data-action]");
    if (!target || !inspector.contains(target)) return;
    const action = target.dataset.action;
    if (action === "preset-color") {
      if (target.dataset.style === "canvasBackgroundColor") setCanvasBackground(target.dataset.value);
      else mutateStyle(target.dataset.style, target.dataset.value);
      return;
    }
    if (action === "open-color-picker") {
      inspector.querySelector(`#${target.dataset.style}-picker`)?.click();
      return;
    }
    if (action === "style") {
      const value = target.dataset.value;
      const style = target.dataset.style;
      mutateStyle(style, style === "strokeWidth" ? Number(value) : value);
      return;
    }
    if (action === "hex-color") {
      const value = target.value.trim();
      if (target.dataset.style === "backgroundColor" && value.toLowerCase() === "transparent") mutateStyle("backgroundColor", "transparent");
      else if (isHexColor(value)) mutateStyle(target.dataset.style, value.toLowerCase());
      else renderInspector();
      return;
    }
    if (action === "duplicate") duplicateSelected();
    if (action === "delete") deleteSelected();
    if (action === "clear-canvas") {
      if (!state.elements.length || await openDialog({
        kind: "confirm",
        title: "Clear this canvas?",
        message: "Every element in this drawing will be removed.",
        confirmLabel: "Clear canvas",
        cancelLabel: "Keep drawing",
      })) {
        const before = createHistorySnapshot();
        state.elements = [];
        setSelection([], false);
        commit(before, "Cleared canvas");
      }
    }
    if (action === "fit") fitToContent();
    if (action === "close-inspector") toggleInspector();
  }

  function handleInspectorChange(event) {
    const target = event.target;
    if (target.matches("input[type=color][data-style]")) {
      mutateStyle(target.dataset.style, target.value.toLowerCase());
      return;
    }
    if (target.matches("[data-setting]")) {
      let value = target.value;
      if (target.dataset.setting === "penSmoothing") {
        setPenSmoothing(target.value);
        return;
      }
      if (target.dataset.setting === "fontSize") value = Math.min(96, Math.max(10, Number(value) || 28));
      if (target.dataset.setting === "opacity") value = Math.min(100, Math.max(10, Number(value) || 100));
      mutateStyle(target.dataset.setting, value);
      return;
    }
    if (target.matches("input[type=range]")) {
      const value = Math.min(100, Math.max(10, Number(target.value)));
      mutateStyle("opacity", value);
    }
  }

  function handleInspectorInput(event) {
    const target = event.target;
    if (target.matches("input[type=range]") && target.parentElement) {
      const output = target.parentElement.querySelector("[data-range-value]");
      if (output) output.textContent = `${target.value}%`;
    }
  }

  function handleKeyDown(event) {
    if (dialogRequest) {
      if (event.key === "Escape") {
        event.preventDefault();
        finishDialog(dialogRequest.kind === "confirm" ? false : null);
      }
      return;
    }
    const target = event.target;
    const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement;
    const modifier = event.metaKey || event.ctrlKey;

    if (event.key === "Escape") {
      if (!helpModal.hidden) {
        helpModal.hidden = true;
        return;
      }
      if (textEditor) {
        finishTextEditor(false);
        return;
      }
      closePopovers();
      setSelection([]);
      cancelPointerInteraction();
      return;
    }
    if (isTyping) return;

    if (event.key === " ") {
      event.preventDefault();
      spacePressed = true;
      return;
    }
    if (modifier && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (modifier && event.key.toLowerCase() === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (modifier && event.key.toLowerCase() === "d") {
      event.preventDefault();
      duplicateSelected();
      return;
    }
    if (modifier && event.key.toLowerCase() === "a") {
      event.preventDefault();
      selectAll();
      return;
    }
    if (modifier && event.key.toLowerCase() === "s") {
      event.preventDefault();
      exportJson();
      return;
    }
    if (modifier && event.key.toLowerCase() === "e") {
      event.preventDefault();
      exportPng();
      return;
    }
    if (modifier && event.key.toLowerCase() === "o") {
      event.preventDefault();
      fileInput.click();
      return;
    }
    if (modifier && event.key.toLowerCase() === "n") {
      event.preventDefault();
      resetDrawing();
      return;
    }
    if (modifier && (event.key === "+" || event.key === "=")) {
      event.preventDefault();
      zoomBy(1.15);
      return;
    }
    if (modifier && event.key === "-") {
      event.preventDefault();
      zoomBy(1 / 1.15);
      return;
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      deleteSelected();
      return;
    }
    if (event.key === "?") {
      helpModal.hidden = false;
      return;
    }
    const nextTool = toolShortcuts[event.key.toLowerCase()];
    if (nextTool) changeTool(nextTool);
  }

  function handleKeyUp(event) {
    if (event.key === " ") {
      spacePressed = false;
      if (!pointer) stage.dataset.panning = "false";
    }
  }

  canvas.addEventListener("pointerdown", startPointerInteraction);
  canvas.addEventListener("pointermove", movePointerInteraction);
  canvas.addEventListener("pointerup", finishPointerInteraction);
  canvas.addEventListener("pointercancel", cancelPointerInteraction);
  canvas.addEventListener("pointerleave", hideEraserCursor);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());
  canvas.addEventListener("wheel", (event) => {
    event.preventDefault();
    const screen = getLocalPoint(event);
    if (event.ctrlKey || event.metaKey) zoomAt(screen, state.appState.zoom * (event.deltaY > 0 ? 0.92 : 1.08));
    else {
      state.appState.viewX -= event.deltaX;
      state.appState.viewY -= event.deltaY;
      renderAll();
    }
  }, { passive: false });

  document.querySelectorAll(".tool-button[data-tool]").forEach((button) => button.addEventListener("click", () => changeTool(button.dataset.tool)));
  document.querySelector("#undo-button").addEventListener("click", undo);
  document.querySelector("#redo-button").addEventListener("click", redo);
  document.querySelector("#clear-selection-button").addEventListener("click", deleteSelected);
  inspectorToggleButton.addEventListener("click", toggleInspector);
  document.querySelector("#zoom-out-button").addEventListener("click", () => zoomBy(1 / 1.15));
  document.querySelector("#zoom-in-button").addEventListener("click", () => zoomBy(1.15));
  document.querySelector("#zoom-value").addEventListener("click", () => {
    const size = getCanvasSize();
    zoomAt({ x: size.width / 2, y: size.height / 2 }, 1);
  });
  document.querySelector("#zoom-fit-button").addEventListener("click", fitToContent);
  document.querySelector("#brand-button").addEventListener("click", () => togglePopover(filePopover));
  document.querySelector("#scene-title-button").addEventListener("click", renameDrawing);
  document.querySelector("#export-button").addEventListener("click", () => togglePopover(exportPopover));
  themeButton.addEventListener("click", () => togglePopover(themePopover));
  themePopover.querySelectorAll("[data-theme-mode]").forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.themeMode)));
  profileButton.addEventListener("click", () => togglePopover(profilePopover));
  profileNameInput.addEventListener("input", updateProfilePreview);
  profileNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveProfile();
    }
  });
  document.querySelector("#profile-save-button").addEventListener("click", saveProfile);
  document.querySelector("#profile-reset-button").addEventListener("click", resetProfile);
  document.querySelector("#library-button").addEventListener("click", () => showToast("Library is ready for your next sketch"));
  document.querySelector("#share-button").addEventListener("click", shareDrawing);
  document.querySelector("#help-button").addEventListener("click", () => { closePopovers(); helpModal.hidden = false; });
  document.querySelector("#close-help-button").addEventListener("click", () => { helpModal.hidden = true; });
  document.querySelector("#help-done-button").addEventListener("click", () => { helpModal.hidden = true; });
  document.querySelector("#export-png-button").addEventListener("click", exportPng);
  document.querySelector("#export-json-button").addEventListener("click", exportJson);
  document.querySelector("#new-drawing-button").addEventListener("click", resetDrawing);
  document.querySelector("#rename-drawing-button").addEventListener("click", renameDrawing);
  document.querySelector("#open-json-button").addEventListener("click", () => fileInput.click());
  document.querySelector("#save-json-button").addEventListener("click", exportJson);
  document.querySelectorAll("[data-close-popover]").forEach((button) => button.addEventListener("click", closePopovers));
  fileInput.addEventListener("change", (event) => openFile(event.target.files?.[0]));
  inspector.addEventListener("click", handleInspectorClick);
  inspector.addEventListener("change", handleInspectorChange);
  inspector.addEventListener("input", handleInspectorInput);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);
  document.addEventListener("click", (event) => {
    const insidePopover = event.target.closest(".popover, #brand-button, #export-button, #theme-button, #profile-button");
    if (!insidePopover) closePopovers();
  });
  helpModal.addEventListener("click", (event) => {
    if (event.target === helpModal) helpModal.hidden = true;
  });
  dialogCancelButton.addEventListener("click", () => {
    if (!dialogRequest) return;
    finishDialog(dialogRequest.kind === "confirm" ? false : null);
  });
  dialogConfirmButton.addEventListener("click", () => {
    if (!dialogRequest) return;
    finishDialog(dialogRequest.kind === "prompt" ? dialogInput.value : true);
  });
  dialogInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    event.stopPropagation();
    finishDialog(dialogInput.value);
  });
  dialogModal.addEventListener("click", (event) => {
    if (event.target !== dialogModal || !dialogRequest || dialogRequest.kind === "alert") return;
    finishDialog(dialogRequest.kind === "confirm" ? false : null);
  });
  window.addEventListener("resize", resizeCanvas);
  if ("ResizeObserver" in window) new ResizeObserver(resizeCanvas).observe(stage);

  resizeCanvas();
  applyTheme();
  watchSystemTheme();
  updateToolbar();
  renderInspector();
  renderProfile();
  updateHistoryButtons();
  updateWelcomeTip();

  window.drawApp = {
    getState: () => clone(state),
    setTool: changeTool,
    undo,
    redo,
    fitToContent,
    exportPng,
    exportJson,
  };
})();
