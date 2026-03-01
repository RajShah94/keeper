'use client';

import { WorkOrder } from '@/lib/types';

interface EntryCardProps {
  order: WorkOrder;
  onClick: () => void;
  index?: number;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const orderDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((today.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays === -1) return 'Tomorrow';
  if (diffDays > 1 && diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatCost(cost: number | null): string | null {
  if (cost === null || cost === undefined) return null;
  if (cost === 0) return null;
  if (Number.isInteger(cost)) return `$${cost}`;
  return `$${cost.toFixed(0)}`;
}

export default function EntryCard({ order, onClick, index = 0 }: EntryCardProps) {
  const scopeLabel = order.scope === 'unit'
    ? `#${order.unit_number}`
    : order.scope === 'building'
      ? 'Building'
      : 'Complex';

  const costStr = formatCost(order.cost);
  const dateStr = formatRelativeDate(order.work_date);

  return (
    <button
      onClick={onClick}
      className="card-enter w-full text-left bg-card border border-border rounded-[12px] p-4
                 shadow-[0_1px_3px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top row: scope/unit + date */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold tracking-wide">
          {scopeLabel}
        </span>
        <span className="text-xs text-foreground-secondary">
          {dateStr}
        </span>
      </div>

      {/* Description */}
      <p className="text-sm text-foreground/80 leading-snug line-clamp-2 mb-2">
        {order.description}
      </p>

      {/* Bottom row: cost, vendor, status */}
      <div className="flex items-center gap-2 text-xs">
        {costStr && (
          <span className="font-semibold text-gold">{costStr}</span>
        )}
        {costStr && order.vendor && (
          <span className="text-foreground-secondary">·</span>
        )}
        {order.vendor && (
          <span className="text-foreground-secondary">{order.vendor}</span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <span
            className={`inline-block w-2 h-2 rounded-full ${
              order.status === 'completed'
                ? 'bg-sage'
                : order.status === 'open'
                  ? 'bg-coral'
                  : 'bg-gold'
            }`}
          />
          <span className="text-foreground-secondary capitalize">{order.status}</span>
        </span>
      </div>
    </button>
  );
}
