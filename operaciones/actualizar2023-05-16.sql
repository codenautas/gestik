set search_path=gestik;
ALTER TABLE tickets RENAME CONSTRAINT "tickets useras REL" TO "tickets usuario_asignado REL";
ALTER TABLE tickets RENAME CONSTRAINT "tickets userreq REL" TO "tickets usuario_requirente REL";
alter table "tickets" add constraint "tickets equipo_requirente REL" foreign key ("equipo_requirente") references "equipos" ("equipo")  on update cascade;
ALTER TABLE tickets RENAME CONSTRAINT "tickets eqas REL" TO "tickets equipo_asignado REL";