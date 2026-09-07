import type { ReactNode } from "react";
import { CodeBlock } from "@/components/CodeBlock";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/`|\*\*|\*/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Wrap query matches in a highlight mark. */
function withQuery(text: string, query: string, keyPrefix: string): ReactNode[] {
  if (!query) return [text];
  const re = new RegExp(escapeRegExp(query), "gi");
  const nodes: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    nodes.push(
      <mark key={`${keyPrefix}-m${i++}`} className="rounded bg-accent/25 px-0.5 text-accent">
        {m[0]}
      </mark>,
    );
    last = m.index + m[0].length;
    if (m[0].length === 0) break;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Inline formatting: `code`, **bold**, *italic*, [text](url) */
function renderInline(text: string, keyPrefix: string, query = ""): ReactNode[] {
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  const plain = (chunk: string, key: string) => withQuery(chunk, query, key);

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(...plain(text.slice(last, match.index), `${keyPrefix}-t${i}`));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;

    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-secondary px-1.5 py-0.5 text-[0.85em] text-accent"
        >
          {plain(token.slice(1, -1), `${key}-c`)}
        </code>,
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {plain(token.slice(2, -2), `${key}-b`)}
        </strong>,
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={key} className="italic">
          {plain(token.slice(1, -1), `${key}-i`)}
        </em>,
      );
    } else {
      const label = token.slice(1, token.indexOf("]"));
      const href = token.slice(token.indexOf("(") + 1, -1);
      nodes.push(
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent"
        >
          {plain(label, `${key}-a`)}
        </a>,
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) nodes.push(...plain(text.slice(last), `${keyPrefix}-t${i}`));
  return nodes;
}

type Block =
  | { type: "h1" | "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "hr" }
  | { type: "ul"; items: string[] }
  | { type: "code"; text: string; lang: string };

export type Heading = { level: 1 | 2 | 3; text: string; id: string };

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] | null = null;
  let fence: { lang: string; lines: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ") });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list?.length) blocks.push({ type: "ul", items: list });
    list = null;
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
  };

  for (const raw of lines) {
    const fenceMatch = /^\s*```\s*([\w+-]*)\s*$/.exec(raw);
    if (fence) {
      if (fenceMatch) {
        blocks.push({ type: "code", text: fence.lines.join("\n"), lang: fence.lang });
        fence = null;
      } else {
        fence.lines.push(raw);
      }
      continue;
    }
    if (fenceMatch) {
      flushAll();
      fence = { lang: fenceMatch[1] ?? "", lines: [] };
      continue;
    }

    const line = raw.trim();

    if (!line) {
      flushAll();
      continue;
    }
    if (/^(-{3,}|\*{3,})$/.test(line)) {
      flushAll();
      blocks.push({ type: "hr" });
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushAll();
      const level = (heading[1] ?? "#").length;
      blocks.push({
        type: level === 1 ? "h1" : level === 2 ? "h2" : "h3",
        text: heading[2] ?? "",
      });
      continue;
    }
    if (line.startsWith("> ")) {
      flushAll();
      blocks.push({ type: "quote", text: line.slice(2) });
      continue;
    }
    const item = /^[-*]\s+(.*)$/.exec(line);
    if (item) {
      flushParagraph();
      list = list ?? [];
      list.push(item[1] ?? "");
      continue;
    }
    flushList();
    paragraph.push(line);
  }

  if (fence) blocks.push({ type: "code", text: fence.lines.join("\n"), lang: fence.lang });
  flushAll();
  return blocks;
}

export function extractHeadings(md: string): Heading[] {
  const seen = new Map<string, number>();
  const headings: Heading[] = [];
  for (const block of parse(md)) {
    if (block.type !== "h1" && block.type !== "h2" && block.type !== "h3") continue;
    const base = slugify(block.text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    headings.push({
      level: block.type === "h1" ? 1 : block.type === "h2" ? 2 : 3,
      text: block.text.replace(/`|\*\*|\*/g, ""),
      id: count === 0 ? base : `${base}-${count}`,
    });
  }
  return headings;
}

function AnchorHeading({
  id,
  children,
  className,
  as,
}: {
  id: string;
  children: ReactNode;
  className: string;
  as: "h1" | "h2" | "h3";
}) {
  const Tag = as;
  return (
    <Tag id={id} className={`group scroll-mt-28 ${className}`}>
      {children}
      <a
        href={`#${id}`}
        aria-label={`Link to this section`}
        className="ml-2 font-mono text-accent/0 transition-colors group-hover:text-accent/70"
      >
        #
      </a>
    </Tag>
  );
}

export function Markdown({
  source,
  query = "",
  filter = false,
}: {
  source: string;
  query?: string;
  filter?: boolean;
}) {
  const blocks = parse(source);
  const q = query.trim();
  const needle = q.toLowerCase();
  const slugCount = new Map<string, number>();

  const nextId = (text: string) => {
    const base = slugify(text) || "section";
    const count = slugCount.get(base) ?? 0;
    slugCount.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };

  const matches = (block: Block) => {
    if (!needle) return true;
    if (block.type === "hr") return false;
    if (block.type === "ul") return block.items.some((i) => i.toLowerCase().includes(needle));
    return block.text.toLowerCase().includes(needle);
  };

  const rendered = blocks
    .map((block, index) => ({ block, index }))
    .filter(({ block }) => (filter && needle ? matches(block) : true));

  if (filter && needle && rendered.length === 0) {
    return (
      <p className="font-mono text-sm text-muted-foreground">
        no matches for “{q}” in notes.md
      </p>
    );
  }

  return (
    <div className="font-mono">
      {rendered.map(({ block, index }) => {
        const key = `b-${index}`;
        switch (block.type) {
          case "hr":
            return <hr key={key} className="my-10 border-border/60" />;
          case "code":
            return <CodeBlock key={key} code={block.text} lang={block.lang} />;
          case "h1":
            return (
              <AnchorHeading key={key} as="h1" id={nextId(block.text)} className="text-sm text-accent sm:text-base">
                {renderInline(block.text, key, q)}
              </AnchorHeading>
            );
          case "h2":
            return (
              <AnchorHeading
                key={key}
                as="h2"
                id={nextId(block.text)}
                className="mt-10 text-xs uppercase tracking-[0.18em] text-muted-foreground"
              >
                {renderInline(block.text, key, q)}
              </AnchorHeading>
            );
          case "h3":
            return (
              <AnchorHeading key={key} as="h3" id={nextId(block.text)} className="mt-8 text-sm text-foreground">
                {renderInline(block.text, key, q)}
              </AnchorHeading>
            );
          case "quote":
            return (
              <blockquote
                key={key}
                className="mt-6 border-l-2 border-accent/50 pl-4 text-sm italic leading-7 text-muted-foreground"
              >
                {renderInline(block.text, key, q)}
              </blockquote>
            );
          case "ul":
            return (
              <ul key={key} className="mt-5 space-y-2 text-sm leading-7 text-foreground">
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`} className="flex gap-3">
                    <span aria-hidden className="text-accent/60">
                      —
                    </span>
                    <span>{renderInline(item, `${key}-${i}`, q)}</span>
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={key} className="mt-5 text-sm leading-7 text-foreground">
                {renderInline(block.text, key, q)}
              </p>
            );
        }
      })}
    </div>
  );
}
