import type { EmailMessage } from "../types";
import type { FragrancePreference } from "../constants";

/**
 * The double opt-in confirmation email.
 *
 * Email clients cannot load web fonts, so the editorial serif falls back to
 * Georgia; the layout is a single column, inline-styled for client support, and
 * restrained like the site (midnight, ivory, a single gold accent). It makes no
 * claim about launch dates, offers or availability.
 */

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const INTEREST_LABEL: Record<FragrancePreference, string> = {
  all: "all four fragrances",
  aurora: "Aurora",
  eclipse: "Eclipse",
  corona: "Corona",
  nocturne: "Nocturne",
};

export interface ConfirmationEmailInput {
  to: string;
  fragrance: FragrancePreference;
  confirmUrl: string;
  unsubscribeUrl: string;
  /** RFC 8058 one-click endpoint (POST). */
  oneClickUnsubscribeUrl: string;
  privacyUrl: string;
}

export function buildConfirmationEmail(input: ConfirmationEmailInput): EmailMessage {
  const interest = INTEREST_LABEL[input.fragrance];
  const subject = "Confirm your place on the SOLSTICE list";

  const text = [
    "SOLSTICE — Scents Defined by Light",
    "",
    "Thank you for your interest in SOLSTICE.",
    "",
    `Please confirm your email address to receive fragrance development updates and launch announcements (interest: ${interest}):`,
    "",
    input.confirmUrl,
    "",
    "If you did not ask to join, ignore this message. You will not be subscribed unless you confirm, and the link expires in 7 days.",
    "",
    "SOLSTICE fragrances are concepts in development and are not yet available to purchase.",
    "",
    `Unsubscribe at any time: ${input.unsubscribeUrl}`,
    `Privacy notice: ${input.privacyUrl}`,
  ].join("\n");

  const confirm = escapeHtml(input.confirmUrl);
  const unsub = escapeHtml(input.unsubscribeUrl);
  const privacy = escapeHtml(input.privacyUrl);

  const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#050505;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Confirm your email to hear from SOLSTICE.</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050505;">
      <tr>
        <td align="center" style="padding:48px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-size:22px;letter-spacing:0.3em;color:#e8d6a4;padding-bottom:8px;">SOLSTICE</td>
            </tr>
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:15px;color:#9a9486;padding-bottom:40px;">Scents Defined by Light</td>
            </tr>
            <tr>
              <td style="font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.15;color:#f5f0e8;padding-bottom:24px;">Confirm your place on the list.</td>
            </tr>
            <tr>
              <td style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#cfc9bb;padding-bottom:32px;">
                Thank you for your interest in SOLSTICE. Confirm your email address to receive fragrance development updates and launch announcements. You told us you are most curious about ${escapeHtml(interest)}.
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:32px;">
                <a href="${confirm}" style="display:inline-block;border:1px solid #d4af37;color:#e9d6a0;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:12px;letter-spacing:0.22em;text-transform:uppercase;padding:16px 32px;">Confirm my email</a>
              </td>
            </tr>
            <tr>
              <td style="font-family:Helvetica,Arial,sans-serif;font-size:13px;line-height:1.7;color:#8d887b;padding-bottom:32px;">
                If the button does not work, paste this link into your browser:<br />
                <a href="${confirm}" style="color:#b9a45f;word-break:break-all;">${confirm}</a><br /><br />
                If you did not ask to join, ignore this message. You will not be subscribed unless you confirm, and the link expires in 7 days.
              </td>
            </tr>
            <tr>
              <td style="border-top:1px solid #26262b;padding-top:24px;font-family:Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#6f6b61;">
                SOLSTICE fragrances are concepts in development and are not yet available to purchase.<br />
                <a href="${unsub}" style="color:#8d887b;">Unsubscribe</a> &nbsp;·&nbsp; <a href="${privacy}" style="color:#8d887b;">Privacy notice</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    to: input.to,
    subject,
    html,
    text,
    headers: {
      "List-Unsubscribe": `<${input.oneClickUnsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}
