set search_path=gestik;
alter table "anotaciones" add column "ticket_relacionado" bigint;
alter table "anotaciones" add column "proyecto_relacionado" text;
alter table "anotaciones" add constraint "proyecto_relacionado<>''" check ("proyecto_relacionado"<>'');
alter table "anotaciones" add constraint "ticket_relacionado" check ((proyecto_relacionado is null and ticket_relacionado is null) or (proyecto_relacionado is not null and ticket_relacionado is not null));

alter table "anotaciones" add constraint "anotaciones tickets_relacionados REL" foreign key ("proyecto_relacionado", "ticket_relacionado") references "tickets" ("proyecto", "ticket")  on update cascade;
alter table "anotaciones" add constraint "anotaciones proyectos_relacionados REL" foreign key ("proyecto_relacionado") references "proyectos" ("proyecto")  on update cascade;

create index "proyecto_relacionado,ticket_relacionado 4 anotaciones IDX" ON "anotaciones" ("proyecto_relacionado", "ticket_relacionado");
create index "proyecto_relacionado 4 anotaciones IDX" ON "anotaciones" ("proyecto_relacionado");
