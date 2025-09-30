set search_path = gestik;
set role = gestik_owner;

ALTER TABLE gestik.anotaciones ADD COLUMN numero_adjunto bigint;
CREATE SEQUENCE "numero_adjunto_seq" START 1;
ALTER TABLE "anotaciones" ALTER COLUMN "numero_adjunto" SET DEFAULT nextval('numero_adjunto_seq'::regclass);
GRANT USAGE, SELECT ON SEQUENCE "numero_adjunto_seq" TO gestik_admin;