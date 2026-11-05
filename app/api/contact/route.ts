import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const URL_RE = /https?:\/\/[^\s]+|www\.[^\s]+/gi;
const GENERIC_ERROR = "Something went wrong. Please try again.";
const RATE_LIMIT_MSG = "Too many requests. Please try again later.";

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
  startedAt?: number | string;
  /** Honeypot — must be empty */
  website_url?: string;
  [key: string]: unknown;
};

/** Best-effort in-memory rate limit (per server instance). */
const rateMap = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;

function allowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const prev = rateMap.get(ip) || [];
  const recent = prev.filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    rateMap.set(ip, recent);
    return false;
  }
  recent.push(now);
  rateMap.set(ip, recent);
  return true;
}

function singleLine(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

function multiLine(v: unknown, max: number): string {
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

function countUrls(...parts: string[]): number {
  let n = 0;
  for (const p of parts) {
    const m = p.match(URL_RE);
    if (m) n += m.length;
  }
  return n;
}

function row(label: string, value: string): string {
  if (!value) return "";
  return `<tr><td style="padding:6px 12px 6px 0;vertical-align:top;color:#64748b;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:6px 0;color:#0f172a">${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`;
}

function silentOk() {
  return NextResponse.json({ ok: true });
}

function genericFail(status = 500) {
  return NextResponse.json({ error: GENERIC_ERROR }, { status });
}

export async function POST(req: Request) {
  try {
    const origins = allowedOrigins();
    const origin = req.headers.get("origin") || "";
    if (origins.length === 0) {
      console.warn("contact: ALLOWED_ORIGINS empty or missing — rejecting");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    if (!origin || !origins.includes(origin)) {
      console.warn("contact: rejected origin", origin);
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let body: LeadPayload;
    try {
      body = (await req.json()) as LeadPayload;
    } catch {
      console.error("contact: invalid JSON body");
      return genericFail(400);
    }

    // Honeypot — bots fill hidden fields; humans leave them empty (not rate-limited)
    if (singleLine(body.website_url, 200)) {
      return silentOk();
    }

    // Time check — missing / invalid / future / too fast = bot (not rate-limited)
    const startedRaw = body.startedAt;
    const startedAt =
      typeof startedRaw === "number"
        ? startedRaw
        : typeof startedRaw === "string"
          ? Number(startedRaw)
          : NaN;
    const now = Date.now();
    if (!Number.isFinite(startedAt) || startedAt > now) {
      return silentOk();
    }
    if (now - startedAt < 3000) {
      return silentOk();
    }

    const ip = clientIp(req);
    if (!checkRateLimit(ip)) {
      console.warn("contact: rate limited", ip);
      return NextResponse.json({ error: RATE_LIMIT_MSG }, { status: 429 });
    }

    const formName = singleLine(body.formName, 120) || "Website form";
    const name = singleLine(body.name, 100);
    const email = singleLine(body.email, 150);
    const phone = singleLine(body.phone, 30);
    const company = singleLine(body.company, 160);
    const website = singleLine(body.website, 300);
    const service = singleLine(body.service || body.topic, 200);
    const message = multiLine(body.message, 3000);
    const date = singleLine(body.date, 120);
    const time = singleLine(body.time, 120);
    const page = singleLine(body.page, 500) || singleLine(body.source, 500);
    const timestamp = new Date().toISOString();

    if (!name || name.length < 2) {
      return NextResponse.json(
        { error: "Please tell us your name." },
        { status: 400 }
      );
    }
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const isBooking = /book/i.test(formName);
    if (isBooking && (!date || !time)) {
      return NextResponse.json(
        { error: "Please choose a date and time." },
        { status: 400 }
      );
    }

    if (countUrls(message) > 2) {
      console.warn("contact: too many URLs", { formName, ip });
      return genericFail(400);
    }

    const host = process.env.SMTP_HOST?.trim();
    const portRaw = process.env.SMTP_PORT?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();
    const mailTo = process.env.MAIL_TO?.trim();

    if (!host || !portRaw || !user || !pass || !mailTo) {
      console.error("contact: SMTP env incomplete");
      return genericFail(500);
    }

    const port = Number(portRaw);
    if (!Number.isFinite(port) || port <= 0) {
      console.error("contact: invalid SMTP_PORT", portRaw);
      return genericFail(500);
    }

    const subject = `New enquiry: ${formName}`;

    const html = `
    <div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:#0f172a">
      <h2 style="margin:0 0 12px;font-size:18px">New enquiry: ${escapeHtml(formName)}</h2>
      <table style="border-collapse:collapse">${[
        row("Form", formName),
        row("Name", name),
        row("Email", email),
        row("Phone", phone),
        row("Company", company),
        row("Website", website),
        row("Service", service),
        row("Date", date),
        row("Time", time),
        row(/question/i.test(formName) ? "Your question" : "Message", message),
        row("Page / source", page),
        row("Submitted at", timestamp),
      ].join("")}</table>
    </div>
  `;

    const text = [
      `New enquiry: ${formName}`,
      `Form: ${formName}`,
      `Name: ${name}`,
      `Email: ${email}`,
      phone && `Phone: ${phone}`,
      company && `Company: ${company}`,
      website && `Website: ${website}`,
      service && `Service: ${service}`,
      date && `Date: ${date}`,
      time && `Time: ${time}`,
      message &&
        `${/question/i.test(formName) ? "Your question" : "Message"}:\n${message}`,
      page && `Page / source: ${page}`,
      `Submitted at: ${timestamp}`,
    ]
      .filter(Boolean)
      .join("\n");

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: user,
      to: mailTo,
      replyTo: email,
      subject,
      text,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact: unexpected error", err);
    return genericFail(500);
  }
}
