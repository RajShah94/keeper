-- Properties table
create table properties (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  unit_count integer,
  address text,
  created_at timestamptz default now()
);

-- Work orders table
create table work_orders (
  id uuid default gen_random_uuid() primary key,
  property_id uuid references properties(id),
  scope text not null check (scope in ('unit', 'building', 'complex')),
  unit_number text,
  description text not null,
  cost decimal(10,2),
  vendor text,
  status text default 'completed' check (status in ('open', 'scheduled', 'completed')),
  work_date date not null default current_date,
  photos text[],
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for common queries
create index idx_work_orders_property on work_orders(property_id);
create index idx_work_orders_unit on work_orders(unit_number);
create index idx_work_orders_date on work_orders(work_date desc);
create index idx_work_orders_status on work_orders(status);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger work_orders_updated_at
  before update on work_orders
  for each row execute function update_updated_at();
