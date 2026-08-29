import { extname, join, normalize, sep } from "node:path";

const root = process.cwd();
const port = Number(process.env.PORT || 4173);
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
  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname).replace(/^\/+/, "") || "index.html";
  } catch {
    return notFound();
  }

  const filePath = normalize(join(root, relativePath));
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) return notFound();

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
