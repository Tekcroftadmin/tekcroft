/** Absolute logo URL. Gmail blocks relative paths and data URIs. */
export const LOGO_URL = "https://www.tekcroft.com/tekcroft-logo.png";

export type EnquiryEmailInput = {
  formName: string;
  name: string;
  email: string;
  phone?: string;
  service?: string;
  company?: string;
  website?: string;
  message?: string;
  /** Shown above the message text. Defaults to "Message". */
  messageLabel?: string;
  /** Appointment date from a booking form, not the footer date. */
  date?: string;
  time?: string;
  page?: string;
  submittedAt?: Date;
};

type DetailRow = {
  label: string;
  html: string;
  text: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function filled(value: string | undefined): string {
  return (value || "").trim();
}

function formatLongDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Denver",
  }).format(d);
}

function formatYear(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    timeZone: "America/Denver",
  }).format(d);
}

function phoneHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (!cleaned || !/\d/.test(cleaned)) return "";
  return `tel:${cleaned}`;
}

function httpUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

function textCell(value: string): string {
  return escapeHtml(value);
}

function linkCell(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="color:#0096D5; text-decoration:none;">${escapeHtml(label)}</a>`;
}

function linkedOrText(value: string): string {
  const href = httpUrl(value);
  return href ? linkCell(href, value) : textCell(value);
}

function detailRows(input: EnquiryEmailInput): DetailRow[] {
  const rows: DetailRow[] = [];
  const name = filled(input.name);
  const email = filled(input.email);
  const phone = filled(input.phone);
  const service = filled(input.service);
  const company = filled(input.company);
  const website = filled(input.website);
  const date = filled(input.date);
  const time = filled(input.time);
  const page = filled(input.page);

  if (name) rows.push({ label: "Name", html: textCell(name), text: name });
  if (email) {
    rows.push({
      label: "Email",
      html: linkCell(`mailto:${email}`, email),
      text: email,
    });
  }
  if (phone) {
    const href = phoneHref(phone);
    rows.push({
      label: "Phone",
      html: href ? linkCell(href, phone) : textCell(phone),
      text: phone,
    });
  }
  if (service) rows.push({ label: "Service", html: textCell(service), text: service });
  if (company) rows.push({ label: "Company", html: textCell(company), text: company });
  if (website) rows.push({ label: "Website", html: linkedOrText(website), text: website });
  if (date) rows.push({ label: "Date", html: textCell(date), text: date });
  if (time) rows.push({ label: "Time", html: textCell(time), text: time });
  if (page) rows.push({ label: "Page", html: linkedOrText(page), text: page });
  return rows;
}

function renderRows(rows: DetailRow[]): string {
  return rows
    .map((row, index) => {
      const border =
        index === rows.length - 1 ? "" : " border-bottom:1px solid #EEF2F5;";
      return `<tr>
                  <td style="padding:9px 0;${border} font-size:11px; letter-spacing:.5px; text-transform:uppercase; color:#A6B4C0; width:30%; vertical-align:top;">${escapeHtml(row.label)}</td>
                  <td style="padding:9px 0;${border} font-size:14px; color:#15242F; vertical-align:top;">${row.html}</td>
                </tr>`;
    })
    .join("\n");
}

function messageBlock(label: string, message: string): string {
  const html = escapeHtml(message).replace(/\n/g, "<br>");
  return `<tr>
            <td style="padding:16px 32px 0 32px;">
              <p style="margin:0 0 6px 0; font-size:11px; letter-spacing:.5px; text-transform:uppercase; color:#A6B4C0;">${escapeHtml(label)}</p>
              <p style="margin:0; font-size:14px; line-height:1.55; color:#15242F;">${html}</p>
            </td>
          </tr>`;
}

export function buildEnquiryEmail(input: EnquiryEmailInput): {
  html: string;
  text: string;
} {
  const submittedAt = input.submittedAt ?? new Date();
  const submittedOn = formatLongDate(submittedAt);
  const year = formatYear(submittedAt);
  const formName = filled(input.formName) || "Website form";
  const name = filled(input.name);
  const email = filled(input.email);
  const service = filled(input.service);
  const message = filled(input.message);
  const messageLabel = filled(input.messageLabel) || "Message";
  const rows = detailRows(input);
  const preheaderService = service ? ` &mdash; ${escapeHtml(service)}` : "";

  const details = rows.length
    ? `<tr>
            <td style="padding:18px 32px 0 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${renderRows(rows)}
              </table>
            </td>
          </tr>`
    : "";

  const messageSection = message ? messageBlock(messageLabel, message) : "";

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>New enquiry — Tekcroft</title>
</head>
<body style="margin:0; padding:0; background:#EDF1F4; -webkit-font-smoothing:antialiased;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">New enquiry from ${escapeHtml(name)}${preheaderService}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EDF1F4; padding:24px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(14,34,49,.08); font-family:'Helvetica Neue',Arial,Helvetica,sans-serif;">

          <tr>
            <td style="padding:18px 32px; border-bottom:1px solid #EDF1F4;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <img src="${LOGO_URL}" alt="Tekcroft" width="140" height="28" style="display:block; height:28px; width:auto; border:0;">
                  </td>
                  <td align="right" style="vertical-align:middle; font-size:11px; font-weight:bold; letter-spacing:1.3px; text-transform:uppercase; color:#A6B4C0;">New enquiry</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:22px 32px 0 32px;">
              <h1 style="margin:0; font-size:20px; line-height:1.3; font-weight:bold; color:#0E2231; letter-spacing:-.3px;">You have a new enquiry</h1>
              <p style="margin:7px 0 0 0; font-size:14px; line-height:1.55; color:#64788A;">Submitted through the <strong style="color:#0E2231; font-weight:bold;">${escapeHtml(formName)}</strong> form on your website.</p>
            </td>
          </tr>

          ${details}

          ${messageSection}

          <tr>
            <td style="padding:20px 32px 22px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="border-radius:8px; background:#0096D5;">
                    <a href="mailto:${escapeHtml(email)}" style="display:inline-block; padding:12px 26px; font-size:14px; font-weight:bold; color:#ffffff; text-decoration:none; border-radius:8px;">Reply to ${escapeHtml(name)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 32px; background:#F6F8FA; border-top:1px solid #EDF1F4;">
              <img src="${LOGO_URL}" alt="Tekcroft" width="112" height="22" style="display:block; height:22px; width:auto; border:0; margin-bottom:9px; opacity:.9;">
              <p style="margin:0 0 4px 0; font-size:11px; line-height:1.5; color:#8495A3;">30 N Gould St Ste N, Sheridan, Wyoming 82801, United States</p>
              <p style="margin:0 0 4px 0; font-size:11px; line-height:1.5; color:#9AA8B5;">Sent because a contact form was submitted on <a href="https://www.tekcroft.com" style="color:#0096D5; text-decoration:none;">tekcroft.com</a> on ${escapeHtml(submittedOn)}.</p>
              <p style="margin:0; font-size:11px; color:#AEBAC5;">&copy; ${escapeHtml(year)} Tekcroft. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const textLines = [
    `New enquiry from ${name}${service ? ` — ${service}` : ""}`,
    "",
    "You have a new enquiry",
    `Submitted through the ${formName} form on your website.`,
    "",
    ...rows.map((row) => `${row.label}: ${row.text}`),
  ];
  if (message) {
    textLines.push("", `${messageLabel}:`, message);
  }
  textLines.push(
    "",
    `Reply to ${name}: ${email}`,
    "",
    "30 N Gould St Ste N, Sheridan, Wyoming 82801, United States",
    `Sent because a contact form was submitted on tekcroft.com on ${submittedOn}.`,
    `© ${year} Tekcroft. All rights reserved.`
  );

  return { html, text: textLines.join("\n") };
}
