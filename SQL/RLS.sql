-- Spalte ergänzen (optional)
alter table public.items add column owner_id uuid references auth.users(id);
alter table public.categories add column owner_id uuid references auth.users(id);

-- RLS aktivieren (nur wenn nötig)
alter table public.items enable row level security;
alter table public.categories enable row level security;
alter table public.item_categories enable row level security;

-- Policies: Jeder liest alles (öffentlich),
-- Schreiben nur der Besitzer (oder owner_id null für globale Seeds)
create policy items_select_all on public.items for select using (true);
create policy items_write_owner on public.items for all
  using (owner_id = auth.uid() or owner_id is null)
  with check (owner_id = auth.uid() or owner_id is null);

create policy categories_select_all on public.categories for select using (true);
create policy categories_write_owner on public.categories for all
  using (owner_id = auth.uid() or owner_id is null)
  with check (owner_id = auth.uid() or owner_id is null);

-- Junction erbt Sichtbarkeit aus referenzierten Tabellen
create policy item_categories_select_all on public.item_categories for select using (true);
create policy item_categories_write_owner on public.item_categories for all using (
  exists (
    select 1 from public.items i where i.id = item_categories.item_id
      and (i.owner_id = auth.uid() or i.owner_id is null)
  ) and exists (
    select 1 from public.categories c where c.id = item_categories.category_id
      and (c.owner_id = auth.uid() or c.owner_id is null)
  )
) with check (
  exists (
    select 1 from public.items i where i.id = item_categories.item_id
      and (i.owner_id = auth.uid() or i.owner_id is null)
  ) and exists (
    select 1 from public.categories c where c.id = item_categories.category_id
      and (c.owner_id = auth.uid() or c.owner_id is null)
  )
);