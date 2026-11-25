'use client';

import { Check, Minus, X } from 'lucide-react';
import {
  TIMELINE_CIRCLE_SIZE,
  TIMELINE_LINE_WIDTH,
  TIMELINE_STEP_SPACING,
  TIMELINE_HOVER_TRANSITION,
} from '@/__mocks__';

interface ProcessTimelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
  timestamp?: string;
  metadata?: Record<string, string | number>;
}

const circleGeometry = {
  width: TIMELINE_CIRCLE_SIZE,
  height: TIMELINE_CIRCLE_SIZE,
  borderRadius: '50%' as const,
  display: 'flex' as const,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
function stepLabelClass(status: ProcessTimelineStep['status']): string {
  return status === 'active' || status === 'completed'
    ? 'text-[var(--text-hi)]'
    : 'text-[var(--text-mid)]';
}
export function StepCircle({ status }: { status: ProcessTimelineStep['status'] }) {
  const base = { ...circleGeometry };
  if (status === 'pending') {
    return <div style={{ ...base, borderWidth: TIMELINE_LINE_WIDTH, borderStyle: 'solid', borderColor: 'var(--border)', background: 'transparent' }} />;
  }
  if (status === 'active') {
    return <div className="animate-pulse" style={{ ...base, background: 'var(--brand)', boxShadow: `0 0 0 ${TIMELINE_LINE_WIDTH}px var(--brand)` }} />;
  }
  if (status === 'completed') {
    return <div style={{ ...base, background: 'var(--cleared)' }}><Check className="w-5 h-5 text-white" /></div>;
  }
  if (status === 'failed') {
    return <div style={{ ...base, background: 'var(--disputed)' }}><X className="w-5 h-5 text-white" /></div>;
  }
  return <div style={{ ...base, background: 'var(--border-mid)' }}><Minus className="w-5 h-5 text-[var(--text-lo)]" /></div>;
}
function timelineLine() {
  return <div className="flex-1" style={{ width: TIMELINE_LINE_WIDTH, background: 'var(--border-mid)' }} />;
}
export function MetadataBadge({ badgeKey, value }: { badgeKey: string; value: string | number }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs whitespace-nowrap"
      style={{ border: '1px solid var(--border)', background: 'var(--surface-active)', color: 'var(--text-mid)' }}
    >
      {`${badgeKey}: ${value}`}
    </span>
  );
}
export function StepRow({
  step,
  index,
  last,
  clickable,
  onStepClick,
}: {
  step: ProcessTimelineStep;
  index: number;
  last: boolean;
  clickable: boolean;
  onStepClick?: (stepId: string) => void;
}) {
  return (
    <div
      key={step.id}
      onClick={() => onStepClick?.(step.id)}
      className={`flex items-start gap-3 ${clickable ? 'cursor-pointer rounded-lg p-2 transition-colors hover:bg-[var(--surface-active)]' : ''}`}
      style={clickable ? { transitionDuration: `${TIMELINE_HOVER_TRANSITION}ms` } : undefined}
    >
      <div className="flex flex-col items-center">
        {index > 0 && timelineLine()}
        <StepCircle status={step.status} />
        {!last && timelineLine()}
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`font-semibold text-sm ${stepLabelClass(step.status)}`}>{step.label}</span>
          {step.timestamp && (
            <span className="ml-auto whitespace-nowrap font-mono text-xs text-[var(--text-lo)]">{step.timestamp}</span>
          )}
        </div>
        {step.metadata && Object.keys(step.metadata).length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {Object.entries(step.metadata).map(([badgeKey, value]) => (
              <MetadataBadge key={badgeKey} badgeKey={badgeKey} value={value} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
export function HorizontalStep({
  step,
  last,
  clickable,
  onStepClick,
}: {
  step: ProcessTimelineStep;
  last: boolean;
  clickable: boolean;
  onStepClick?: (stepId: string) => void;
}) {
  return (
    <div
      key={step.id}
      onClick={() => onStepClick?.(step.id)}
      className={`flex flex-col items-center gap-2 ${clickable ? 'cursor-pointer rounded-lg p-1 transition-colors hover:bg-[var(--surface-active)]' : ''}`}
      style={clickable ? { transitionDuration: `${TIMELINE_HOVER_TRANSITION}ms` } : undefined}
    >
      <StepCircle status={step.status} />
      {!last && <div className="flex-1" style={{ height: TIMELINE_LINE_WIDTH, background: 'var(--border-mid)' }} />}
      <span className={`font-semibold text-sm ${stepLabelClass(step.status)}`}>{step.label}</span>
      {step.timestamp && (
        <span className="font-mono text-xs text-[var(--text-lo)]">{step.timestamp}</span>
      )}
    </div>
  );
}
export function VerticalSteps({
  steps,
  clickable,
  onStepClick,
}: {
  steps: ProcessTimelineStep[];
  clickable: boolean;
  onStepClick?: (stepId: string) => void;
}) {
  return (
    <div className="flex flex-col" style={{ gap: TIMELINE_STEP_SPACING }}>
      {steps.map((step, index) => (
        <StepRow step={step} index={index} last={index === steps.length - 1} clickable={clickable} onStepClick={onStepClick} />
      ))}
    </div>
  );
}
export function HorizontalSteps({
  steps,
  clickable,
  onStepClick,
}: {
  steps: ProcessTimelineStep[];
  clickable: boolean;
  onStepClick?: (stepId: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center" style={{ gap: TIMELINE_STEP_SPACING }}>
        {steps.map((step, index) => (
          <HorizontalStep
            key={step.id}
            step={step}
            last={index === steps.length - 1}
            clickable={clickable}
            onStepClick={onStepClick}
          />
        ))}
      </div>
    </div>
  );
}
