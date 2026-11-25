import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomsDossierDocument } from './CustomsDossierDocument';
import { INITIAL_DOSSIER_DATA } from '@/__mocks__';

describe('CustomsDossierDocument', () => {
  it('renders official document header and legal details', () => {
    render(
      <CustomsDossierDocument
        isOpen={true}
        onClose={vi.fn()}
        payload={INITIAL_DOSSIER_DATA}
      />
    );

    expect(screen.getByText(/Dictamen Técnico de Clasificación Arancelaria/i)).toBeInTheDocument();
    expect(screen.getByText(INITIAL_DOSSIER_DATA.dossierNumber)).toBeInTheDocument();
    expect(screen.getByText(INITIAL_DOSSIER_DATA.importerName)).toBeInTheDocument();
    expect(screen.getByText(INITIAL_DOSSIER_DATA.customsDistrict)).toBeInTheDocument();
  });

  it('renders all line items in the official table', () => {
    render(
      <CustomsDossierDocument
        isOpen={true}
        onClose={vi.fn()}
        payload={INITIAL_DOSSIER_DATA}
      />
    );

    for (const item of INITIAL_DOSSIER_DATA.items) {
      expect(screen.getByText(item.hsCode)).toBeInTheDocument();
      expect(screen.getByText(item.description)).toBeInTheDocument();
    }
  });

  it('calls window.print when print button is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    render(
      <CustomsDossierDocument
        isOpen={true}
        onClose={vi.fn()}
        payload={INITIAL_DOSSIER_DATA}
      />
    );

    const printBtn = screen.getByRole('button', { name: /imprimir/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <CustomsDossierDocument
        isOpen={true}
        onClose={handleClose}
        payload={INITIAL_DOSSIER_DATA}
      />
    );

    const closeBtn = screen.getByRole('button', { name: /cerrar/i });
    fireEvent.click(closeBtn);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not crash when payload is null', () => {
    const { container } = render(
      <CustomsDossierDocument
        isOpen={true}
        onClose={vi.fn()}
        payload={null}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('does not crash when payload is undefined', () => {
    const { container } = render(
      <CustomsDossierDocument
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('does not render anything when isOpen=false even with payload', () => {
    const { container } = render(
      <CustomsDossierDocument
        isOpen={false}
        onClose={vi.fn()}
        payload={INITIAL_DOSSIER_DATA}
      />
    );
    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });
});
