select
  i.id,
  i.name,
  i.unit,
  i.kcal_per_100,
  i.protein_per_100,
  i.fat_per_100,
  i.carbs_per_100,
  array_remove(array_agg(distinct c.name), null) as categories
from public.items i
left join public.item_categories ic on ic.item_id = i.id
left join public.categories c on c.id = ic.category_id
group by i.id
order by i.name;