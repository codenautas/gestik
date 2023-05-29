-- Column: gestik.tickets.ticket

-- ALTER TABLE IF EXISTS gestik.tickets DROP COLUMN IF EXISTS ticket;

ALTER TABLE IF EXISTS gestik.tickets alter COLUMN ticket set DEFAULT 0;

ALTER TABLE IF EXISTS gestik.tickets alter cOLUMN proyecto set not null;
-- PK anotaciones:
alter table anotaciones add column proyecto text;
update anotaciones set proyecto = (select proyecto from tickets where tickets.ticket = anotaciones.ticket);

ALTER TABLE IF EXISTS gestik.anotaciones DROP CONSTRAINT IF EXISTS anotaciones_pkey;
ALTER TABLE IF EXISTS gestik.anotaciones
    ADD CONSTRAINT anotaciones_pkey PRIMARY KEY (proyecto, ticket, anotacion);

-- 
ALTER TABLE IF EXISTS gestik.anotaciones DROP CONSTRAINT IF EXISTS "anotaciones tickets REL";

ALTER TABLE IF EXISTS gestik.tickets DROP CONSTRAINT IF EXISTS tickets_pkey;
ALTER TABLE IF EXISTS gestik.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (proyecto, ticket);

ALTER TABLE IF EXISTS gestik.anotaciones
    ADD CONSTRAINT "anotaciones tickets REL" FOREIGN KEY (proyecto, ticket)
    REFERENCES gestik.tickets (proyecto, ticket) MATCH SIMPLE
    ON UPDATE CASCADE
    ON DELETE NO ACTION;
	
--	

set role to gestik_owner; 
set search_path = gestik;

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

/*
Ejemplo para probar que ande la pk:

delete from tickets where ticket = 0;
insert into tickets (proyecto, ticket, asunto, requirente) values ('DEMECU',0,'blablabla','emilio');
select * from tickets where proyecto = 'DEMECU';
*/
