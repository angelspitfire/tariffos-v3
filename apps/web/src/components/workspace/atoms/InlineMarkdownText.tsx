'use client';

/** Renders inline bold (`**text**`) spans without HTML injection. */
export function InlineMarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, idx) =>
        part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
          <strong key={idx} className="font-semibold text-ink-primary">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        ),
      )}
    </>
  );
}
