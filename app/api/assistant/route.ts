import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit, 
  tooManyRequests } from "@/lib/rate-limit";

const requestSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string().trim().min(1).max(1200),
  name: z.string().trim().max(120).optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional(),
});

function replyFor(message: string) {
  const text = message.toLowerCase();
  if (/human|agent|person|team|call me|contact me/.test(text)) return { reply: "I’ve marked this conversation for the Rennovex team. Please share your name and email so they can follow up promptly.", 
    needsReply: true };
  if (/price|cost|budget|quote|estimate/.test(text)) return { reply: "I can help prepare a project estimate. Typical pricing depends on scope, integrations, content, and timeline. Choose ‘Request a quote’ below and I’ll collect the details our team needs.", 
    action: "quote" };
  if (/book|meeting|consult|appointment|schedule/.test(text)) return { reply: "You can book a consultation directly. Choose ‘Book consultation’ and select your preferred date and project area.", 
    action: "booking" };
  if (/ecommerce|e-commerce|online store|shop/.test(text)) return { reply: "For an online store, we can provide product management, secure payments, order tracking, customer accounts, analytics, and an admin dashboard. Would you like a quote or a consultation?", 
    action: "quote" };
  if (/website|web design|redesign/.test(text)) return { reply: "Rennovex builds responsive, SEO-ready business websites with modern design, content management, analytics, and conversion-focused pages. Tell me your business type and the main result you want from the website." };
  if (/software|system|portal|dashboard|app/.test(text)) return { reply: "Custom software is a strong fit when your workflow needs automation, dashboards, role-based access, integrations, or reporting. What process are you trying to improve?" };
  if (/brand|graphic|logo|ui|ux/.test(text)) return { reply: "Our design services cover brand identity, UI/UX, visual systems, marketing assets, and product interfaces. Do you need a new identity or improvements to an existing one?" };
  if (/hosting|domain|maintenance|support/.test(text)) return { reply: "Yes. Rennovex can guide domain setup, deployment, maintenance, backups, security updates, and ongoing technical support as part of a project plan." };
  if (/hello|hi|hey|good morning|good afternoon/.test(text)) return { reply: "Hello! I’m Rennovex Assistant. I can help you explore services, request a quote, book a consultation, or connect with our team. What are you planning to build?" };
  return { reply: "Thanks for sharing that. Rennovex can help with websites, custom software, UI/UX and branding, and IT consulting. Tell me your project goal, preferred timeline, and whether you would like a quote or consultation." };
}

export async function POST(request: Request) {
  const throttle = rateLimit(request, 
    "assistant", 
    30, 
    600000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  try {
    const input = requestSchema.parse(await request.json());
    const answer = replyFor(input.message);
    const session = input.sessionId
      ? await prisma.chatSession.update({
          where: { id: input.sessionId },
          data: {
            visitorName: input.name || undefined,
            email: input.email || undefined,
            phone: input.phone || undefined,
            status: answer.needsReply ? "NEEDS_REPLY" : undefined,
            messages: { create: [{ sender: "VISITOR", 
              content: input.message }, 
              { sender: "ASSISTANT", 
              content: answer.reply }] },
          },
        })
      : await prisma.chatSession.create({
          data: {
            visitorName: input.name || undefined,
            email: input.email || undefined,
            phone: input.phone || undefined,
            status: answer.needsReply ? "NEEDS_REPLY" : "OPEN",
            messages: { create: [{ sender: "VISITOR", 
              content: input.message }, 
              { sender: "ASSISTANT", 
              content: answer.reply }] },
          },
        });
    return NextResponse.json({ sessionId: session.id, 
      ...answer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "I couldn’t send that message. Please try again." }, 
      { status: 400 });
  }
}
