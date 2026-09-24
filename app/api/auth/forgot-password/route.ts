import { createHash, 
  randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getPublicAppUrl } from "@/lib/app-url";
import { rateLimit, 
  tooManyRequests } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().trim().email() });

const genericMessage =
  "If an administrator account exists for that email, a reset link has been sent.";

export async function POST(request: Request) {
  const throttle = rateLimit(request, 
    "forgot-password", 
    5, 
    900000);
  if (!throttle.allowed) return tooManyRequests(throttle.retryAfter);
  try {
    const parsed = schema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const email = parsed.data.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    // Always return the same response so the endpoint does not reveal
    // whether an administrator account exists for a submitted email.
    if (!user 
      || !user.isActive) {
      return NextResponse.json({ message: genericMessage });
    }

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetTokenHash: tokenHash,
        resetTokenExpires: expiresAt,
      },
    });

    const appUrl = getPublicAppUrl(request);
    const resetUrl = `${appUrl}/admin/reset-password?token=${encodeURIComponent(token)}`;

    if (process.env.RESEND_API_KEY 
      && process.env.ADMIN_FROM_EMAIL) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.ADMIN_FROM_EMAIL,
          to: user.email,
          subject: "Reset your Rennovex admin password",
          text: `Hello ${user.name 
            || "Administrator"},\n\nReset your Rennovex administrator password using this link:\n\n${resetUrl}\n\nThis link expires in 10 minutes and can only be used once. If you did not request this, ignore this email.`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#0f172a">
              <h2 style="margin-bottom:8px">Rennovex Admin Portal</h2>
              <p>Hello ${user.name 
                || "Administrator"},</p>
              <p>A password reset was requested for your administrator account.</p>
              <p style="margin:28px 0">
                <a href="${resetUrl}" style="display:inline-block;background:#1d4ed8;color:#fff;text-decoration:none;padding:13px
                  20px;border-radius:10px;font-weight:700">Reset admin password</a>
              </p>
              <p style="font-size:14px;color:#475569">This secure link expires in 10 minutes and can only be used once.</p>
              <p style="font-size:13px;color:#64748b;word-break:break-all">If the button does not work, copy and paste this address into your browser:<br>${resetUrl}</p>
              <p style="font-size:13px;color:#64748b">If you did not request this change, you can ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const details = await response.text();
        console.error("Resend password-reset email failed:", 
          details);

        return NextResponse.json(
          {
            message:
              "The reset request was created, but the email could not be delivered. Please check the Resend configuration.",
          },
          { status: 502 },
        );
      }
    } else {
      console.log(`\n[Rennovex password reset]\n${resetUrl}\n`);
    }

    return NextResponse.json({ message: genericMessage });
  } catch (error) {
    console.error("Forgot-password request failed:", 
      error);

    return NextResponse.json(
      {
        message:
          "We could not process the password reset request right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
