set search_path = "gestik";
/*drop table if exists "anotaciones";*/
create table "anotaciones" (
  "anotacion" bigint, 
  "ticket" bigint, 
  "usuario" text, 
  "detalle" text, 
  "timestamp" timestamp default current_timestamp
, primary key ("anotacion", "ticket")
);
grant select, insert, update, delete on "anotaciones" to gestik_muleto_admin;
grant all on "anotaciones" to gestik_muleto_owner;

alter table "anotaciones" add constraint "usuario<>''" check ("usuario"<>'');
alter table "anotaciones" add constraint "detalle<>''" check ("detalle"<>'');

alter table "anotaciones" add constraint "anotaciones tickets REL" foreign key ("ticket") references "tickets" ("ticket")  on update cascade;
alter table "anotaciones" add constraint "anotaciones usuarios REL" foreign key ("usuario") references "usuarios" ("usuario")  on update cascade;

create index "ticket 4 anotaciones IDX" ON "anotaciones" ("ticket");
create index "usuario 4 anotaciones IDX" ON "anotaciones" ("usuario");

CREATE SEQUENCE "anotacion_seq" START 1;
ALTER TABLE "anotaciones" ALTER COLUMN "anotacion" SET DEFAULT nextval('anotacion_seq'::regclass);
GRANT USAGE, SELECT ON SEQUENCE "anotacion_seq" TO gestik_muleto_admin;

alter table "tickets" drop constraint if exists "tickets equipos REL";
alter table "tickets" add constraint "tickets eqreq REL" foreign key ("equipo_requirente") references "equipos" ("equipo")  on update cascade;
alter table "tickets" add constraint "tickets eqdest REL" foreign key ("destino") references "equipos" ("equipo")  on update cascade;

create index "destino 4 tickets IDX" ON "tickets" ("destino");