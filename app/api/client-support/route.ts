import { notifyTeam } from "@/lib/team-notifications";
import { rejectCrossOrigin } from "@/lib/request-origin";
import { after, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientSession } from "@/lib/client-auth";

const schema = z.object({
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(4000),
  priority: z.enum(["Low", "Normal", "High"]).default("Normal"),
});

export async function POST(request: Request) {
  const blocked = rejectCrossOrigin(request);
  if (blocked) return blocked;

  const session = await getClientSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const input = schema.parse(await request.json());
    const item = await prisma.supportRequest.create({
      data: {
        clientId: session.id,
        ...input,
      },
    });

    after(() => notifyTeam({
      subject: `New client support request — ${input.subject}`,
      replyTo: session.email,
      dashboardPath: `/admin/clients/${encodeURIComponent(session.id)}`,
      fields: [
        ["Request ID", item.id],
        ["Client", session.name],
        ["Email", session.email],
        ["Subject", input.subject],
        ["Priority", input.priority],
        ["Message", input.message],
      ],
    }));

    return NextResponse.json({ ok: true, id: item.id });
  } catch (error) {
    if (!(error instanceof z.ZodError) && !(error instanceof SyntaxError)) {
      console.error("Form service unavailable:", error);
      return NextResponse.json(
        {
          error: "This service is temporarily unavailable. Please try again later.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: "Please complete all required fields." },
      { status: 400 },
    );
  }
}
