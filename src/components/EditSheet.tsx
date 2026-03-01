'use client';

import { useState, useEffect } from 'react';
import { WorkOrder, WorkOrderScope, WorkOrderStatus } from '@/lib/types';

interface EditSheetProps {
  order: WorkOrder | null;
  onSave: (data: Partial<WorkOrder>) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

function isValidUnit(unit: string): boolean {
  if (!unit) return false;
  const num = parseInt(unit, 10);
  return (num >= 101 && num <= 153) || (num >= 201 && num <= 253);
}

const SCOPES: { value: WorkOrderScope; label: string }[] = [
  { value: 'unit', label: 'Unit' },
  { value: 'building', label: 'Building' },
  { value: 'complex', label: 'Complex' },
];

const STATUSES: { value: WorkOrderStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Done' },
];

export default function EditSheet({ order, onSave, onDelete, onClose }: EditSheetProps) {
  const [scope, setScope] = useState<WorkOrderScope>(order?.scope ?? 'unit');
  const [unitNumber, setUnitNumber] = useState(order?.unit_number ?? '');
  const [description, setDescription] = useState(order?.description ?? '');
  const [cost, setCost] = useState(order?.cost?.toString() ?? '');
  const [vendor, setVendor] = useState(order?.vendor ?? '');
  const [status, setStatus] = useState<WorkOrderStatus>(order?.status ?? 'completed');
  const [workDate, setWorkDate] = useState(order?.work_date ?? new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleSave = async () => {
    if (!description.trim()) return;
    if (scope === 'unit' && !unitNumber.trim()) return;

    setSaving(true);
    try {
      await onSave({
        ...(order?.id ? { id: order.id } : {}),
        scope,
        unit_number: scope === 'unit' ? unitNumber.trim() : null,
        description: description.trim(),
        cost: cost ? parseFloat(cost) : null,
        vendor: vendor.trim() || null,
        status,
        work_date: workDate,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    if (onDelete) {
      await onDelete();
    }
  };

  const isNew = !order?.id;

  return (
    <div className="fixed inset-0 z-40">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 sheet-backdrop transition-opacity duration-300
                    ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl
                    max-h-[90vh] overflow-y-auto transition-transform duration-300 ease-out
                    ${visible ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-foreground/10" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          <h2 className="text-lg font-semibold">
            {isNew ? 'New Work Order' : 'Edit Work Order'}
          </h2>

          {/* Scope toggle */}
          <div>
            <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Scope</label>
            <div className="flex gap-2">
              {SCOPES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setScope(s.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]
                              ${scope === s.value
                                ? 'bg-sage text-white'
                                : 'bg-background border border-border text-foreground/60'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit number — only show when scope is unit */}
          {scope === 'unit' && (
            <div>
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Unit Number</label>
              <input
                type="text"
                inputMode="numeric"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="e.g. 242"
                className={`w-full h-12 px-3 rounded-lg border bg-background
                           text-base font-semibold tracking-wide
                           focus:outline-none focus:ring-2
                           ${unitNumber && !isValidUnit(unitNumber)
                             ? 'border-coral border-2 focus:ring-coral/30'
                             : 'border-border focus:ring-sage/30'}`}
              />
              {unitNumber && !isValidUnit(unitNumber) && (
                <p className="text-sm font-medium text-coral mt-1.5">
                  Unit {unitNumber} doesn&apos;t exist. Valid: 101-153, 201-253.
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What was done?"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background
                         text-base resize-none focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </div>

          {/* Cost and Vendor side by side */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Cost ($)</label>
              <input
                type="text"
                inputMode="decimal"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0"
                className="w-full h-12 px-3 rounded-lg border border-border bg-background
                           text-base focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Assignee</label>
              <input
                type="text"
                value={vendor}
                onChange={(e) => setVendor(e.target.value)}
                placeholder="Optional"
                className="w-full h-12 px-3 rounded-lg border border-border bg-background
                           text-base focus:outline-none focus:ring-2 focus:ring-sage/30"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Date</label>
            <input
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
              className="w-full h-12 px-3 rounded-lg border border-border bg-background
                         text-base focus:outline-none focus:ring-2 focus:ring-sage/30"
            />
          </div>

          {/* Status toggle */}
          <div>
            <label className="block text-xs font-medium text-foreground-secondary mb-1.5">Status</label>
            <div className="flex gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px]
                              ${status === s.value
                                ? s.value === 'open'
                                  ? 'bg-coral text-white'
                                  : s.value === 'scheduled'
                                    ? 'bg-gold text-white'
                                    : 'bg-sage text-white'
                                : 'bg-background border border-border text-foreground/60'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            {onDelete && (
              <button
                onClick={handleDelete}
                className={`flex-1 h-12 rounded-lg text-sm font-medium transition-colors
                           ${confirmDelete
                             ? 'bg-coral text-white'
                             : 'border border-coral text-coral active:bg-coral/10'}`}
              >
                {confirmDelete ? 'Confirm Delete?' : 'Delete'}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !description.trim() || (scope === 'unit' && !unitNumber.trim())}
              className="flex-1 h-12 rounded-lg bg-sage text-white text-sm font-semibold
                         disabled:opacity-50 active:brightness-90 transition-all"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
