import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdminApi } from "../../../../lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await requireAdminApi())) return Response.json({ error: "Authentication required." }, { status: 401 });
  try {
    const body = await request.json() as HandleUploadBody;
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/avif", "video/mp4", "video/webm", "video/quicktime"],
        maximumSizeInBytes: 50 * 1024 * 1024,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {},
    });
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
