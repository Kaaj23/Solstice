import type { FragrancePreference } from "./constants";

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export interface Subscriber {
  id: string;
  email: string;
  fragrancePreference: FragrancePreference;
  status: SubscriberStatus;
  consentVersion: string;
  consentAt: Date;
  createdAt: Date;
  confirmationSentAt: Date | null;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
}

export interface ConsentRecord {
  fragrancePreference: FragrancePreference;
  consentVersion: string;
  consentAt: Date;
}

export type WaitlistEventType =
  | "signup_requested"
  | "confirmation_sent"
  | "confirmation_failed"
  | "confirmed"
  | "duplicate_signup"
  | "resubscribe_requested"
  | "preference_updated"
  | "unsubscribed"
  | "erased"
  | "purged";

/**
 * Persistence boundary. Every state change is a single guarded statement
 * (e.g. "confirm, but only if currently pending") so concurrent requests cannot
 * move a subscriber through an illegal transition. Two implementations exist:
 * Postgres (production) and in-memory (local development and tests only).
 */
export interface WaitlistStore {
  findByEmail(email: string): Promise<Subscriber | null>;
  findById(id: string): Promise<Subscriber | null>;

  /** Insert a new pending subscriber. Returns null if the address already exists. */
  insertIfAbsent(email: string, consent: ConsentRecord): Promise<Subscriber | null>;
  /** pending -> pending: record fresh consent / preference. */
  refreshPending(id: string, consent: ConsentRecord): Promise<Subscriber | null>;
  /** unsubscribed -> pending: a fresh sign-up with fresh consent. */
  reopen(id: string, consent: ConsentRecord): Promise<Subscriber | null>;
  markConfirmationSent(id: string, at: Date): Promise<void>;
  /** pending -> confirmed. Returns null if the subscriber is not pending. */
  confirm(id: string, at: Date): Promise<Subscriber | null>;
  /** pending|confirmed -> unsubscribed. Returns null if already unsubscribed or missing. */
  unsubscribe(id: string, at: Date): Promise<Subscriber | null>;
  /** Permanently delete the record. Returns whether a row was removed. */
  erase(id: string): Promise<boolean>;

  recordEvent(
    subscriberId: string | null,
    type: WaitlistEventType,
    meta?: Record<string, string | number | boolean>
  ): Promise<void>;

  /** Count a hit against a fixed window and return the hits so far in that window. */
  hit(key: string, windowSeconds: number, now: Date): Promise<number>;
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

export interface EmailSender {
  /** Resolves when the provider accepted the message; throws otherwise. */
  send(message: EmailMessage): Promise<void>;
}
