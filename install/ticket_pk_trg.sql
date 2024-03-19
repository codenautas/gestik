/* PARA CORRERLO VARIAS VECES. No COMMITEAR descomentado
  set role to gestik_owner; 
  set search_path = gestik;
  DROP TRIGGER IF EXISTS ticket_pk_trg ON tickets;
  DROP FUNCTION IF EXISTS ticket_pk_trg();
  DROP FUNCTION IF EXISTS get_next_ticket_number(p_proyecto text);
-- */

CREATE or REPLACE FUNCTION get_next_ticket_number(p_proyecto text) RETURNS bigint
  LANGUAGE SQL SECURITY DEFINER
AS
$SQL$
  SELECT coalesce((SELECT max(ticket + 1) FROM tickets WHERE proyecto = p_proyecto), 1)
$SQL$;

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
   	new.ticket := get_next_ticket_number(new.proyecto);
  end if;
  return new;
end;
$BODY$;

CREATE OR REPLACE TRIGGER ticket_pk_trg
   before INSERT 
   ON tickets
   FOR EACH ROW
   EXECUTE PROCEDURE ticket_pk_trg();   
