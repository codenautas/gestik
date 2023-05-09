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
grant select, insert, update, delete on "anotaciones" to gestik_admin;
grant all on "anotaciones" to gestik_owner;

alter table "anotaciones" add constraint "usuario<>''" check ("usuario"<>'');
alter table "anotaciones" add constraint "detalle<>''" check ("detalle"<>'');

alter table "anotaciones" add constraint "anotaciones tickets REL" foreign key ("ticket") references "tickets" ("ticket")  on update cascade;
alter table "anotaciones" add constraint "anotaciones usuarios REL" foreign key ("usuario") references "usuarios" ("usuario")  on update cascade;

create index "ticket 4 anotaciones IDX" ON "anotaciones" ("ticket");
create index "usuario 4 anotaciones IDX" ON "anotaciones" ("usuario");

CREATE SEQUENCE "anotacion_seq" START 1;
ALTER TABLE "anotaciones" ALTER COLUMN "anotacion" SET DEFAULT nextval('anotacion_seq'::regclass);
GRANT USAGE, SELECT ON SEQUENCE "anotacion_seq" TO gestik_admin;

/*drop table if exists "tickets";*/
create table "tickets" (
  "ticket" bigint, 
  "tipo_ticket" text, 
  "asunto" text, 
  "descripcion" text, 
  "proyecto" text, 
  "prioridad" text, 
  "f_ticket" date default current_date, 
  "requirente" text default '!dump', 
  "equipo_requirente" text, 
  "estado" text, 
  "destino" text, 
  "asignado" text, 
  "version" text, 
  "esfuerzo_estimado" text, 
  "f_realizacion" date, 
  "f_instalacion" date, 
  "modulo" text, 
  "tema" text, 
  "observaciones" text, 
  "sugerencias_pei" text
, primary key ("ticket")
);
grant select, insert, update, delete on "tickets" to gestik_admin;
grant all on "tickets" to gestik_owner;


CREATE SEQUENCE "tickets_seq" START 1;
ALTER TABLE "tickets" ALTER COLUMN "ticket" SET DEFAULT nextval('tickets_seq'::regclass);
GRANT USAGE, SELECT ON SEQUENCE "tickets_seq" TO gestik_admin;

alter table "tickets" add constraint "tipo_ticket<>''" check ("tipo_ticket"<>'');
alter table "tickets" add constraint "asunto<>''" check ("asunto"<>'');
alter table "tickets" alter column "asunto" set not null;
alter table "tickets" add constraint "descripcion<>''" check ("descripcion"<>'');
alter table "tickets" add constraint "proyecto<>''" check ("proyecto"<>'');
alter table "tickets" add constraint "prioridad<>''" check ("prioridad"<>'');
alter table "tickets" add constraint "requirente<>''" check ("requirente"<>'');
alter table "tickets" add constraint "equipo_requirente<>''" check ("equipo_requirente"<>'');
alter table "tickets" add constraint "estado<>''" check ("estado"<>'');
alter table "tickets" add constraint "destino<>''" check ("destino"<>'');
alter table "tickets" add constraint "asignado<>''" check ("asignado"<>'');
alter table "tickets" add constraint "version<>''" check ("version"<>'');
alter table "tickets" add constraint "esfuerzo_estimado<>''" check ("esfuerzo_estimado"<>'');
alter table "tickets" add constraint "modulo<>''" check ("modulo"<>'');
alter table "tickets" add constraint "tema<>''" check ("tema"<>'');
alter table "tickets" add constraint "observaciones<>''" check ("observaciones"<>'');
alter table "tickets" add constraint "sugerencias_pei<>''" check ("sugerencias_pei"<>'');

alter table "tickets" add constraint "tickets estados REL" foreign key ("estado") references "estados" ("estado")  on update cascade;
alter table "tickets" add constraint "tickets proyectos REL" foreign key ("proyecto") references "proyectos" ("proyecto")  on update cascade;
alter table "tickets" add constraint "tickets useras REL" foreign key ("asignado") references "usuarios" ("usuario")  on update cascade;
alter table "tickets" add constraint "tickets userreq REL" foreign key ("requirente") references "usuarios" ("usuario")  on update cascade;
alter table "tickets" add constraint "tickets prioridades REL" foreign key ("prioridad") references "prioridades" ("prioridad")  on update cascade;
alter table "tickets" add constraint "tickets tipos_ticket REL" foreign key ("tipo_ticket") references "tipos_ticket" ("tipo_ticket")  on update cascade;
alter table "tickets" add constraint "tickets equipos REL" foreign key ("equipo_requirente", "destino") references "equipos" ("equipo", "equipo")  on update cascade;

create index "estado 4 tickets IDX" ON "tickets" ("estado");
create index "proyecto 4 tickets IDX" ON "tickets" ("proyecto");
create index "asignado 4 tickets IDX" ON "tickets" ("asignado");
create index "requirente 4 tickets IDX" ON "tickets" ("requirente");
create index "prioridad 4 tickets IDX" ON "tickets" ("prioridad");
create index "tipo_ticket 4 tickets IDX" ON "tickets" ("tipo_ticket");
create index "equipo_requirente,destino 4 tickets IDX" ON "tickets" ("equipo_requirente", "destino");