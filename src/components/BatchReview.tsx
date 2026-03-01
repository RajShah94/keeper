'use client';

import { useState } from 'react';
import { ParsedEntry } from '@/lib/types';

interface BatchReviewProps {
  entries: ParsedEntry[];
  transcript: string;
  onConfirmAll: (entries: ParsedEntry[]) => void;
  onEditEntry: (index: number) => void;
  onDiscard: () => void;
}

// Valid unit numbers: 101-153, 201-253
function isValidUnit(unit: string | null): boolean {
  if (!unit) return false;
  const num = parseInt(unit, 10);
  return (num >= 101 && num <= 153) || (num >= 201 && num <= 253);
}

function formatCost(cost: number | null): string | null {
  if (cost === null || cost === undefined || cost === 0) return null;
  return `$${Number.isInteger(cost) ? cost : cost.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

export default function BatchReview({ entries, transcript, onConfirmAll, onEditEntry, onDiscard }: BatchReviewProps) {
  const [checked, setChecked] = useState<boolean[]>(
    entries.map((e) => e.scope !== 'unit' || isValidUnit(e.unit_number))
  );

  const toggleCheck = (index: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  const validCheckedEntries = entries.filter((e, i) => checked[i] && (e.scope !== 'unit' || isValidUnit(e.unit_number)));
  const checkedCount = validCheckedEntries.length;

  const handleSave = () => {
    onConfirmAll(validCheckedEntries);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 sheet-backdrop" onClick={onDiscard} />
      <div className="relative bg-card rounded-t-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-foreground/10" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          {/* Transcript */}
          <div className="bg-background rounded-lg p-3">
            <p className="text-xs text-foreground-secondary mb-1">You said:</p>
            <p className="text-sm text-foreground/70 italic line-clamp-3">&ldquo;{transcript}&rdquo;</p>
          </div>

          <h2 className="text-lg font-semibold">
            Parsed {entries.length} entries
          </h2>

          {/* Entry list */}
          <div className="space-y-2">
            {entries.map((entry, i) => {
              const invalid = entry.scope === 'unit' && (!entry.unit_number || !isValidUnit(entry.unit_number));
              return (
                <div
                  key={i}
                  onClick={() => toggleCheck(i)}
                  className={`w-full text-left bg-background border rounded-[12px] p-3
                             transition-all cursor-pointer
                             ${invalid ? 'border-coral border-2' : 'border-border'}
                             ${!checked[i] && !invalid ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0
                                    ${checked[i] ? 'bg-sage border-sage' : 'border-border'}`}>
                      {checked[i] && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {invalid && (
                            <span className="text-coral text-xs" title="Invalid unit number">&#9888;</span>
                          )}
                          <span className={`text-sm font-semibold ${invalid ? 'text-coral' : ''}`}>
                            {entry.scope === 'unit'
                              ? entry.unit_number ? `#${entry.unit_number}` : 'No unit'
                              : entry.scope === 'building' ? 'Building' : 'Complex'}
                          </span>
                          <span className="text-xs text-foreground-secondary">{formatDate(entry.work_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {formatCost(entry.cost) && (
                            <span className="text-sm font-semibold text-gold">{formatCost(entry.cost)}</span>
                          )}
                          {/* Edit button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditEntry(i);
                            }}
                            className="w-7 h-7 rounded-full flex items-center justify-center
                                       bg-foreground/5 active:bg-foreground/10 transition-colors shrink-0"
                            aria-label="Edit entry"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                              className="text-foreground-secondary">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {invalid && (
                        <p className="text-sm font-semibold text-coral bg-coral/10 rounded-md px-2 py-1.5 mt-1.5">
                          Unit {entry.unit_number || '?'} doesn&apos;t exist. Valid: 101-153, 201-253.
                        </p>
                      )}
                      <p className="text-sm text-foreground/70 mt-0.5 line-clamp-2">{entry.description}</p>
                      {entry.vendor && (
                        <p className="text-xs text-foreground-secondary mt-0.5">{entry.vendor}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onDiscard}
              className="flex-1 h-12 rounded-lg border border-border text-foreground-secondary text-sm font-medium
                         active:bg-foreground/5 transition-colors"
            >
              Discard All
            </button>
            <button
              onClick={handleSave}
              disabled={checkedCount === 0}
              className="flex-1 h-12 rounded-lg bg-sage text-white text-sm font-semibold
                         disabled:opacity-50 active:brightness-90 transition-all"
            >
              Save All ({checkedCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
