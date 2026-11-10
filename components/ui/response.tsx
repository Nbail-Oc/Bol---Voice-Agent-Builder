"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ResponseProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

/**
 * Parses simple markdown elements (bold, italic, inline code, code blocks, bullet points)
 * safely and renders them with clean typography.
 */
function renderMarkdownTokens(content: string) {
  // If content has code blocks:
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderTextParagraphs(content.slice(lastIndex, match.index), `text-${lastIndex}`));
    }
    const lang = match[1] || "";
    const code = match[2];
    parts.push(
      <div
        key={`code-${match.index}`}
        className="my-3 overflow-hidden rounded-xl border border-white/10 bg-[#0d0d10] font-mono text-xs"
      >
        {lang && (
          <div className="border-b border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-wider text-neutral-400">
            {lang}
          </div>
        )}
        <pre className="overflow-x-auto p-3 text-neutral-200">
          <code>{code}</code>
        </pre>
      </div>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(renderTextParagraphs(content.slice(lastIndex), `text-${lastIndex}`));
  }

  return parts.length > 0 ? parts : content;
}

function renderTextParagraphs(text: string, keyPrefix: string) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((p, idx) => {
    // Check if it's a list item
    const lines = p.split("\n");
    const isBulletList = lines.every((l) => l.trim().startsWith("- ") || l.trim().startsWith("* "));

    if (isBulletList && lines.length > 0) {
      return (
        <ul key={`${keyPrefix}-p-${idx}`} className="my-2 list-disc space-y-1 pl-5">
          {lines.map((l, lIdx) => (
            <li key={`li-${lIdx}`}>{formatInlineText(l.replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`${keyPrefix}-p-${idx}`} className="leading-relaxed">
        {lines.map((line, lIdx) => (
          <React.Fragment key={`l-${lIdx}`}>
            {formatInlineText(line)}
            {lIdx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
}

function formatInlineText(text: string) {
  // Bold: **text**
  // Code: `code`
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return tokens.map((tok, i) => {
    if (tok.startsWith("`") && tok.endsWith("`") && tok.length > 1) {
      return (
        <code
          key={i}
          className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-amber-200"
        >
          {tok.slice(1, -1)}
        </code>
      );
    }
    if (tok.startsWith("**") && tok.endsWith("**") && tok.length > 3) {
      return (
        <strong key={i} className="font-semibold text-white">
          {tok.slice(2, -2)}
        </strong>
      );
    }
    return tok;
  });
}

export function Response({ children, className, ...props }: ResponseProps) {
  if (typeof children === "string") {
    return (
      <div className={cn("space-y-2 text-sm leading-relaxed", className)} {...props}>
        {renderMarkdownTokens(children)}
      </div>
    );
  }

  return (
    <div className={cn("space-y-2 text-sm leading-relaxed", className)} {...props}>
      {children}
    </div>
  );
}

