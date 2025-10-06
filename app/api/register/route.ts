import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // sanitize inputs
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // prevent duplicate email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: { name: cleanName, email: cleanEmail, password: hashedPassword },
    });

    // ensure "General" channel exists
    const generalChannel = await prisma.channel.upsert({
      where: { name: "General" },
      update: {},
      create: { name: "General" },
    });

    // add user to "General" channel
    await prisma.channelMember.create({
      data: {
        userId: user.id,
        channelId: generalChannel.id,
      },
    });

    return NextResponse.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}