set search_path=gestik;
alter table "anotaciones" add column "archivo" text;
alter table "anotaciones" add constraint "archivo<>''" check ("archivo"<>'');
alter table "anotaciones" add unique ("archivo");