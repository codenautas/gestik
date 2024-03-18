create table "archivos_borrar" (
  "ruta_archivo" text
, primary key ("ruta_archivo")
);
grant select, insert, update, delete on "archivos_borrar" to gestik_admin;
grant all on "archivos_borrar" to gestik_owner;

alter table "archivos_borrar" add constraint "ruta_archivo<>''" check ("ruta_archivo"<>'');