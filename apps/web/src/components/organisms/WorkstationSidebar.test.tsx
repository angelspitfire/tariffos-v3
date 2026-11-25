// @ts-nocheck
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WorkstationSidebar } from './WorkstationSidebar';
import { I18nProvider } from '@/lib/i18n';

const renderWithI18n = (ui: React.ReactNode) => render(<I18nProvider defaultLanguage="es">{ui}</I18nProvider>);

describe('WorkstationSidebar', () => {
  it('renders sidebar with brand', () => {
    renderWithI18n(
      <WorkstationSidebar
        expanded={true}
        onToggleExpand={vi.fn()}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    expect(screen.getByText('TariffOS')).toBeInTheDocument();
    expect(screen.getByText('v2')).toBeInTheDocument();
  });

  it('renders expanded sidebar has profile section', () => {
    renderWithI18n(
      <WorkstationSidebar
        expanded={true}
        onToggleExpand={vi.fn()}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const profileSection = screen.getByText(/Agente Aduanero/i);
    expect(profileSection).toBeInTheDocument();
  });

  it('renders recent filings section when expanded', () => {
    renderWithI18n(
      <WorkstationSidebar
        expanded={true}
        onToggleExpand={vi.fn()}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const recentFilings = screen.getByText(/Trámites Recientes/i);
    expect(recentFilings).toBeInTheDocument();
  });

  it('renders profile section when expanded', () => {
    renderWithI18n(
      <WorkstationSidebar
        expanded={true}
        onToggleExpand={vi.fn()}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const profileSection = screen.getByText(/Agente Aduanero/i);
    expect(profileSection).toBeInTheDocument();
  });

  it('renders settings button when expanded', () => {
    renderWithI18n(
      <WorkstationSidebar
        expanded={true}
        onToggleExpand={vi.fn()}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const settingsBtn = screen.getByRole('button', { name: /Ajustes/i });
    expect(settingsBtn).toBeInTheDocument();
  });

  it('renders toggle button when expanded', () => {
    renderWithI18n(
      <WorkstationSidebar
        expanded={true}
        onToggleExpand={vi.fn()}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const toggleBtn = screen.getByRole('button', { name: /Colapsar barra lateral/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('renders toggle button when collapsed', () => {
    renderWithI18n(
      <WorkstationSidebar
        expanded={false}
        onToggleExpand={vi.fn()}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const toggleBtn = screen.getByRole('button', { name: /Desplegar barra lateral/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it('toggle button expands sidebar', () => {
    const handleToggle = vi.fn();
    renderWithI18n(
      <WorkstationSidebar
        expanded={false}
        onToggleExpand={handleToggle}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const toggleBtn = screen.getByRole('button', { name: /Desplegar barra lateral/i });
    fireEvent.click(toggleBtn);
    // Check that onToggleExpand was called
    expect(handleToggle).toHaveBeenCalled();
  });

  it('toggle button collapses sidebar', () => {
    const handleToggle = vi.fn();
    renderWithI18n(
      <WorkstationSidebar
        expanded={true}
        onToggleExpand={handleToggle}
        onNewFiling={vi.fn()}
        onSelectAssistant={vi.fn()}
        onSelectTariffReference={vi.fn()}
        onToggleDrawer={vi.fn()}
        hasActiveConversation={false}
      />
    );
    const toggleBtn = screen.getByRole('button', { name: /Colapsar barra lateral/i });
    fireEvent.click(toggleBtn);
    // Check that onToggleExpand was called
    expect(handleToggle).toHaveBeenCalled();
  });
});
