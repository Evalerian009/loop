// app/api/channels/general/route.ts
import { errorResponse } from "@/lib/api-helpers";   // only errorResponse needed
import { getOrCreateGeneralChannel } from "@/lib/channel-helpers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const general = await getOrCreateGeneralChannel();
    return NextResponse.json(general);
  } catch (err) {
    return errorResponse(err);
  }
}
