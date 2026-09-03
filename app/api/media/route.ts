import { deleteMediaRecord, findMedia, findServableMedia } from "../../../db/portfolio-repository";
import { requireAdminApi } from "../../../lib/auth";
import { canReadMedia, isValidMediaKey } from "../../../lib/media-access";
import { readMedia, removeMedia } from "../../../lib/media-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !isValidMediaKey(key)) return Response.json({ error: "Missing media key." }, { status: 400 });
  const record = await findServableMedia(key);
  if (!record) return new Response("Not found", { status: 404 });
  if (!canReadMedia(record.isPublic, await requireAdminApi())) return new Response("Not found", { status: 404 });

  // A record can outlive its blob (a store rotated, an upload half-finished). That
  // is a missing image, not a broken site: fail as 404 so one bad asset never takes
  // down the page that renders it.
  const range = request.headers.get("range");
  const result = await readMedia(key, request.headers.get("if-none-match"), range).catch(() => null);
  if (!result) return new Response("Not found", { status: 404 });
  if (result.statusCode === 304) return new Response(null, { status: 304 });
  if (result.statusCode !== 200) return new Response("Not found", { status: 404 });

  // The origin answers a Range request with Content-Range; pass that straight back
  // as a 206 so video can be seeked instead of only played from the start.
  const contentRange = result.headers.get("content-range");
  const partial = Boolean(range && contentRange);
  const headers = new Headers({
    "content-type": result.blob.contentType,
    "etag": result.blob.etag,
    "accept-ranges": "bytes",
    "x-content-type-options": "nosniff",
    "cache-control": record.isPublic ? "public, max-age=3600, stale-while-revalidate=86400" : "private, no-cache",
  });
  if (partial) {
    headers.set("content-range", contentRange!);
    const length = result.headers.get("content-length");
    if (length) headers.set("content-length", length);
  }
  return new Response(result.stream, { status: partial ? 206 : 200, headers });
}

export async function DELETE(request: Request) {
  if (!(await requireAdminApi())) return Response.json({ error: "Authentication required." }, { status: 401 });
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !isValidMediaKey(key)) return Response.json({ error: "Missing media key." }, { status: 400 });
  const asset = await findMedia(key);
  if (!asset) return Response.json({ ok: true });
  await removeMedia(key);
  await deleteMediaRecord(key);
  return Response.json({ ok: true });
}
