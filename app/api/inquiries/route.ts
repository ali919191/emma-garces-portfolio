import { requireAdminApi } from "../../../lib/auth";
import { parseInquirySubmission } from "../../../lib/inquiries";
import { createInquiry, countRecentInquiries, listInquiries } from "../../../db/inquiry-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await requireAdminApi())) return Response.json({ error: "Authentication required." }, { status: 401 });
  return Response.json({ inquiries: await listInquiries() }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Unable to send this inquiry." }, { status: 400 });
  try {
    const payload = await request.json() as Record<string, unknown>;
    const parsed = parseInquirySubmission(payload);
    if (!parsed.ok) {
      if (parsed.spam) return Response.json({ ok: true });
      return Response.json({ error: parsed.error }, { status: 400 });
    }
    if ((await countRecentInquiries(parsed.data.email, 60 * 60 * 1000)) >= 5) {
      return Response.json({ error: "Please wait before sending another inquiry." }, { status: 429 });
    }
    await createInquiry(parsed.data);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Unable to send this inquiry." }, { status: 400 });
  }
}
