-- set role to gestik_owner; 
-- set search_path = gestik;

DROP FUNCTION if exists ticket_pk_trg();
CREATE OR REPLACE FUNCTION ticket_pk_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
declare
  v_ultimo bigint;
begin
  if new.ticket <> 0 then
    null;
  else
    select max(ticket) 
	  into v_ultimo
	  from tickets
	  where proyecto = new.proyecto;
	new.ticket := coalesce(v_ultimo, 0) + 1;
  end if;
  return new;
end;
$BODY$;

DROP TRIGGER IF EXISTS ticket_pk_trg ON tickets;
CREATE TRIGGER ticket_pk_trg
   before INSERT 
   ON tickets
   FOR EACH ROW
   EXECUTE PROCEDURE ticket_pk_trg();   
