import type {
  ConsentRecord,
  Subscriber,
  WaitlistEventType,
  WaitlistStore,
} from "../types";

/**
 * In-memory store for local development and automated tests ONLY.
 *
 * It loses everything when the process restarts and is not shared between
 * serverless instances, so `runtime.ts` refuses to use it on Vercel. It mirrors
 * the guarded transitions of the Postgres store exactly; scripts/verify-waitlist.ts
 * runs the same lifecycle suite against both.
 */
export interface MemoryEvent {
  subscriberId: string | null;
  type: WaitlistEventType;
  meta: Record<string, string | number | boolean>;
}

export interface MemoryStore extends WaitlistStore {
  readonly events: MemoryEvent[];
  readonly all: () => Subscriber[];
}

export function createMemoryStore(): MemoryStore {
  const byId = new Map<string, Subscriber>();
  const byEmail = new Map<string, string>();
  const limits = new Map<string, { start: number; hits: number }>();
  const events: MemoryEvent[] = [];

  const clone = (s: Subscriber): Subscriber => ({ ...s });
  const get = (id: string) => byId.get(id) ?? null;

  return {
    events,
    all: () => [...byId.values()].map(clone),

    async findByEmail(email) {
      const id = byEmail.get(email);
      const found = id ? get(id) : null;
      return found ? clone(found) : null;
    },

    async findById(id) {
      const found = get(id);
      return found ? clone(found) : null;
    },

    async insertIfAbsent(email, consent) {
      if (byEmail.has(email)) return null;
      const subscriber: Subscriber = {
        id: crypto.randomUUID(),
        email,
        fragrancePreference: consent.fragrancePreference,
        status: "pending",
        consentVersion: consent.consentVersion,
        consentAt: consent.consentAt,
        createdAt: consent.consentAt,
        confirmationSentAt: null,
        confirmedAt: null,
        unsubscribedAt: null,
      };
      byId.set(subscriber.id, subscriber);
      byEmail.set(email, subscriber.id);
      return clone(subscriber);
    },

    async refreshPending(id, consent: ConsentRecord) {
      const s = get(id);
      if (!s || s.status !== "pending") return null;
      s.fragrancePreference = consent.fragrancePreference;
      s.consentVersion = consent.consentVersion;
      s.consentAt = consent.consentAt;
      return clone(s);
    },

    async reopen(id, consent: ConsentRecord) {
      const s = get(id);
      if (!s || s.status !== "unsubscribed") return null;
      s.status = "pending";
      s.fragrancePreference = consent.fragrancePreference;
      s.consentVersion = consent.consentVersion;
      s.consentAt = consent.consentAt;
      s.confirmationSentAt = null;
      s.confirmedAt = null;
      s.unsubscribedAt = null;
      return clone(s);
    },

    async markConfirmationSent(id, at) {
      const s = get(id);
      if (s && s.status === "pending") s.confirmationSentAt = at;
    },

    async confirm(id, at) {
      const s = get(id);
      if (!s || s.status !== "pending") return null;
      s.status = "confirmed";
      s.confirmedAt = at;
      return clone(s);
    },

    async unsubscribe(id, at) {
      const s = get(id);
      if (!s || s.status === "unsubscribed") return null;
      s.status = "unsubscribed";
      s.unsubscribedAt = at;
      return clone(s);
    },

    async erase(id) {
      const s = get(id);
      if (!s) return false;
      byId.delete(id);
      byEmail.delete(s.email);
      return true;
    },

    async recordEvent(subscriberId, type, meta = {}) {
      events.push({ subscriberId, type, meta });
    },

    async hit(key, windowSeconds, now) {
      const current = limits.get(key);
      if (!current || now.getTime() - current.start >= windowSeconds * 1000) {
        limits.set(key, { start: now.getTime(), hits: 1 });
        return 1;
      }
      current.hits += 1;
      return current.hits;
    },
  };
}
