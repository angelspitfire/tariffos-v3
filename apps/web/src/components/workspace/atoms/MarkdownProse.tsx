'use client';

import type { ReactNode } from 'react';
import {
  isTableDivider,
  isTableRow,
  renderInlineMarkdown,
  splitTableCells,
} from './markdown-inline';

/** Safe pure-React Markdown renderer for streaming chat responses (headings, lists, tables, code). */
export function MarkdownProse({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = (lines[i] ?? '').trim();
    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? '').trim().startsWith('```')) {
        codeLines.push(lines[i] ?? '');
        i += 1;
      }
      i += 1;
      blocks.push(
        <pre key={`code-${i}`} className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-muted p-3 font-mono text-xs text-ink-primary">
          <code>{codeLines.join('\n')}</code>
        </pre>,
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? 'h3' : heading[1].length === 2 ? 'h4' : 'h5';
      blocks.push(
        <Tag key={`h-${i}`} className="pt-1 text-sm font-semibold text-ink-primary [text-wrap:balance]">
          {renderInlineMarkdown(heading[2])}
        </Tag>,
      );
      i += 1;
      continue;
    }

    if (isTableRow(trimmed) && i + 1 < lines.length && isTableDivider(lines[i + 1] ?? '')) {
      const headers = splitTableCells(trimmed);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i] ?? '')) {
        rows.push(splitTableCells(lines[i] ?? ''));
        i += 1;
      }
      blocks.push(
        <div key={`tbl-${i}`} className="overflow-x-auto rounded-xl border border-border-subtle bg-surface-panel">
          <table className="w-full border-collapse text-left text-xs">
            <thead className="border-b border-border-subtle bg-surface-muted/70 text-ink-secondary">
              <tr>
                {headers.map((h, idx) => (
                  <th key={idx} className="px-3 py-2 font-semibold">{renderInlineMarkdown(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-hairline tabular-nums">
              {rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-ink-primary">{renderInlineMarkdown(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^[-*]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink-primary">
          {items.map((item, idx) => <li key={idx}>{renderInlineMarkdown(item)}</li>)}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? '').trim())) {
        items.push((lines[i] ?? '').trim().replace(/^\d+\.\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="list-decimal space-y-1 pl-5 text-sm leading-relaxed text-ink-primary">
          {items.map((item, idx) => <li key={idx}>{renderInlineMarkdown(item)}</li>)}
        </ol>,
      );
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && (lines[i] ?? '').trim().startsWith('>')) {
        quoteLines.push((lines[i] ?? '').trim().replace(/^>\s?/, ''));
        i += 1;
      }
      blocks.push(
        <blockquote key={`bq-${i}`} className="border-l-2 border-accent-border pl-3 text-xs leading-relaxed text-ink-secondary">
          {renderInlineMarkdown(quoteLines.join(' '))}
        </blockquote>,
      );
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      (lines[i] ?? '').trim() !== '' &&
      !/^(#{1,3}\s+|[-*]\s+|\d+\.\s+|```|>)/.test((lines[i] ?? '').trim()) &&
      !isTableRow(lines[i] ?? '')
    ) {
      paraLines.push(lines[i] ?? '');
      i += 1;
    }
    blocks.push(
      <p key={`p-${i}`} className="whitespace-pre-line text-sm leading-relaxed text-ink-primary">
        {renderInlineMarkdown(paraLines.join('\n'))}
      </p>,
    );
  }

  return <div className="space-y-2.5">{blocks}</div>;
}
