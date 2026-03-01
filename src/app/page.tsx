'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { WorkOrder, ParsedEntry, QueryResult } from '@/lib/types';
import EntryCard from '@/components/EntryCard';
import EditSheet from '@/components/EditSheet';
import MicButton from '@/components/MicButton';
import ConfirmEntry from '@/components/ConfirmEntry';
import BatchReview from '@/components/BatchReview';
import QueryResults from '@/components/QueryResults';
import Toast from '@/components/Toast';

type AppMode = 'feed' | 'edit' | 'confirm' | 'batch' | 'query';

// Get "YYYY-MM" key from a date string
function getMonthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

// Format "YYYY-MM" to "February 2026"
function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Sort: open/scheduled first (desc by date), then completed (desc by date)
function sortOrders(orders: WorkOrder[]): WorkOrder[] {
  return [...orders].sort((a, b) => {
    const aActive = a.status !== 'completed' ? 0 : 1;
    const bActive = b.status !== 'completed' ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return b.work_date.localeCompare(a.work_date);
  });
}

interface MonthGroup {
  key: string;
  label: string;
  orders: WorkOrder[];
  hasOpen: boolean;
  hasScheduled: boolean;
}

function groupByMonth(orders: WorkOrder[]): MonthGroup[] {
  const map = new Map<string, WorkOrder[]>();
  for (const order of orders) {
    const key = getMonthKey(order.work_date);
    const list = map.get(key) || [];
    list.push(order);
    map.set(key, list);
  }

  // Sort month keys descending
  const sortedKeys = [...map.keys()].sort((a, b) => b.localeCompare(a));

  return sortedKeys.map((key) => {
    const monthOrders = sortOrders(map.get(key)!);
    return {
      key,
      label: formatMonthLabel(key),
      orders: monthOrders,
      hasOpen: monthOrders.some((o) => o.status === 'open'),
      hasScheduled: monthOrders.some((o) => o.status === 'scheduled'),
    };
  });
}

