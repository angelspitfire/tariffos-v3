'use client';

import { useEffect, useState } from 'react';
import type { UserProfileSettings } from '@tariffos/shared-types';

const MIN_CHAT_PCT = 32;
const MAX_CHAT_PCT = 68;
const KEYBOARD_STEP_PCT = 4;
const WIDE_VIEWPORT_PX = 1280;

/** Manages responsive sidebar, split-pane resizing, theme toggle, and workspace modals. */
export function useWorkspaceShellLayout(params: {
  activeThreadId: string | null;
  hasCanvas: boolean;
  themePreference: UserProfileSettings['themePreference'];
  onSaveTheme: (theme: 'light' | 'dark') => void;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [canvasDismissed, setCanvasDismissed] = useState(false);
  const [canvasFullscreen, setCanvasFullscreen] = useState(false);
  const [skuModalOpen, setSkuModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [filesPanelOpen, setFilesPanelOpen] = useState(false);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [mobilePane, setMobilePane] = useState<'chat' | 'canvas'>('chat');
  const [chatWidthPct, setChatWidthPct] = useState(46);
  const [isDark, setIsDark] = useState(false);

  const showCanvas = params.hasCanvas && !canvasDismissed;

  useEffect(() => {
    setCanvasDismissed(false);
    if (params.hasCanvas && window.innerWidth < WIDE_VIEWPORT_PX) setSidebarOpen(false);
  }, [params.activeThreadId, params.hasCanvas]);

  useEffect(() => {
    if (!showCanvas) return;
    const onResize = () => window.innerWidth < WIDE_VIEWPORT_PX && setSidebarOpen(false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [showCanvas]);

  useEffect(() => {
    const dark = params.themePreference === 'dark';
    setIsDark(dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [params.themePreference]);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    params.onSaveTheme(nextDark ? 'dark' : 'light');
  };

  const handleStartResize = (event: React.PointerEvent<HTMLElement>) => {
    event.preventDefault();
    const container = event.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';
    const onMove = (e: PointerEvent) => {
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setChatWidthPct(Math.max(MIN_CHAT_PCT, Math.min(MAX_CHAT_PCT, pct)));
    };
    const onUp = () => {
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const handleResizeKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setChatWidthPct((prev) => Math.max(MIN_CHAT_PCT, prev - KEYBOARD_STEP_PCT));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setChatWidthPct((prev) => Math.min(MAX_CHAT_PCT, prev + KEYBOARD_STEP_PCT));
    }
  };

  return {
    sidebarOpen, setSidebarOpen,
    mobileDrawerOpen, setMobileDrawerOpen,
    canvasDismissed, setCanvasDismissed,
    canvasFullscreen, setCanvasFullscreen,
    skuModalOpen, setSkuModalOpen,
    settingsModalOpen, setSettingsModalOpen,
    filesPanelOpen, setFilesPanelOpen,
    analyticsOpen, setAnalyticsOpen,
    mobilePane, setMobilePane,
    chatWidthPct, isDark, showCanvas,
    handleToggleTheme, handleStartResize, handleResizeKeyDown,
  };
}
