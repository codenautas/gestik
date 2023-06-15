set search_path=gestik;
alter table "estados" add column "registrar_fecha" text;
alter table "estados" add constraint "registrar_fecha<>''" check ("registrar_fecha"<>'');

DROP FUNCTION if exists gestik.estado_registrar_fecha_trg();
CREATE OR REPLACE FUNCTION gestik.estado_registrar_fecha_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
declare
  v_ultimo text;
begin
  	if(old.estado != new.estado) then
		select registrar_fecha into v_ultimo from estados where new.estado = estado;
		if 'f_realizacion' = v_ultimo and new.f_realizacion is null THEN new.f_realizacion := current_date; end if;
	  	if 'f_instalacion' = v_ultimo and new.f_instalacion is null THEN new.f_instalacion := current_date; end if;
  	end if;
  return new;
end;
$BODY$;

DROP TRIGGER IF EXISTS estado_registrar_fecha_trg ON estados;
CREATE TRIGGER estado_registrar_fecha_trg
  before UPDATE 
  ON tickets
  FOR EACH ROW
  EXECUTE PROCEDURE gestik.estado_registrar_fecha_trg(); 