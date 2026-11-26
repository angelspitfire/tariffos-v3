import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatFilesPanel } from '../organisms/ChatFilesPanel';

describe('ChatFilesPanel', () => {
  it('lists thread attachments, previews extracted text, and triggers reclassification', async () => {
    const user = userEvent.setup();
    const onReclassifyFile = vi.fn();
    const onClose = vi.fn();

    render(
      <ChatFilesPanel
        open
        pendingAttachments={[
          {
            id: 'att-1',
            name: 'factura-comercial.pdf',
            mimeType: 'application/pdf',
            sizeBytes: 2048,
            extractedText: 'ITEM 1: INVERSOR SOLAR 5KW',
          },
        ]}
        messages={[]}
        onClose={onClose}
        onReclassifyFile={onReclassifyFile}
      />,
    );

    expect(screen.getByText('factura-comercial.pdf')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Texto/i }));
    expect(screen.getByText(/ITEM 1: INVERSOR SOLAR 5KW/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Clasificar/i }));
    expect(onReclassifyFile).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
