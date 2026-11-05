import type { EmailMessage, EmailSender } from "../types";

/**
 * Resend (https://resend.com) transactional email over plain `fetch`, so no SDK
 * is needed. Swapping providers means writing another `EmailSender`.
 *
 * Errors deliberately carry only the HTTP status: provider responses can echo
 * the recipient address, and addresses must not end up in logs.
 */
export class EmailDeliveryError extends Error {
  constructor(readonly status: number) {
    super(`Email provider rejected the message (HTTP ${status}).`);
    this.name = "EmailDeliveryError";
  }
}

export function createResendSender(options: {
  apiKey: string;
  from: string;
  fetchImpl?: typeof fetch;
}): EmailSender {
  const doFetch = options.fetchImpl ?? fetch;

  return {
    async send(message: EmailMessage) {
      const response = await doFetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: options.from,
          to: [message.to],
          subject: message.subject,
          html: message.html,
          text: message.text,
          headers: message.headers,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!response.ok) throw new EmailDeliveryError(response.status);
    },
  };
}
