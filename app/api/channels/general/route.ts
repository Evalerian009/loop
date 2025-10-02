import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let general = await prisma.channel.findUnique({
      where: { name: "General" },
    });

    // If General channel doesn't exist, create it
    if (!general) {
      general = await prisma.channel.create({
        data: {
          name: "General",
          isDM: false,
        },
      });
      console.log("Created General channel");
    }

    return NextResponse.json(general);
  } catch (err) {
    console.error("Error fetching or creating General channel:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
