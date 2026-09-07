import type { ReactNode } from "react";

type Rule = { pattern: RegExp; className: string };

const COMMENT: Rule = { pattern: /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/g, className: "text-muted-foreground italic" };
const STRING: Rule = { pattern: /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)/g, className: "text-emerald-300/80" };
const NUMBER: Rule = { pattern: /\b(\d+(?:\.\d+)?)\b/g, className: "text-orange-300/80" };

const KEYWORDS: Record<string, string[]> = {
  ts: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "import", "from", "export", "default", "await", "async", "new", "type", "interface", "class", "extends", "as", "of", "in", "try", "catch", "throw", "null", "undefined", "true", "false"],
  js: ["const", "let", "var", "function", "return", "if", "else", "for", "while", "import", "from", "export", "default", "await", "async", "new", "class", "extends", "of", "in", "try", "catch", "throw", "null", "undefined", "true", "false"],
  bash: ["echo", "cd", "ls", "cat", "if", "then", "fi", "for", "do", "done", "export", "sudo", "rm", "mv", "cp", "git", "npm", "bun"],
  sql: ["select", "from", "where", "insert", "into", "update", "set", "delete", "join", "on", "group", "by", "order", "limit", "and", "or", "not", "null", "create", "table"],
  json: ["true", "false", "null"],
};

function normalizeLang(lang: string): string {
  const l = lang.toLowerCase();
  if (l === "typescript" || l === "tsx") return "ts";
  if (l === "javascript" || l === "jsx") return "js";
  if (l === "sh" || l === "shell" || l === "zsh") return "bash";
  return l;
}

/** Tiny regex tokenizer — good enough for devlog snippets. */
function highlight(code: string, lang: string): ReactNode[] {
  const keywords = KEYWORDS[lang] ?? KEYWORDS["ts"] ?? [];
  const rules: Rule[] = [COMMENT, STRING];
  if (keywords.length) {
    rules.push({
      pattern: new RegExp(`\\b(${keywords.join("|")})\\b`, "g"),
      className: "text-accent",
    });
  }
  rules.push(NUMBER);

  const marks: { start: number; end: number; className: string }[] = [];
  for (const rule of rules) {
    const re = new RegExp(rule.pattern.source, rule.pattern.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const start = m.index;
      const end = start + m[0].length;
      if (m[0].length === 0) break;
      if (marks.some((k) => start < k.end && end > k.start)) continue;
      marks.push({ start, end, className: rule.className });
    }
  }
  marks.sort((a, b) => a.start - b.start);

  const nodes: ReactNode[] = [];
  let cursor = 0;
  marks.forEach((mark, i) => {
    if (mark.start > cursor) nodes.push(code.slice(cursor, mark.start));
    nodes.push(
      <span key={i} className={mark.className}>
        {code.slice(mark.start, mark.end)}
      </span>,
    );
    cursor = mark.end;
  });
  if (cursor < code.length) nodes.push(code.slice(cursor));
  return nodes;
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const language = normalizeLang(lang ?? "");
  return (
    <figure className="mt-6 overflow-hidden rounded-lg border border-border/60 bg-secondary/40">
      <figcaption className="flex items-center justify-between border-b border-border/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>{language || "code"}</span>
        <span aria-hidden className="text-accent/50">•••</span>
      </figcaption>
      <pre className="overflow-x-auto px-4 py-4 font-mono text-[12.5px] leading-6 text-foreground">
        <code>{highlight(code, language)}</code>
      </pre>
    </figure>
  );
}