export default function Home() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<AppMode>('feed');
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [pendingEntries, setPendingEntries] = useState<ParsedEntry[]>([]);
  const [transcript, setTranscript] = useState('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [processing, setProcessing] = useState(false);
  const [editingBatchIndex, setEditingBatchIndex] = useState<number | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const didInitialExpand = useRef(false);

  const monthGroups = useMemo(() => groupByMonth(orders), [orders]);

  // On initial load only, expand the current month
  useEffect(() => {
    if (monthGroups.length > 0 && !didInitialExpand.current) {
      didInitialExpand.current = true;
      const now = new Date();
      const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      setExpandedMonths(new Set([currentKey]));
    }
  }, [monthGroups]);

  const toggleMonth = (key: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // Focus a specific month (collapse all others, expand target)
  const focusMonth = (monthKey: string) => {
    setExpandedMonths(new Set([monthKey]));
  };

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/work-orders');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setOrders(data);
    } catch {
      setToast({ message: 'Could not load entries', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Save a work order (create or update)
  const handleSave = async (data: Partial<WorkOrder>) => {
    // If editing a batch entry, update it in-place and return to batch review
    if (editingBatchIndex !== null) {
      setPendingEntries((prev) => {
        const next = [...prev];
        next[editingBatchIndex] = {
          scope: data.scope || 'unit',
          unit_number: data.unit_number || null,
          description: data.description || '',
          cost: data.cost ?? null,
          vendor: data.vendor || null,
          status: data.status || 'completed',
          work_date: data.work_date || new Date().toISOString().slice(0, 10),
          tags: data.tags || [],
        };
        return next;
      });
      setEditingBatchIndex(null);
      setSelectedOrder(null);
      setMode('batch');
      return;
    }

    try {
      const method = data.id ? 'PUT' : 'POST';
      const res = await fetch('/api/work-orders', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Save failed');

      if (navigator.vibrate) navigator.vibrate(50);
      setToast({ message: data.id ? 'Entry updated' : 'Entry saved', type: 'success' });
      setMode('feed');
      setSelectedOrder(null);

      // Focus the month of the saved entry
      if (data.work_date) {
        focusMonth(getMonthKey(data.work_date));
      }

      fetchOrders();
    } catch {
      setToast({ message: 'Could not save entry', type: 'error' });
    }
  };

  // Delete a work order
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/work-orders?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');

      if (navigator.vibrate) navigator.vibrate(50);
      setToast({ message: 'Entry deleted', type: 'success' });
      setMode('feed');
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      setToast({ message: 'Could not delete entry', type: 'error' });
    }
  };

  // Handle voice transcript from MicButton
  const handleTranscript = async (text: string) => {
    setTranscript(text);
    setProcessing(true);

    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      });
      if (!res.ok) throw new Error('Parse failed');
      const parsed = await res.json();

      if (parsed.intent === 'ask') {
        const queryRes = await fetch('/api/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
        if (!queryRes.ok) throw new Error('Query failed');
        const queryData = await queryRes.json();
        setQueryResult(queryData);
        setMode('query');
      } else if (parsed.intent === 'log') {
        const entries = parsed.entries as ParsedEntry[];
        setPendingEntries(entries);
        if (entries.length === 1) {
          setMode('confirm');
        } else {
          setMode('batch');
        }
      }
    } catch {
      setToast({ message: "Didn't catch that. Try again?", type: 'error' });
    } finally {
      setProcessing(false);
    }
  };

  // Save confirmed single entry
  const handleConfirmSave = async () => {
    if (pendingEntries.length === 0) return;
    const entry = pendingEntries[0];
    await handleSave({
      scope: entry.scope,
      unit_number: entry.unit_number,
      description: entry.description,
      cost: entry.cost,
      vendor: entry.vendor,
      status: entry.status,
      work_date: entry.work_date,
      tags: entry.tags,
    });
    setPendingEntries([]);
  };

  // Save all batch entries
  const handleBatchSave = async (entries: ParsedEntry[]) => {
    // Determine which month to focus (use first entry's date)
    const firstDate = entries[0]?.work_date;

    for (const entry of entries) {
      const method = 'POST';
      const res = await fetch('/api/work-orders', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope: entry.scope,
          unit_number: entry.unit_number,
          description: entry.description,
          cost: entry.cost,
          vendor: entry.vendor,
          status: entry.status,
          work_date: entry.work_date,
          tags: entry.tags,
        }),
      });
      if (!res.ok) {
        setToast({ message: 'Could not save some entries', type: 'error' });
      }
    }

    if (navigator.vibrate) navigator.vibrate(50);
    setToast({ message: `${entries.length} entries saved`, type: 'success' });
    setMode('feed');
    setPendingEntries([]);

    if (firstDate) {
      focusMonth(getMonthKey(firstDate));
    }

    fetchOrders();
  };

  // Card tap → open edit sheet
  const handleCardTap = (order: WorkOrder) => {
    setSelectedOrder(order);
    setMode('edit');
  };

  // "+" button → new entry
  const handleNewEntry = () => {
    setSelectedOrder(null);
    setMode('edit');
  };

  // Close any overlay → back to feed
  const handleClose = () => {
    setMode('feed');
    setSelectedOrder(null);
    setPendingEntries([]);
    setQueryResult(null);
    setEditingBatchIndex(null);
  };

  // Edit a single entry from batch review
  const handleBatchEditEntry = (index: number) => {
    const entry = pendingEntries[index];
    setEditingBatchIndex(index);
    setSelectedOrder({
      id: '',
      property_id: '',
      scope: entry.scope,
      unit_number: entry.unit_number,
      description: entry.description,
      cost: entry.cost,
      vendor: entry.vendor,
      status: entry.status,
      work_date: entry.work_date,
      photos: [],
      tags: entry.tags,
      created_at: '',
      updated_at: '',
    });
    setMode('edit');
  };

  // Edit from confirm screen → open edit sheet with parsed data
  const handleConfirmEdit = () => {
    if (pendingEntries.length === 0) return;
    const entry = pendingEntries[0];
    setSelectedOrder({
      id: '',
      property_id: '',
      scope: entry.scope,
      unit_number: entry.unit_number,
      description: entry.description,
      cost: entry.cost,
      vendor: entry.vendor,
      status: entry.status,
      work_date: entry.work_date,
      photos: [],
      tags: entry.tags,
      created_at: '',
      updated_at: '',
    });
    setMode('edit');
    setPendingEntries([]);
  };

  return (
    <div className="min-h-screen bg-background pt-safe">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border px-5 pt-3 pb-3">
        <h1 className="text-lg font-bold text-foreground">Metro Fremont</h1>
        <p className="text-xs text-foreground-secondary">Maintenance Log</p>
      </header>

      {/* Feed */}
      <main className="px-5 pt-4 pb-40">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-sage border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sage">
                <rect x="9" y="1" width="6" height="12" rx="3" />
                <path d="M5 10a7 7 0 0 0 14 0" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <line x1="8" y1="21" x2="16" y2="21" />
              </svg>
            </div>
            <p className="text-sm text-foreground-secondary">
              Tap the mic and describe a maintenance issue
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthGroups.map((group) => {
              const isExpanded = expandedMonths.has(group.key);
              return (
                <div key={group.key}>
                  {/* Month header */}
                  <button
                    onClick={() => toggleMonth(group.key)}
                    className="w-full flex items-center justify-between py-3 px-1
                               active:bg-foreground/5 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {/* Chevron */}
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`text-foreground-secondary transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                      <span className="text-sm font-semibold text-foreground">{group.label}</span>
                      <span className="text-xs text-foreground-secondary">
                        ({group.orders.length})
                      </span>
                    </div>
                    {/* Unfinished indicator */}
                    <div className="flex items-center gap-2">
                      {group.hasOpen && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-coral">
                          <span className="w-2 h-2 rounded-full bg-coral" />
                          Open
                        </span>
                      )}
                      {group.hasScheduled && (
                        <span className="flex items-center gap-1.5 text-xs font-medium text-gold">
                          <span className="w-2 h-2 rounded-full bg-gold" />
                          Scheduled
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Cards */}
                  {isExpanded && (
                    <div className="space-y-2 pb-2">
                      {group.orders.map((order, i) => (
                        <EntryCard
                          key={order.id}
                          order={order}
                          onClick={() => handleCardTap(order)}
                          index={i}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom buttons: + and mic */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex items-end justify-center gap-4 pb-safe">
        <button
          onClick={handleNewEntry}
          className="w-12 h-12 rounded-full bg-card border border-border shadow-md
                     flex items-center justify-center text-foreground-secondary
                     active:scale-95 transition-transform"
          aria-label="Add entry manually"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        <MicButton
          onTranscript={handleTranscript}
          disabled={processing}
        />
      </div>

      {/* Edit Sheet */}
      {mode === 'edit' && (
        <EditSheet
          order={selectedOrder}
          onSave={handleSave}
          onDelete={selectedOrder?.id ? () => handleDelete(selectedOrder.id) : undefined}
          onClose={handleClose}
        />
      )}

      {/* Confirm Entry */}
      {mode === 'confirm' && pendingEntries.length > 0 && (
        <ConfirmEntry
          entry={pendingEntries[0]}
          transcript={transcript}
          onConfirm={handleConfirmSave}
          onEdit={handleConfirmEdit}
          onDiscard={handleClose}
        />
      )}

      {/* Batch Review */}
      {mode === 'batch' && pendingEntries.length > 0 && (
        <BatchReview
          entries={pendingEntries}
          transcript={transcript}
          onConfirmAll={handleBatchSave}
          onEditEntry={handleBatchEditEntry}
          onDiscard={handleClose}
        />
      )}

      {/* Query Results */}
      {mode === 'query' && queryResult && (
        <QueryResults
          result={queryResult}
          onClose={handleClose}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
