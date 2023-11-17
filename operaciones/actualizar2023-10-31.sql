set search_path=gestik;

create table "roles" (
  "rol" text
, primary key ("rol")
);
grant select, insert, update, delete on "roles" to gestik_admin;
grant all on "roles" to gestik_owner;

alter table "roles" add constraint "rol<>''" check ("rol"<>'');

insert into "roles" ("rol") values ('admin'), ('usuario');

alter table "usuarios" add constraint "usuarios roles REL" foreign key ("rol") references "roles" ("rol")  on update cascade;
create index "rol 4 usuarios IDX" ON "usuarios" ("rol");
