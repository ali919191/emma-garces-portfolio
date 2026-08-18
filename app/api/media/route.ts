import { deleteMediaRecord, findMedia } from "../../../db/portfolio-repository";
import { requireAdminApi } from "../../../lib/auth";
import { canReadMedia, isValidMediaKey } from "../../../lib/media-access";
import { readMedia, removeMedia } from "../../../lib/media-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !isValidMediaKey(key)) return Response.json({ error: "Missing media key." }, { status: 400 });
  const asset = await findMedia(key);
  if (!asset) return new Response("Not found", { status: 404 });
  if (!canReadMedia(asset.isPublic, await requireAdminApi())) return new Response("Not found", { status: 404 });

  const result = await readMedia(key, request.headers.get("if-none-match"));
  if (!result) return new Response("Not found", { status: 404 });
  if (result.statusCode === 304) return new Response(null, { status: 304 });
  if (result.statusCode !== 200) return new Response("Not found", { status: 404 });
  return new Response(result.stream, {
    headers: {
      "content-type": result.blob.contentType,
      "etag": result.blob.etag,
      "x-content-type-options": "nosniff",
      "cache-control": asset.isPublic ? "public, max-age=3600, stale-while-revalidate=86400" : "private, no-cache",
    },
  });
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
