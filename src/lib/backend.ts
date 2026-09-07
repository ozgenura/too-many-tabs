/**
 * The only two things on this site that need a backend: the notify list and
 * whatever visitors write in the "open a tab" modal.
 *
 * All content is static in the repo, so instead of the Supabase SDK (~250 KB on
 * every page) this speaks to PostgREST directly. Both tables are insert-only for
 * anon and validate their own input in an RLS policy — see supabase/schema.sql.
 */

const SUPABASE_URL = import.meta.env["VITE_SUPABASE_URL"];
const SUPABASE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

/** Postgres unique-violation. */
const UNIQUE_VIOLATION = "23505";

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY");
  }
}

/** Inserts one row. Returns the Postgres error code when the insert is rejected. */
async function insert(table: string, row: Record<string, unknown>): Promise<string | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) throw new BackendNotConfiguredError();

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });

  if (response.ok) return null;
  const detail = (await response.json().catch(() => null)) as { code?: string } | null;
  return detail?.code ?? `http_${response.status}`;
}

/**
 * Adds an address to the notify list. Resolves for an address that is already
 * subscribed — from the visitor's side that is the same outcome.
 */
export async function subscribeEmail(email: string): Promise<void> {
  const code = await insert("email_subscribers", { email });
  if (code === null || code === UNIQUE_VIOLATION) return;
  throw new Error(`Subscribe failed (${code})`);
}

/** Stores a message from the "open a tab" modal. Email is optional. */
export async function sendInquiry(message: string, email?: string): Promise<void> {
  const trimmed = email?.trim();
  const code = await insert("feedback", {
    message: message.trim(),
    email: trimmed ? trimmed.toLowerCase() : null,
  });
  if (code === null) return;
  throw new Error(`Inquiry failed (${code})`);
}
