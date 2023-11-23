set search_path = gestik;

alter table estados add column registrar_fechas text;
alter table estados add column esta_pendiente boolean not null default true;

update estados set esta_pendiente = false
  where estado in ('borrador', 'verificado', 'finalizado', 'anulado');