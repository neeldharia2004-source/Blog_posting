import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: `Google OAuth Error: ${error}` }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No authorization code received" }, { status: 400 });
  }

  const clientId = process.env.BLOGGER_CLIENT_ID;
  const clientSecret = process.env.BLOGGER_CLIENT_SECRET;
  const redirectUri = `${req.nextUrl.origin}/api/auth/blogger/callback`;

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: tokenData.error_description || tokenData.error || "Failed to exchange token" },
        { status: 500 }
      );
    }

    const refreshToken = tokenData.refresh_token;

    if (refreshToken) {
      // Auto-update .env file
      const envPath = path.join(process.cwd(), ".env");
      let envContent = fs.readFileSync(envPath, "utf-8");

      if (envContent.includes("BLOGGER_REFRESH_TOKEN=")) {
        envContent = envContent.replace(
          /BLOGGER_REFRESH_TOKEN="?.*"?/,
          `BLOGGER_REFRESH_TOKEN="${refreshToken}"`
        );
      } else {
        envContent += `\nBLOGGER_REFRESH_TOKEN="${refreshToken}"\n`;
      }

      fs.writeFileSync(envPath, envContent, "utf-8");
      process.env.BLOGGER_REFRESH_TOKEN = refreshToken;
    }

    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Blogger Authorization Successful</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #0f172a; }
            .card { background: white; padding: 2.5rem; border-radius: 1.5rem; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; max-width: 480px; }
            .badge { display: inline-flex; align-items: center; background: #ecfdf5; color: #047857; font-weight: bold; padding: 0.5rem 1rem; border-radius: 9999px; margin-bottom: 1rem; }
            h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
            p { font-size: 0.875rem; color: #64748b; line-height: 1.5; margin-bottom: 1.5rem; }
            a { display: inline-block; background: #4f46e5; color: white; padding: 0.75rem 1.5rem; border-radius: 0.75rem; text-decoration: none; font-weight: bold; font-size: 0.875rem; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="badge">✓ Connected</div>
            <h1>Blogger Authorization Successful!</h1>
            <p>Your Google Blogger OAuth refresh token has been saved to your environment. You can now publish approved blogs directly to your Blogger site.</p>
            <a href="/publishing">Return to Publishing Hub</a>
          </div>
        </body>
      </html>
      `,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "OAuth exchange failed" }, { status: 500 });
  }
}
