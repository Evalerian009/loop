import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content } = await req.json();
  if (!content) {
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  }

  // Get current user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ensure the message belongs to this user
  const message = await prisma.message.findUnique({
    where: { id: params.id },
  });
  if (!message || message.userId !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const updated = await prisma.message.update({
    where: { id: params.id },
    data: { content },
    include: { user: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get current user
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Ensure the message belongs to this user
  const message = await prisma.message.findUnique({
    where: { id: params.id },
  });
  if (!message || message.userId !== user.id) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  const deleted = await prisma.message.update({
    where: { id: params.id },
    data: { isDeleted: true, content: "[deleted]" },
    include: { user: true },
  });

  return NextResponse.json(deleted);
}