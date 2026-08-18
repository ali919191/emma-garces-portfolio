import { env } from "cloudflare:workers";

type RuntimeEnv = { DB: D1Database; MEDIA: R2Bucket };

function runtime() {
  return env as unknown as RuntimeEnv;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "asset";
}

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return Response.json({ error: "Missing media key." }, { status: 400 });
  const object = await runtime().MEDIA.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Choose an image or video." }, { status: 400 });
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return Response.json({ error: "Only images and videos are supported." }, { status: 415 });
    if (file.size > 50 * 1024 * 1024) return Response.json({ error: "File exceeds the 50 MB upload limit." }, { status: 413 });
    const key = `${crypto.randomUUID()}-${safeName(file.name)}`;
    const { MEDIA, DB } = runtime();
    await DB.prepare(`CREATE TABLE IF NOT EXISTS media_objects (
      key TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      content_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    await MEDIA.put(key, file.stream(), { httpMetadata: { contentType: file.type } });
    await DB.prepare("INSERT INTO media_objects (key, filename, content_type, size) VALUES (?, ?, ?, ?)")
      .bind(key, file.name, file.type, file.size).run();
    return Response.json({ key, url: `/api/media?key=${encodeURIComponent(key)}`, filename: file.name }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return Response.json({ error: "Missing media key." }, { status: 400 });
  const { MEDIA, DB } = runtime();
  await MEDIA.delete(key);
  await DB.prepare("DELETE FROM media_objects WHERE key = ?").bind(key).run();
  return Response.json({ ok: true });
}
