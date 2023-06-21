set search_path=gestik;
alter table "estados" add column "registrar_fechas" text;
alter table "estados" add constraint "registrar_fechas<>''" check ("registrar_fechas"<>'');