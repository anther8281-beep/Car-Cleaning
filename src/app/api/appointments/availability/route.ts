import { NextResponse } from "next/server";
import { getAvailability } from "@/lib/booking";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  if (!date) {
    return NextResponse.json({ error: "date is required." }, { status: 400 });
  }

  const result = await getAvailability(date);
  if (!result) {
    return NextResponse.json({ error: "Invalid date." }, { status: 400 });
  }
  return NextResponse.json(result);
}
