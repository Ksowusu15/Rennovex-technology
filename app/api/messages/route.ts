import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";
import { rateLimit, 
  tooManyRequests } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(150),
  phone: z.string().max(30).optional().or(z.literal("")),
  projectType: z.string().max(80).optional().or(z.literal("")),
  message: z.string().min(10).max(5000)
});

async function sendEmailNotification(data: z.infer<typeof schema>) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  const settings = await getSiteSettings();
  const to = settings?.contactEmail 
    || process.env.CONTACT_NOTIFICATION_EMAIL;
  if (!apiKey 
    || !from 
    || !to) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, 
      "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: data.email,
      subject: `New Rennovex enquiry from ${data.name}`,
      text: `Name: ${data.name}\nEmail: ${data.email}\nPhone: ${data.phone 
        || "Not provided"}\nProject type: ${data.projectType 
        || "General enquiry"}\n\n${data.message}`
    })
  });
}

export async function POST(request: Request) {
  const throttle = rateLimit(request, 
    "contact", 
    6, 
    600000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  try {
    const data = schema.parse(await request.json());
    const message = await prisma.message.create({ data });
    await sendEmailNotification(data).catch((error) => console.error("Contact email notification failed:", 
      error));
    return NextResponse.json({ id: message.id }, 
      { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid submission" }, 
      { status: 400 });
  }
}
