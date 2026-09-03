import { del, get, put } from "@vercel/blob";

export async function storeMedia(file: File, pathname?: string) {
  return put(pathname ?? `portfolio/${crypto.randomUUID()}-${file.name}`, file, {
    access: "private",
    addRandomSuffix: !pathname,
    contentType: file.type,
    multipart: file.size > 4 * 1024 * 1024,
  });
}

/**
 * Reads a private blob, optionally forwarding the caller's Range header.
 *
 * Range matters for video: the store is private-only, so runway footage is
 * streamed through our own route, and without byte ranges a browser cannot seek.
 * The origin honours Range and answers with Content-Range, which the caller
 * turns back into a 206.
 */
export async function readMedia(pathname: string, ifNoneMatch?: string | null, range?: string | null) {
  return get(pathname, {
    access: "private",
    ifNoneMatch: ifNoneMatch ?? undefined,
    headers: range ? { range } : undefined,
  });
}

export async function removeMedia(pathname: string) {
  await del(pathname);
}
