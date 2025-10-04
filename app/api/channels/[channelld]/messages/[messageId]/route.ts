// app/api/channels/[channelId]/messages/[messageId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession, ApiError, errorResponse } from "@/lib/api-helpers";
import { updateMessageSchema } from "@/lib/validators";

// --- PATCH: Update a message ---
export async function PATCH(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const session = await requireSession();

    // Type-safety: ensure email exists
    const email = session.user?.email;
    if (!email) throw new ApiError("UNAUTHORIZED", "No email found in session", 401);

    const body = updateMessageSchema.parse(await req.json());

    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
      include: { user: true },
    });
    if (!message) throw new ApiError("MESSAGE_NOT_FOUND", "Message not found", 404);

    if (message.user.email !== email)
      throw new ApiError("FORBIDDEN", "You cannot edit this message", 403);

    const updated = await prisma.message.update({
      where: { id: params.messageId },
      data: { content: body.content },
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error);
  }
}

// --- DELETE: Soft-delete a message ---
export async function DELETE(
  req: Request,
  { params }: { params: { channelId: string; messageId: string } }
) {
  try {
    const session = await requireSession();

    const email = session.user?.email;
    if (!email) throw new ApiError("UNAUTHORIZED", "No email found in session", 401);

    const message = await prisma.message.findUnique({
      where: { id: params.messageId },
      include: { user: true },
    });
    if (!message) throw new ApiError("MESSAGE_NOT_FOUND", "Message not found", 404);

    if (message.user.email !== email)
      throw new ApiError("FORBIDDEN", "You cannot delete this message", 403);

    const deleted = await prisma.message.update({
      where: { id: params.messageId },
      data: { isDeleted: true, content: "[deleted]" },
      include: { user: true },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    return errorResponse(error);
  }
}