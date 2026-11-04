import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const TO = "admin@tekcroft.com";
const FROM =
  process.env.CONTACT_FROM?.trim() ||
  "Tekcroft Website <onboarding@resend.dev>";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

type LeadPayload = {
  formName?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  website?: string;
  service?: string;
  topic?: string;
  message?: string;
  date?: string;
  time?: string;
  page?: string;
  source?: string;
  /** Honeypot — must be empty */
  website_url?: string;
  [key: string]: unknown;
};

function str(v: unknown, max = 2000): string {
  if (typeof v !== "string") return "";
  return v.trim().slice(0, max);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string): string {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#64748b;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
}

export async function POST(req: Request) {
  let body: LeadPayload;
  try {
    body = (await req.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot — bots fill hidden fields; humans leave them empty
  if (str(body.website_url, 200)) {
    return NextResponse.json({ ok: true });
  }

  const formName = str(body.formName, 120) || "Website form";
  const name = str(body.name, 120);
  const email = str(body.email, 160);
  const phone = str(body.phone, 60);
  const company = str(body.company, 160);
  const website = str(body.website, 300);
  const service = str(body.service || body.topic, 200);
  const message = str(body.message, 5000);
  const date = str(body.date, 120);
  const time = str(body.time, 120);
  const page = str(body.page, 500) || str(body.source, 500);
  const timestamp = new Date().toISOString();

  if (!name || name.length < 2) {
    return NextResponse.json({ error: "Please tell us your name." }, { status: 400 });
  }
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { error: "Please provide a valid email address." },
      { status: 400 }
    );
  }

  // Booking form requires a chosen slot
  const isBooking = /book/i.test(formName);
  if (isBooking && (!date || !time)) {
    return NextResponse.json(
      { error: "Please choose a date and time." },
      { status: 400 }
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error("contact: RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Email service is not configured. Set RESEND_API_KEY in .env.local." },
      { status: 500 }
    );
  }

  const subject = `New ${formName} — ${name}`;

  const html = `
    <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px;font-size:18px">New ${escapeHtml(formName)}</h2>
      <table style="border-collapse:collapse">${[
        row("Name", name),
        row("Email", email),
        row("Phone", phone),
        row("Company", company),
        row("Website", website),
        row("Service", service),
        row("Date", date),
        row("Time", time),
        row(/question/i.test(formName) ? "Your question" : "Message / goals", message),
        row("Page / source", page),
        row("Submitted at", timestamp),
      ].join("")}</table>
    </div>
  `;

  const text = [
    `New ${formName}`,
    `Name: ${name}`,
    `Email: ${email}`,
    phone && `Phone: ${phone}`,
    company && `Company: ${company}`,
    website && `Website: ${website}`,
    service && `Service: ${service}`,
    date && `Date: ${date}`,
    time && `Time: ${time}`,
    message &&
      `${/question/i.test(formName) ? "Your question" : "Message / goals"}:\n${message}`,
    page && `Page / source: ${page}`,
    `Submitted at: ${timestamp}`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: [TO],
      replyTo: email,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("contact: Resend error", error);
      return NextResponse.json(
        { error: "We could not send your message. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err) {
    console.error("contact: unexpected error", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
