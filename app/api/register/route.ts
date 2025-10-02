// app/api/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    // Find General channel
    const generalChannel = await prisma.channel.findUnique({
      where: { name: "General" },
    });

    if (generalChannel) {
      // Add user to General channel
      await prisma.channelMember.create({
        data: {
          userId: user.id,
          channelId: generalChannel.id,
        },
      });
    }

    return NextResponse.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}