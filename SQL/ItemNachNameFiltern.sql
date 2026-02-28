select i.*
from public.items i
where i.name % 'Ban'  -- fuzzy match
order by similarity(i.name, 'Ban') desc
limit 10;
