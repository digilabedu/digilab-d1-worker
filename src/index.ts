import { renderHtml } from "./renderHtml";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // R2 Asset serving for WebGL builds
    // Expect requests like: https://your-worker.workers.dev/assets/Build/zn-vs-s.framework.js.br
    const prefix = "/unity/"; // prefix for unity assets

    // Remove leading slash to get the key inside R2 bucket
    const key = url.pathname.slice(1);

    if (!url.pathname.startsWith(prefix)) {
      const obj = await env.DIGILAB_BUCKET.get(key);
      if (!obj) {
        return new Response("Not found", { status: 404 });
      }

      return new Response(obj.body, { status: 200 });
    }

    // Try to fetch object from R2
    const obj = await env.DIGILAB_BUCKET.get(key);
    if (!obj) {
      return new Response("Asset not found", { status: 404 });
    }

    // Create response headers
    const headers = new Headers();
    headers.set("Cache-Control", "public, max-age=31536000, immutable"); // long cache for build files
    headers.set("Access-Control-Allow-Origin", "*"); // CORS - restrict to your domain if needed

    // Content-Type + Content-Encoding based on file extension
    if (key.endsWith(".js.br") || key.endsWith(".framework.js.br")) {
      headers.set("Content-Type", "application/javascript");
      headers.set("Content-Encoding", "br");
    } else if (key.endsWith(".wasm.br")) {
      headers.set("Content-Type", "application/wasm");
      headers.set("Content-Encoding", "br");
    } else if (key.endsWith(".data.br")) {
      headers.set("Content-Type", "application/octet-stream");
      headers.set("Content-Encoding", "br");
    } else if (key.endsWith(".html")) {
      headers.set("Content-Type", "text/html; charset=utf-8");
    } else if (key.endsWith(".json")) {
      headers.set("Content-Type", "application/json");
    } else {
      // Fallback: try to infer from object metadata if present
      const metaType =
        obj.httpMetadata?.contentType || obj.httpMetadata?.contentType;
      if (metaType) {
        headers.set("Content-Type", metaType);
      } else {
        headers.set("Content-Type", "application/octet-stream");
      }
    }

    // Stream the body (obj.body is a readable stream)
    return new Response(obj.body, { status: 200, headers });
  },
} satisfies ExportedHandler<Env>;
