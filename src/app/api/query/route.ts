import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { ParsedAskResult, QueryResult, WorkOrder } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const parsed: ParsedAskResult = await request.json();
    const { query_type, filters, natural_response } = parsed;

    // Build the base query
    let query = supabase.from('work_orders').select('*');

    // Apply filters
    if (filters.unit_number) {
      query = query.eq('unit_number', filters.unit_number);
    }
    if (filters.scope) {
      query = query.eq('scope', filters.scope);
    }
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }
    if (filters.date_from) {
      query = query.gte('work_date', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('work_date', filters.date_to);
    }
    if (filters.tags && filters.tags.length > 0) {
      query = query.overlaps('tags', filters.tags);
    }
    if (filters.vendor) {
      query = query.ilike('vendor', `%${filters.vendor}%`);
    }
    if (filters.cost_is_null === true) {
      query = query.is('cost', null);
    }
    if (filters.floor) {
      // Floor 1 = units 101-153, Floor 2 = units 201-253
      const floorStart = `${filters.floor}01`;
      const floorEnd = `${filters.floor}53`;
      query = query.eq('scope', 'unit').gte('unit_number', floorStart).lte('unit_number', floorEnd);
    }
    if (filters.description_search) {
      query = query.ilike('description', `%${filters.description_search}%`);
    }

    query = query.order('work_date', { ascending: false });

    const { data: workOrders, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const orders = (workOrders || []) as WorkOrder[];
    const result: QueryResult = {
      type: query_type,
      natural_response,
      work_orders: orders,
    };

    // Compute aggregates if needed
    if (query_type === 'aggregate' && parsed.aggregate) {
      const aggregateData: { label: string; value: string | number }[] = [];

      if (parsed.aggregate === 'count') {
        // Pure count query — just show the count, no cost stats
        aggregateData.push({ label: 'Count', value: `${orders.length}` });
      } else if (parsed.aggregate_field === 'cost') {
        // Cost-related query (sum, avg)
        const costs = orders.filter((o) => o.cost !== null).map((o) => o.cost as number);
        const total = costs.reduce((sum, c) => sum + c, 0);
        aggregateData.push({ label: 'Total Cost', value: `$${Math.round(total).toLocaleString()}` });
        aggregateData.push({ label: 'Number of Orders', value: `${orders.length}` });
        if (costs.length > 0) {
          const avg = Math.round(total / costs.length);
          const label = costs.length < orders.length
            ? `Average Cost (${costs.length} of ${orders.length} have cost)`
            : 'Average Cost';
          aggregateData.push({ label, value: `$${avg}` });
        }
      }

      result.aggregate_data = aggregateData;
    }

    // Compute rankings if needed
    if (query_type === 'rank' && parsed.rank_group) {
      const groups = new Map<string, { count: number; costSum: number; orders: typeof orders }>();

      for (const order of orders) {
        let key: string;
        if (parsed.rank_group === 'unit_number') {
          key = order.unit_number || order.scope;
        } else if (parsed.rank_group === 'vendor') {
          key = order.vendor || 'In-house';
        } else {
          key = (order.tags || []).join(', ') || 'untagged';
        }

        const existing = groups.get(key) || { count: 0, costSum: 0, orders: [] };
        existing.count += 1;
        existing.costSum += order.cost || 0;
        existing.orders.push(order);
        groups.set(key, existing);
      }

      // Sort by the ranking criteria
      const sorted = [...groups.entries()].sort((a, b) => {
        if (parsed.rank_by === 'cost_sum') return b[1].costSum - a[1].costSum;
        return b[1].count - a[1].count;
      });

      const limit = parsed.limit || 10;
      result.rank_data = sorted.slice(0, limit).map(([label, data], i) => ({
        rank: i + 1,
        label,
        value: parsed.rank_by === 'cost_sum'
          ? `$${Math.round(data.costSum)}`
          : `${data.count} orders`,
        orders: data.orders,
      }));
    }

    // For rank queries, don't include the flat work_orders list — orders are grouped in rank_data
    if (query_type === 'rank') {
      result.work_orders = [];
    }

    // Update natural response with actual counts
    if (query_type === 'list') {
      result.natural_response = `Found ${orders.length} matching work order${orders.length === 1 ? '' : 's'}`;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Query error:', error);
    return NextResponse.json({ error: 'Query failed' }, { status: 500 });
  }
}
