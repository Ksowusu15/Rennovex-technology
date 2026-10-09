"use server";

import { safeFileUrl } from "@/lib/safe-url";
import { requireRole } from "@/lib/auth";
import { z } from "zod";
import { ClientProjectStatus, InvoiceStatus, SupportStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createClientInvite, sendClientInviteEmail } from "@/lib/client-invitations";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createClient(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const name = text(formData, "name");
  const company = text(formData, "company");
  const email = z
    .string()
    .email()
    .max(150)
    .parse(text(formData, "email").toLowerCase());
  const phone = text(formData, "phone");

  if (!name || !email) {
    throw new Error("Client name and email are required.");
  }

  const client = await prisma.client.create({
    data: {
      name,
      company: company || null,
      email,
      phone: phone || null,
      password: null,
    },
  });

  const invite = await createClientInvite(client.id);

  await sendClientInviteEmail({
    email: client.email,
    name: client.name,
    token: invite.token,
  });

  revalidatePath("/admin/clients");
}

export async function resendClientInvite(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clientId = text(formData, "clientId");

  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
    },
  });

  if (!client) {
    throw new Error("Client not found.");
  }

  const invite = await createClientInvite(client.id);

  await sendClientInviteEmail({
    email: client.email,
    name: client.name,
    token: invite.token,
  });

  revalidatePath(`/admin/clients/${client.id}`);
}

export async function toggleClientStatus(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clientId = text(formData, "clientId");
  const active = text(formData, "active") === "true";

  await prisma.client.update({
    where: {
      id: clientId,
    },
    data: {
      isActive: active,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function createClientProject(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const description = text(formData, "description");
  const dueDate = text(formData, "dueDate");

  if (!clientId || !name) {
    throw new Error("Client and project name are required.");
  }

  await prisma.clientProject.create({
    data: {
      clientId,
      name,
      description: description || null,
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : null,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}

export async function updateClientProject(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const projectId = text(formData, "projectId");
  const clientId = text(formData, "clientId");
  const status = z.nativeEnum(ClientProjectStatus).parse(text(formData, "status"));
  const progress = z.coerce
    .number()
    .int()
    .min(0)
    .max(100)
    .parse(text(formData, "progress") || 0);

  await prisma.clientProject.update({
    where: {
      id: projectId,
      clientId,
    },
    data: {
      status,
      progress,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/client-portal/dashboard");
}

export async function addClientMilestone(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const projectId = text(formData, "projectId");
  const clientId = text(formData, "clientId");
  const title = text(formData, "title");

  if (!title) {
    return;
  }

  if (projectId) {
    const project = await prisma.clientProject.findFirst({
      where: { id: projectId, clientId },
      select: { id: true },
    });
    if (!project) throw new Error("Project does not belong to this client.");
  }

  await prisma.clientMilestone.create({
    data: {
      projectId,
      title,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
}

export async function toggleClientMilestone(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const milestoneId = text(formData, "milestoneId");
  const clientId = text(formData, "clientId");
  const completed = text(formData, "completed") === "true";

  await prisma.clientMilestone.update({
    where: {
      id: milestoneId,
      project: { clientId },
    },
    data: {
      completed,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/client-portal/dashboard");
}

export async function addClientFile(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const projectId = text(formData, "projectId");
  const clientId = text(formData, "clientId");
  const name = text(formData, "name");
  const url = z
    .string()
    .url()
    .refine((value) => Boolean(safeFileUrl(value)), "Use an HTTPS file URL.")
    .parse(text(formData, "url"));

  if (!name || !url) {
    throw new Error("File name and URL are required.");
  }

  if (projectId) {
    const project = await prisma.clientProject.findFirst({
      where: { id: projectId, clientId },
      select: { id: true },
    });
    if (!project) throw new Error("Project does not belong to this client.");
  }

  await prisma.clientFile.create({
    data: {
      projectId,
      name,
      url,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/client-portal/dashboard");
}

export async function addClientInvoice(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clientId = text(formData, "clientId");
  const number = text(formData, "number");
  const title = text(formData, "title");
  const amount = z.coerce
    .number()
    .min(0)
    .max(9999999999.99)
    .parse(text(formData, "amount"));
  const dueDate = text(formData, "dueDate");

  if (!number || !title || !Number.isFinite(amount)) {
    throw new Error("Invoice number, title and amount are required.");
  }

  await prisma.clientInvoice.create({
    data: {
      clientId,
      number,
      title,
      amount,
      status: "SENT",
      dueDate: dueDate ? new Date(`${dueDate}T12:00:00`) : null,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/client-portal/dashboard");
}

export async function updateClientInvoice(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clientId = text(formData, "clientId");
  const invoiceId = text(formData, "invoiceId");
  const status = z.nativeEnum(InvoiceStatus).parse(text(formData, "status"));
  const paid = z.coerce
    .number()
    .min(0)
    .max(9999999999.99)
    .parse(text(formData, "paid") || 0);

  await prisma.clientInvoice.update({
    where: {
      id: invoiceId,
      clientId,
    },
    data: {
      status,
      paid,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/client-portal/dashboard");
}

export async function addClientUpdate(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clientId = text(formData, "clientId");
  const projectId = text(formData, "projectId");
  const title = text(formData, "title");
  const message = text(formData, "message");

  if (!title || !message) {
    throw new Error("Update title and message are required.");
  }

  if (projectId) {
    const project = await prisma.clientProject.findFirst({
      where: { id: projectId, clientId },
      select: { id: true },
    });
    if (!project) throw new Error("Project does not belong to this client.");
  }

  await prisma.clientUpdate.create({
    data: {
      clientId,
      projectId: projectId || null,
      title,
      message,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/client-portal/dashboard");
}

export async function updateSupportStatus(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  const clientId = text(formData, "clientId");
  const supportId = text(formData, "supportId");
  const status = z.nativeEnum(SupportStatus).parse(text(formData, "status"));

  await prisma.supportRequest.update({
    where: {
      id: supportId,
      clientId,
    },
    data: {
      status,
    },
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/client-portal/support");
}
