// Database types matching Supabase schema

export interface Property {
  id: string;
  name: string;
  unit_count: number | null;
  address: string | null;
  created_at: string;
}

export type WorkOrderScope = 'unit' | 'building' | 'complex';
export type WorkOrderStatus = 'open' | 'scheduled' | 'completed';

export interface WorkOrder {
  id: string;
  property_id: string;
  scope: WorkOrderScope;
  unit_number: string | null;
  description: string;
  cost: number | null;
  vendor: string | null;
  status: WorkOrderStatus;
  work_date: string;
  photos: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

// AI parsing types

export interface ParsedEntry {
  scope: WorkOrderScope;
  unit_number: string | null;
  description: string;
  cost: number | null;
  vendor: string | null;
  status: WorkOrderStatus;
  work_date: string;
  tags: string[];
}

export interface ParsedLogResult {
  intent: 'log';
  entries: ParsedEntry[];
}

export interface ParsedAskResult {
  intent: 'ask';
  query_type: 'list' | 'aggregate' | 'rank';
  natural_response: string;
  filters: {
    unit_number?: string;
    date_from?: string;
    date_to?: string;
    tags?: string[];
    scope?: WorkOrderScope;
    status?: WorkOrderStatus | WorkOrderStatus[];
    vendor?: string;
    cost_is_null?: boolean;
    floor?: number;
  };
  aggregate?: 'sum' | 'count' | 'avg' | null;
  aggregate_field?: 'cost' | null;
  rank_by?: 'count' | 'cost_sum' | null;
  rank_group?: 'unit_number' | 'vendor' | 'tags' | null;
  limit?: number;
}

export interface ParsedEditResult {
  intent: 'edit';
  changes: Partial<Pick<WorkOrder, 'scope' | 'unit_number' | 'description' | 'cost' | 'vendor' | 'status' | 'work_date'>>;
}

export type ParseResult = ParsedLogResult | ParsedAskResult | ParsedEditResult;

// Query result types for display

export interface QueryResult {
  type: 'list' | 'aggregate' | 'rank';
  natural_response: string;
  work_orders: WorkOrder[];
  aggregate_data?: {
    label: string;
    value: string | number;
  }[];
  rank_data?: {
    rank: number;
    label: string;
    value: string | number;
    orders: WorkOrder[];
  }[];
}
