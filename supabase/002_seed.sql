-- Seed property
insert into properties (id, name, unit_count, address)
values (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Metro Fremont',
  106,
  '39000 Fremont Blvd, Fremont, CA 94538'
);

-- Seed work orders (25 entries spanning Nov 2025 - Feb 2026)
insert into work_orders (property_id, scope, unit_number, description, cost, vendor, status, work_date, tags) values

-- November 2025
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '108', 'Fixed leaky kitchen faucet, replaced washers and aerator', 95.00, 'Mike''s Plumbing', 'completed', '2025-11-05', '{"plumbing", "repair", "kitchen"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '215', 'Replaced garbage disposal unit, old one seized up', 280.00, 'Mike''s Plumbing', 'completed', '2025-11-08', '{"plumbing", "appliance", "kitchen", "replacement"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'complex', null, 'Fall landscaping - trimmed hedges, cleared gutters, leaf removal', 1200.00, 'Green Valley Landscaping', 'completed', '2025-11-12', '{"landscaping", "seasonal", "exterior"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '142', 'Replaced smoke detector batteries in all rooms', null, null, 'completed', '2025-11-14', '{"safety", "maintenance", "smoke detector"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '203', 'Patched and painted drywall damage from water leak', 350.00, 'Pro Painters Inc', 'completed', '2025-11-18', '{"painting", "repair", "drywall", "water damage"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'building', null, 'Elevator annual inspection and certification', 850.00, 'Pacific Elevator Co', 'completed', '2025-11-20', '{"elevator", "inspection", "safety", "certification"}'),

-- December 2025
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '242', 'Replaced refrigerator - compressor failed, not worth repairing', 950.00, 'Bay Area Appliance', 'completed', '2025-12-02', '{"appliance", "replacement", "kitchen", "refrigerator"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '131', 'Unclogged bathroom drain, snaked main line', 175.00, 'Mike''s Plumbing', 'completed', '2025-12-05', '{"plumbing", "repair", "bathroom", "drain"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'complex', null, 'Parking lot restriping and speed bump repaint', 2200.00, 'AllPave Striping', 'completed', '2025-12-08', '{"parking", "exterior", "painting"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '119', 'Replaced carpet in living room and bedroom, old carpet stained', 1800.00, 'Floor Masters', 'completed', '2025-12-10', '{"flooring", "carpet", "replacement"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '248', 'Fixed running toilet, replaced flapper valve and fill valve', 120.00, 'Mike''s Plumbing', 'completed', '2025-12-15', '{"plumbing", "repair", "bathroom", "toilet"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'building', null, 'Fire extinguisher inspection and replacement of 4 expired units', 450.00, 'SafetyFirst Inc', 'completed', '2025-12-18', '{"safety", "fire", "inspection", "extinguisher"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '153', 'Pest control treatment - roach issue reported by tenant', 150.00, 'Terminix', 'completed', '2025-12-20', '{"pest control", "roach", "treatment"}'),

-- January 2026
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '242', 'Fixed leaky bathroom faucet, replaced cartridge', 85.00, 'Mike''s Plumbing', 'completed', '2026-01-06', '{"plumbing", "repair", "bathroom", "faucet"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '210', 'Replaced HVAC air filter and cleaned condensate drain', null, null, 'completed', '2026-01-08', '{"hvac", "maintenance", "filter"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'complex', null, 'Irrigation system winterization and backflow test', 600.00, 'Green Valley Landscaping', 'completed', '2026-01-12', '{"irrigation", "landscaping", "seasonal", "exterior"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '135', 'Replaced dishwasher - old unit leaking from bottom seal', 650.00, 'Bay Area Appliance', 'completed', '2026-01-15', '{"appliance", "replacement", "kitchen", "dishwasher"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'building', null, 'Hallway painting - floors 1 and 2 common areas', 3200.00, 'Pro Painters Inc', 'completed', '2026-01-20', '{"painting", "hallway", "common area"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '108', 'Replaced garbage disposal, old one leaking from bottom', 180.00, 'Mike''s Plumbing', 'completed', '2026-01-25', '{"plumbing", "appliance", "kitchen", "replacement"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '227', 'Rekeyed front door lock, tenant lost keys', 75.00, 'FastKey Locksmith', 'completed', '2026-01-28', '{"locksmith", "security", "door"}'),

-- February 2026
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '242', 'Replaced garbage disposal, unit was making grinding noise', 180.00, 'Mike''s Plumbing', 'completed', '2026-02-03', '{"plumbing", "appliance", "kitchen", "replacement"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '116', 'AC not cooling - recharged refrigerant and cleaned coils', 325.00, 'ABC Electric & HVAC', 'completed', '2026-02-06', '{"hvac", "repair", "ac"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '201', 'Window screen replacement in bedroom, screen torn', 45.00, null, 'completed', '2026-02-08', '{"maintenance", "window", "screen"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'unit', '145', 'Reported ceiling water stain, need to check unit above for leak', null, null, 'open', '2026-02-10', '{"water damage", "ceiling", "investigation"}'),

('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'building', null, 'Roof inspection scheduled after recent rain damage reports', null, 'Pacific Roofing', 'scheduled', '2026-02-17', '{"roof", "inspection", "scheduled"}');
