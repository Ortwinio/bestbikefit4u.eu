BestBikeFit4U dataset package

Files
- bike_models_top20_full.csv
  Full top-20 brand model-family seed list from the earlier conversation, with category, fit engine mapping, and intro year estimate.
- bike_geometry_starter_real_stack_reach.csv
  Real per-size stack/reach starter rows for a subset of models where exact stack|reach pairs were reliably extractable in this pass.
- bike_geometry_missing_queue.csv
  Models still queued for representative-geometry extraction.
- bike_category_fit_map.csv
  Category-to-fit-engine mapping used in the seed data.
- supabase_schema.sql
  Table DDL for Supabase/Postgres.
- supabase_seed.sql
  INSERT-based seed script for the CSV content.
- convex_seed.ts
  TypeScript seed arrays for Convex.

Important notes
- Intro years are estimates and should be validated against official brand archives before using them as user-facing facts.
- Geometry rows are representative latest-year stack/reach rows, not full multi-year geometry histories.
- For exact production bike matching, you should eventually extend bike_geometry to:
  brand + model + year + size + stack + reach + seat_tube_angle + head_tube_angle + wheelbase + bb_drop + chainstay.
- Geometry source URLs are included in the geometry CSV for auditability.

Recommended next import pass
1. Fill missing models from bike_geometry_missing_queue.csv.
2. Add seat tube angle, head tube angle, wheelbase, chainstay, and BB drop.
3. Split bike geometry into historical model-year tables.
4. Validate intro years against official Trek / Cannondale / Giant / Santa Cruz archives.
