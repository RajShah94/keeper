'use client';

import { ParsedEntry } from '@/lib/types';

interface ConfirmEntryProps {
  entry: ParsedEntry;
  transcript: string;
  onConfirm: () => void;
  onEdit: () => void;
  onDiscard: () => void;
}

function formatCost(cost: number | null): string {
  if (cost === null || cost === undefined) return '';
  if (Number.isInteger(cost)) return `$${cost}`;
  return `$${cost.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export default function ConfirmEntry({ entry, transcript, onConfirm, onEdit, onDiscard }: ConfirmEntryProps) {
  const scopeLabel = entry.scope === 'unit'
    ? `Unit #${entry.unit_number}`
    : entry.scope === 'building'
      ? 'Building'
      : 'Complex';

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 sheet-backdrop" onClick={onDiscard} />
      <div className="relative bg-card rounded-t-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-foreground/10" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          {/* Transcript */}
          <div className="bg-background rounded-lg p-3">
            <p className="text-xs text-foreground-secondary mb-1">You said:</p>
            <p className="text-sm text-foreground/70 italic">&ldquo;{transcript}&rdquo;</p>
          </div>

          <h2 className="text-lg font-semibold">Confirm Entry</h2>

          {/* Parsed fields */}
          <div className="space-y-3 bg-background rounded-xl p-4">
            <Field label="Scope" value={scopeLabel} />
            <Field label="Description" value={entry.description} />
            {entry.cost !== null && <Field label="Cost" value={formatCost(entry.cost)} highlight />}
            {entry.vendor && <Field label="Vendor" value={entry.vendor} />}
            <Field label="Status" value={entry.status} />
            <Field label="Date" value={formatDate(entry.work_date)} />
            {entry.tags.length > 0 && (
              <div>
                <span className="text-xs font-medium text-foreground-secondary">Tags</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {entry.tags.map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-sage-light text-sage text-xs rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onDiscard}
              className="flex-1 h-12 rounded-lg border border-border text-foreground-secondary text-sm font-medium
                         active:bg-foreground/5 transition-colors"
            >
              Discard
            </button>
            <button
              onClick={onEdit}
              className="flex-1 h-12 rounded-lg border border-sage text-sage text-sm font-medium
                         active:bg-sage/5 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 h-12 rounded-lg bg-sage text-white text-sm font-semibold
                         active:brightness-90 transition-all"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <span className="text-xs font-medium text-foreground-secondary">{label}</span>
      <p className={`text-sm capitalize ${highlight ? 'font-semibold text-gold' : 'text-foreground'}`}>
        {value}
      </p>
    </div>
  );
}
