import { NextRequest, NextResponse } from "next/server";
import { subscribeToNewsletter } from "@/actions/subscriptionActions";
import { sendMail } from "@/lib/emailService";
import { escapeHtml, isValidEmail } from "@/lib/html";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { unsubscribeUrl } from "@/lib/unsubscribeToken";
import { getStoreSettings } from "@/lib/storeSettings";
import { brand } from "@/config/brand";

export async function POST(request: NextRequest) {
  // Stops bots from using the form to send welcome emails to strangers
  const limited = rateLimit(request, "newsletter", { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const result = await subscribeToNewsletter({
      email,
      source: "footer",
      ipAddress: clientIp(request),
      userAgent: (request.headers.get("user-agent") || "unknown").slice(0, 300),
    });

    // If subscription failed or already subscribed
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.message,
          alreadySubscribed: result.alreadySubscribed || false,
        },
        { status: result.alreadySubscribed ? 200 : 400 }
      );
    }

    const settings = await getStoreSettings();
    const emailResult = await sendMail({
      email,
      subject: `Welcome to the ${settings.storeName} newsletter`,
      text: `Thanks for subscribing to ${settings.storeName}! You'll hear about new arrivals and members-only deals.\n\nShop: ${brand.url}\nUnsubscribe: ${unsubscribeUrl(email)}`,
      html: welcomeEmailHtml({
        email,
        storeName: settings.storeName,
        supportEmail: settings.supportEmail || brand.emails.support,
      }),
    });

    if (!emailResult.success) {
      // Subscription still counts even if the welcome email fails
      console.error("Failed to send welcome email:", emailResult.error);
    }

    return NextResponse.json(
      { message: result.message, subscriptionId: result.data?.subscriptionId },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter subscription API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}

function welcomeEmailHtml({
  email,
  storeName,
  supportEmail,
}: {
  email: string;
  storeName: string;
  supportEmail: string;
}): string {
  const name = escapeHtml(storeName);
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Welcome to ${name}</title></head>
<body style="margin:0;background:#fbf8f3;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1f1a17">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px">
    <div style="background:#1f1a17;border-radius:20px 20px 0 0;padding:32px 28px;color:#fbf8f3">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#e0a23b">The ${name} letter</p>
      <h1 style="margin:8px 0 0;font-size:26px;line-height:1.25">You're on the list.</h1>
    </div>
    <div style="background:#ffffff;border-radius:0 0 20px 20px;padding:28px">
      <p style="margin:0 0 16px;font-size:15px;line-height:1.6">Thanks for subscribing! Expect new arrivals, members-only deals and the occasional store update — never spam.</p>
      <a href="${escapeHtml(brand.url)}" style="display:inline-block;background:#c2542d;color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px">Start shopping</a>
      <p style="margin:24px 0 0;font-size:13px;color:#6b625b">Questions? Reply to this email or write to <a href="mailto:${escapeHtml(supportEmail)}" style="color:#c2542d">${escapeHtml(supportEmail)}</a>.</p>
    </div>
    <p style="margin:16px 0 0;font-size:12px;color:#8a817a;text-align:center">
      You're receiving this because ${escapeHtml(email)} subscribed at ${name}.<br>
      <a href="${escapeHtml(unsubscribeUrl(email))}" style="color:#8a817a">Unsubscribe</a>
    </p>
  </div>
</body>
</html>`;
}
