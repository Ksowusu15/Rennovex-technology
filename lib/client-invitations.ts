import { getPublicAppUrl } from "@/lib/app-url";
import { emailSender, sendTransactionalEmail } from "@/lib/email";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export function hashClientToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function createClientInvite(clientId: string) {
  const previous = await prisma.client.findUniqueOrThrow({
    where: { id: clientId },
  });
  if (!previous.isActive || previous.password) {
    throw new Error("Only active clients awaiting activation can be invited.");
  }
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const changed = await prisma.client.updateMany({
    where: {
      id: clientId,
      password: null,
      isActive: true,
      inviteTokenHash: previous.inviteTokenHash,
    },
    data: {
      inviteTokenHash: hashClientToken(token),
      inviteTokenExpires: expires,
      inviteDeliveryStatus: "PENDING",
    },
  });
  if (changed.count !== 1)
    throw new Error("Client account changed. Refresh before resending.");

  return {
    token,
    expires,
    previous,
  };
}

/** Restore a still-valid earlier link if the provider rejects the new invite. */
export async function deliverClientInvite(client: {
  id: string;
  email: string;
  name: string;
}) {
  const invite = await createClientInvite(client.id);
  try {
    await sendClientInviteEmail({ ...client, token: invite.token });
    await prisma.client.updateMany({
      where: { id: client.id, inviteTokenHash: hashClientToken(invite.token) },
      data: { inviteDeliveryStatus: "SENT" },
    });
    return true;
  } catch {
    await prisma.client.updateMany({
      where: { id: client.id, inviteTokenHash: hashClientToken(invite.token) },
      data: {
        inviteTokenHash: invite.previous.inviteTokenHash,
        inviteTokenExpires: invite.previous.inviteTokenExpires,
        inviteDeliveryStatus: "FAILED",
      },
    });
    console.error(
      "Client invitation delivery failed; account retained for retry.",
    );
    return false;
  }
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
