set search_path = gestik;
ALTER TABLE IF EXISTS anotaciones alter COLUMN anotacion set DEFAULT 0;
DROP FUNCTION if exists anotacion_pk_trg();
CREATE OR REPLACE FUNCTION anotacion_pk_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
declare
  v_ultimo bigint;
begin
  if new.anotacion <> 0 then
    null;
  else
    select max(anotacion) 
	  into v_ultimo
	  from anotaciones
	  where proyecto = new.proyecto and ticket = new.ticket;
	new.anotacion := coalesce(v_ultimo, 0) + 1;
  end if;
  return new;
end;
$BODY$;

DROP TRIGGER IF EXISTS anotacion_pk_trg ON anotaciones;
CREATE TRIGGER anotacion_pk_trg
   before INSERT 
   ON anotaciones
   FOR EACH ROW
   EXECUTE PROCEDURE anotacion_pk_trg();  