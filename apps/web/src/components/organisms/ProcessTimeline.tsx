import { ProcessTimelinePayload } from '@/types/generative-payloads';
import { SkeletonCard, SkeletonText } from '@/components/atoms/Skeleton';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

const TIMELINE_LINE_WIDTH = 2;
const STEP_SIZE = 12;

function stepIndicatorClassName(status: string) {
  if (status === 'done') {
    return 'w-' + STEP_SIZE + ' h-' + STEP_SIZE + ' rounded-full flex items-center justify-center border-' + TIMELINE_LINE_WIDTH + ' transition-all duration-300 bg-[var(--success-text)] border-[var(--success-text)]';
  }
  if (status === 'current') {
    return 'w-' + STEP_SIZE + ' h-' + STEP_SIZE + ' rounded-full flex items-center justify-center border-' + TIMELINE_LINE_WIDTH + ' transition-all duration-300 bg-[var(--brand)] border-[var(--brand)] animate-pulse';
  }
  if (status === 'blocked') {
    return 'w-' + STEP_SIZE + ' h-' + STEP_SIZE + ' rounded-full flex items-center justify-center border-' + TIMELINE_LINE_WIDTH + ' transition-all duration-300 bg-[var(--danger-text)] border-[var(--danger-text)]';
  }
  return 'w-' + STEP_SIZE + ' h-' + STEP_SIZE + ' rounded-full flex items-center justify-center border-' + TIMELINE_LINE_WIDTH + ' transition-all duration-300 bg-transparent border-[var(--border-mid)]';
}

function stepStatusClassName(status: string) {
  if (status === 'done') {
    return 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--success-subtle)] text-[var(--success-text)] border border-[var(--success-border)]';
  }
  if (status === 'current') {
    return 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--purple-subtle)] text-[var(--purple-text)] border border-[var(--purple-border)]';
  }
  if (status === 'blocked') {
    return 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--danger-subtle)] text-[var(--danger-text)] border border-[var(--danger-border)]';
  }
  return 'px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border-card)]';
}

function stepIcon(status: string) {
  if (status === 'done') return <CheckCircle className="w-5 h-5 text-white" />;
  if (status === 'blocked') return <AlertCircle className="w-5 h-5 text-white" />;
  return null;
}

export function ProcessTimeline({ payload, isLoading = false }: { payload: ProcessTimelinePayload; isLoading?: boolean }) {
  if (isLoading) {
    return (
      <SkeletonCard>
        <SkeletonText lines={5} />
      </SkeletonCard>
    );
  }

  return (
    <div className="bg-[var(--surface-card)] border border-[var(--border-card)] rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--info-subtle)', color: 'var(--info-text)' }}>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text-hi)]">{payload.title}</h4>
            <p className="text-[11px] text-[var(--text-lo)]">{payload.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {payload.steps.map((step, idx) => (
          <div key={step.id} className="relative">
            <div className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                <div className={stepIndicatorClassName(step.status)}>
                  {stepIcon(step.status)}
                </div>
                {idx < payload.steps.length - 1 && (
                  <div
                    className="absolute left-[calc(50%-1px)] top-[12px] bottom-[12px] w-[2px]"
                    style={{ backgroundColor: idx < payload.steps.length - 1 && payload.steps[idx + 1].status !== 'pending' ? 'var(--success-text)' : 'var(--border-divider)' }}
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-hi)]">{step.label}</p>
                    <p className="text-[11px] text-[var(--text-lo)] mt-0.5">{step.metadata?.description ?? step.label}</p>
                  </div>
                  <span className={stepStatusClassName(step.status)}>
                    {step.status}
                  </span>
                </div>
                {step.metadata && step.metadata.details && (
                  <div className="mt-2 p-3 rounded-lg" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border-card)' }}>
                    <p className="text-[11px] text-[var(--text-mid)]">{step.metadata.details}</p>
                    {step.timestamp && (
                      <p className="text-[10px] text-[var(--text-muted)] font-mono mt-1">{step.timestamp}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
