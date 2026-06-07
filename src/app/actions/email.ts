"use server";

import { env } from "@/config/env";

type SendResult = { success: boolean; error?: string };

function buildWelcomeHtml(name?: string) {
  const safeName = name ? name : "there";
  return `
  <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111">
    <h1 style="color:#0b63d6">Welcome to Bookmark App, ${safeName}!</h1>
    <p>Thanks for signing up. Start saving your favorite links — your bookmarks are private by default, but you can make them public.</p>
    <p>Get started: <a href="${env.NEXT_PUBLIC_APP_URL}/dashboard">Open your dashboard</a></p>
    <hr />
    <p style="font-size:12px; color:#666">If you didn't create an account, you can ignore this email.</p>
  </div>
  `;
}

export async function sendWelcomeEmail(to: string, name?: string): Promise<SendResult> {
  const apiKey = env.RESEND_API_KEY;
  const from = env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    console.error("Missing RESEND_API_KEY — cannot send email");
    return { success: false, error: "Email service not configured" };
  }

  const html = buildWelcomeHtml(name);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: "Welcome to Bookmark App",
        html,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Resend error:", res.status, text);
      return { success: false, error: `Send failed: ${res.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send email:", err);
    return { success: false, error: String(err) };
  }
}
