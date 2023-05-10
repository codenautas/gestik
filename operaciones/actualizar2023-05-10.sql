set search_path=gestik;
alter table "tickets" rename column destino to equipo_asignado
ALTER TABLE "tickets" DROP CONSTRAINT "destino<>''";
alter table "tickets" add constraint "equipo_asignado<>''" check ("equipo_asignado"<>'');
alter table "tickets" add constraint "tickets eqas REL" foreign key ("equipo_asignado") references "equipos" ("equipo")  on update cascade;
alter table "tickets" drop constraint if exists "tickets eqdest REL";
drop index "destino 4 tickets IDX";
create index "equipo_asignado 4 tickets IDX" ON "tickets" ("equipo_asignado");