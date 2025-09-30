ALTER TABLE IF EXISTS anotaciones alter COLUMN anotacion set DEFAULT 0;
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

CREATE TRIGGER anotacion_pk_trg
  before INSERT 
  ON anotaciones
  FOR EACH ROW
  EXECUTE PROCEDURE anotacion_pk_trg();  