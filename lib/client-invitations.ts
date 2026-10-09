import { getPublicAppUrl } from "@/lib/app-url";
import { emailSender, sendTransactionalEmail } from "@/lib/email";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function hashClientToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createClientInvite(clientId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await prisma.client.update({
    where: {
      id: clientId,
    },
    data: {
      inviteTokenHash: hashClientToken(token),
      inviteTokenExpires: expires,
    },
  });

  return {
    token,
    expires,
  };
}

export async function sendClientInviteEmail(input: {
  email: string;
  name: string;
  token: string;
}) {
  const inviteUrl = `${getPublicAppUrl()}/client-portal/accept-invite?token=${encodeURIComponent(input.token)}`;
  const from = emailSender("client");
  if (!process.env.RESEND_API_KEY || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Client invitation email is not configured.");
    }
    console.log("Development client invitation URL:", inviteUrl);
    return;
  }
  await sendTransactionalEmail({
    from,
    to: input.email,
    subject: "Welcome to the Rennovex Client Portal",
    text: [
      `Hello ${input.name},`,
      "",
      "Create your password and activate your Rennovex Client Portal:",
      inviteUrl,
      "",
      "This invitation expires in 24 hours.",
      "If you were not expecting it, ignore this email.",
    ].join("\n"),
  });
}
