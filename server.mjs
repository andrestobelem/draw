import { extname, join } from "node:path";

const root = process.cwd();
const requestedPort = Number(process.env.PORT || 4173);
if (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
  console.error("PORT must be an integer between 1 and 65535");
  process.exit(1);
}
const port = requestedPort;
const publicFiles = Object.freeze({
  "/": "index.html",
  "/index.html": "index.html",
  "/styles.css": "styles.css",
  "/app.js": "app.js",
});
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
};

function notFound() {
  return new Response("Not found", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

async function serveFile(pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return notFound();
  }

  const relativePath = publicFiles[decodedPath];
  if (typeof relativePath !== "string") return notFound();

  const filePath = join(root, relativePath);
  const file = Bun.file(filePath);
  if (!(await file.exists())) return notFound();

  return new Response(file, {
    headers: {
      "content-type": contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "cache-control": "no-cache",
    },
  });
}

Bun.serve({
  port,
  hostname: "127.0.0.1",
  fetch(request) {
    return serveFile(new URL(request.url).pathname);
  },
});

console.log(`draw web server listening on http://127.0.0.1:${port}`);
