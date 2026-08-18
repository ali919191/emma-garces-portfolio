import { requireAdminApi } from "../../../../lib/auth";
import { isInquiryStatus } from "../../../../lib/inquiries";
import { updateInquiryStatus } from "../../../../db/inquiry-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await requireAdminApi())) return Response.json({ error: "Authentication required." }, { status: 401 });
  const { id } = await params;
  if (!id) return Response.json({ error: "Inquiry not found." }, { status: 404 });
  try {
    const payload = await request.json() as { status?: unknown };
    if (!isInquiryStatus(payload.status)) return Response.json({ error: "Choose a valid status." }, { status: 400 });
    const inquiry = await updateInquiryStatus(id, payload.status);
    if (!inquiry) return Response.json({ error: "Inquiry not found." }, { status: 404 });
    return Response.json({ inquiry });
  } catch {
    return Response.json({ error: "Unable to update this inquiry." }, { status: 400 });
  }
}
