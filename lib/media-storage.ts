import { del, get, put } from "@vercel/blob";

export async function storeMedia(file: File, pathname?: string) {
  return put(pathname ?? `portfolio/${crypto.randomUUID()}-${file.name}`, file, {
    access: "private",
    addRandomSuffix: !pathname,
    contentType: file.type,
    multipart: file.size > 4 * 1024 * 1024,
  });
}

export async function readMedia(pathname: string, ifNoneMatch?: string | null) {
  return get(pathname, { access: "private", ifNoneMatch: ifNoneMatch ?? undefined });
}

export async function removeMedia(pathname: string) {
  await del(pathname);
}
