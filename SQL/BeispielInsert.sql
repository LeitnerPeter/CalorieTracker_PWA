-- Kategorien
insert into public.categories (name) values
('Frühstück'), ('Gebäck'), ('Riegel'), ('Gemüse'), ('Obst'), ('Daily'), ('Oats'), ('Protein'), ('Milchprodukte');

-- Items (Nährwerte pro 100 g/ml)
insert into public.items (name, unit, kcal_per_100, protein_per_100, fat_per_100, carbs_per_100) values
('Banane', 'g', 89, 1.10, 0.30, 23.00),
('Haferflocken', 'g', 372, 13.50, 7.00, 59.00),
('Magerquark', 'g', 68, 12.00, 0.20, 4.00);

-- Zuordnungen
-- Banane → Obst
insert into public.item_categories (item_id, category_id)
select i.id, c.id from public.items i, public.categories c
where i.name='Banane' and c.name='Obst';

-- Haferflocken → Frühstück, Proteinreich
insert into public.item_categories (item_id, category_id)
select i.id, c.id from public.items i, public.categories c
where i.name='Haferflocken' and c.name in ('Frühstück','Oats', 'Protein');

-- Magerquark → Frühstück, Proteinreich
insert into public.item_categories (item_id, category_id)
select i.id, c.id from public.items i, public.categories c
where i.name='Magerquark' and c.name in ('Frühstück','Protein', 'Milchprodukte');