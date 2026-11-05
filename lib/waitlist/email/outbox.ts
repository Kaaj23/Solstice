import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { EmailMessage, EmailSender } from "../types";

/**
 * Local-development "email provider": writes each message to a JSON file in a
 * directory instead of sending it. It exists so the double opt-in flow can be
 * exercised end to end on a developer machine without any provider account.
 * `runtime.ts` refuses to use it on Vercel, so it can never stand in for real
 * delivery in a deployment.
 */
export function createFileOutboxSender(directory: string): EmailSender {
  return {
    async send(message: EmailMessage) {
      await mkdir(directory, { recursive: true });
      const file = path.join(directory, `${Date.now()}-${randomUUID()}.json`);
      await writeFile(file, JSON.stringify(message, null, 2), "utf8");
    },
  };
}

/** Collects messages in an array. Used by the automated tests. */
export function createRecordingSender(): EmailSender & {
  sent: EmailMessage[];
  failNext: () => void;
} {
  let shouldFail = false;
  const sent: EmailMessage[] = [];
  return {
    sent,
    failNext() {
      shouldFail = true;
    },
    async send(message) {
      if (shouldFail) {
        shouldFail = false;
        throw new Error("simulated provider failure");
      }
      sent.push(message);
    },
  };
}
