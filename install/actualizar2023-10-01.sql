set search_path = gestik;

update anotaciones set archivo = proyecto || '/' || ticket || '/' || archivo
  where archivo is not null and archivo not like '%/%';
  
