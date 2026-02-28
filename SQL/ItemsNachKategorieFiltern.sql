select i.*
from public.items i
join public.item_categories ic on ic.item_id = i.id
join public.categories c on c.id = ic.category_id
where c.name = 'Proteinreich'
order by i.name;
``