import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const clientId = process.env.BLOGGER_CLIENT_ID;

  if (!clientId) {
    return NextResponse.json(
      { error: "BLOGGER_CLIENT_ID not found in .env" },
      { status: 400 }
    );
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/blogger/callback`;
  const scope = encodeURIComponent("https://www.googleapis.com/auth/blogger");

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&access_type=offline&prompt=consent`;

  return NextResponse.redirect(googleAuthUrl);
}
