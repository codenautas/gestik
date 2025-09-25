set search_path = gestik;
set role = gestik_owner;

CREATE SEQUENCE "anotaciones_id_seq" START 1;
select setval('anotaciones_id_seq', (SELECT MAX(anotacion) + 1 FROM gestik.anotaciones));
ALTER TABLE "anotaciones" ALTER COLUMN "anotacion" SET DEFAULT nextval('anotaciones_id_seq'::regclass);
GRANT USAGE, SELECT ON SEQUENCE "anotaciones_id_seq" TO gestik_admin;