import { useState } from "react";
import { z } from "zod";
import { subscribeEmail } from "@/lib/backend";
import { track } from "@/lib/analytics";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, { message: "that doesn't look like an email." })
  .max(255, { message: "that email is too long." })
  .email({ message: "that doesn't look like an email." });

type State = "idle" | "saving" | "done" | "error";

export function NotifyForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (state === "saving") return;

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setState("error");
      setMessage(parsed.error.issues[0]?.message ?? "that doesn't look like an email.");
      return;
    }

    setState("saving");
    setMessage(null);

    try {
      await subscribeEmail(parsed.data);
    } catch (error) {
      console.error(error);
      setState("error");
      setMessage("couldn't save that. try again in a bit.");
      return;
    }

    track("notify_submit");
    setState("done");
    setMessage(null);
  };

  if (state === "done") {
    return (
      <div className="w-full max-w-sm" aria-live="polite">
        <p className="font-mono text-[11px] text-accent">
          you&apos;re on the list. we&apos;ll ping when a tab actually closes.
        </p>
        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
          you can close this one now.
        </p>
      </div>
    );
  }

  return (
    <form className="w-full max-w-sm" onSubmit={submit}>
      <label
        htmlFor="notify-email"
        className="block font-mono text-[11px] text-muted-foreground"
      >
        get notified when a tab closes
      </label>
      <p className="mt-1 font-mono text-[11px] text-subtle">
        occasional pings when something ships. nothing else.
      </p>
      <div className="mt-3 flex gap-2">
        <input
          id="notify-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state === "error") {
              setState("idle");
              setMessage(null);
            }
          }}
          maxLength={255}
          placeholder="you@email.com"
          className="min-w-0 flex-1 rounded-md border border-border bg-card/60 px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-accent/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "saving"}
          className="shrink-0 rounded-md border border-accent/50 px-3 py-2 font-mono text-xs text-accent transition-colors hover:bg-accent/10 disabled:opacity-60"
        >
          {state === "saving" ? "saving…" : "notify me"}
        </button>
      </div>
      <p className="mt-2 min-h-4 font-mono text-[11px] text-muted-foreground" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
