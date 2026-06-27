// Minimal HTML response for owner email-link actions (approve/reject).
export function resultPage(title: string, message: string): Response {
  const html = `<!doctype html><html><head><meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title></head>
    <body style="font-family:Arial,sans-serif;background:#f4f5f7;margin:0;padding:48px">
      <div style="max-width:420px;margin:auto;background:#fff;border-radius:12px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,.1)">
        <h1 style="color:#1a2e5a;font-size:20px;margin:0 0 12px">${escapeHtml(title)}</h1>
        <p style="color:#374151;font-size:14px;line-height:1.6;margin:0">${escapeHtml(message)}</p>
      </div>
    </body></html>`;
  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
