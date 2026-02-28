-- Erweiterungen (IDs/Performance)
create extension if not exists pgcrypto; -- für gen_random_uuid()
create extension if not exists pg_trgm;  -- optional für fuzzy search auf name

-- 1) Kategorien
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Items (Lebensmittel/Gerichte)
-- Nährwerte pro 100 g/ml für saubere Berechnung
create table public.items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'g',         -- Anzeigeeinheit: 'g', 'ml', 'Stück' usw.
  kcal_per_100 numeric(8,2) not null check (kcal_per_100 >= 0),
  protein_per_100 numeric(8,2) not null default 0,
  fat_per_100 numeric(8,2) not null default 0,
  carbs_per_100 numeric(8,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3) N:M Zuordnung Item ↔ Kategorie
create table public.item_categories (
  item_id uuid not null references public.items(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  primary key (item_id, category_id)
);

-- Trigger-Funktion für updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_categories_set_updated
before update on public.categories
for each row execute procedure public.set_updated_at();

create trigger trg_items_set_updated
before update on public.items
for each row execute procedure public.set_updated_at();

-- Indizes für Suche/Filter
create index if not exists idx_items_name on public.items using gin (name gin_trgm_ops);
create index if not exists idx_categories_name on public.categories using gin (name gin_trgm_ops);
create index if not exists idx_item_categories_category on public.item_categories (category_id, item_id);
create index if not exists idx_item_categories_item on public.item_categories (item_id, category_id);
``