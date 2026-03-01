'use client';

import { useState } from 'react';
import { QueryResult } from '@/lib/types';

interface QueryResultsProps {
  result: QueryResult;
  onClose: () => void;
}

function formatCost(cost: number | null): string | null {
  if (cost === null || cost === undefined || cost === 0) return null;
  if (Number.isInteger(cost)) return `$${cost}`;
  return `$${cost.toFixed(0)}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function QueryResults({ result, onClose }: QueryResultsProps) {
  const [expandedRank, setExpandedRank] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div className="absolute inset-0 sheet-backdrop" onClick={onClose} />
      <div className="relative bg-card rounded-t-2xl w-full max-h-[85vh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-foreground/10" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          {/* Natural language answer */}
          <div className="bg-sage-light border border-sage/20 rounded-xl p-4">
            <p className="text-sm text-foreground leading-relaxed font-medium">
              {result.natural_response}
            </p>
          </div>

          {/* Aggregate data */}
          {result.aggregate_data && result.aggregate_data.length > 0 && (
            <div className="bg-background rounded-xl p-4 space-y-2">
              {result.aggregate_data.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-1.5">
                  <span className="text-sm text-foreground-secondary">{row.label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Rank data — expandable groups */}
          {result.rank_data && result.rank_data.length > 0 && (
            <div className="space-y-1">
              {result.rank_data.map((row) => {
                const isExpanded = expandedRank === row.rank;
                return (
                  <div key={row.rank} className="bg-background rounded-xl overflow-hidden border border-border">
                    <button
                      onClick={() => setExpandedRank(isExpanded ? null : row.rank)}
                      className="w-full flex items-center gap-3 px-4 py-3 active:bg-foreground/5 transition-colors"
                    >
                      <span className="text-xs font-bold text-foreground-secondary w-5 text-right shrink-0">
                        {row.rank}.
                      </span>
                      <svg
                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`text-foreground-secondary shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span className="text-sm font-semibold text-foreground flex-1 text-left">
                        {row.label}
                      </span>
                      <span className="text-sm font-semibold text-sage shrink-0">
                        {row.value}
                      </span>
                    </button>

                    {isExpanded && row.orders && row.orders.length > 0 && (
                      <div className="px-4 pb-3 space-y-1.5 border-t border-border pt-2">
                        {row.orders.map((wo) => (
                          <div key={wo.id} className="flex items-center justify-between py-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground/80 truncate">{wo.description}</p>
                              <p className="text-xs text-foreground-secondary">
                                {formatDate(wo.work_date)}
                                {wo.vendor ? ` · ${wo.vendor}` : ''}
                              </p>
                            </div>
                            {formatCost(wo.cost) && (
                              <span className="text-xs font-semibold text-gold ml-3 shrink-0">
                                {formatCost(wo.cost)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Work order list */}
          {result.work_orders && result.work_orders.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-medium text-foreground-secondary uppercase tracking-wider">
                {result.work_orders.length} matching order{result.work_orders.length === 1 ? '' : 's'}
              </h3>
              {result.work_orders.slice(0, 15).map((wo) => (
                <div key={wo.id} className="bg-background rounded-lg p-3 border border-border">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {wo.scope === 'unit' ? `#${wo.unit_number}` : wo.scope === 'building' ? 'Building' : 'Complex'}
                      </span>
                      <span className="text-xs text-foreground-secondary">{formatDate(wo.work_date)}</span>
                    </div>
                    {formatCost(wo.cost) && (
                      <span className="text-sm font-semibold text-gold">{formatCost(wo.cost)}</span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/70 line-clamp-2">{wo.description}</p>
                  {wo.vendor && (
                    <p className="text-xs text-foreground-secondary mt-1">{wo.vendor}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full h-12 rounded-lg bg-sage text-white text-sm font-semibold
                       active:brightness-90 transition-all mt-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
