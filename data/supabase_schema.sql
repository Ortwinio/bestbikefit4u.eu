create table if not exists public.bike_brands (
  brand_id text primary key,
  brand text not null unique
);

create table if not exists public.bike_models (
  model_slug text primary key,
  brand_id text not null references public.bike_brands(brand_id),
  brand text not null,
  model text not null,
  category text not null,
  fit_engine_profile text not null,
  fit_engine_variant text not null,
  intro_year_estimate integer,
  intro_year_confidence text default 'estimated',
  geometry_status text not null,
  is_active_assumption boolean default true,
  unique (brand_id, model)
);

create table if not exists public.bike_geometry (
  geometry_id bigserial primary key,
  model_slug text not null references public.bike_models(model_slug),
  brand_id text not null references public.bike_brands(brand_id),
  brand text not null,
  model text not null,
  representative_model_page text not null,
  representative_year integer not null,
  size_label text not null,
  stack_mm integer not null,
  reach_mm integer not null,
  data_quality text not null,
  source_url text,
  source_ref text,
  source_note text
);

create index if not exists bike_models_brand_idx on public.bike_models(brand_id);
create index if not exists bike_models_category_idx on public.bike_models(category);
create index if not exists bike_geometry_model_idx on public.bike_geometry(model_slug);
create index if not exists bike_geometry_stack_reach_idx on public.bike_geometry(stack_mm, reach_mm);