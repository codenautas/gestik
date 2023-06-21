CREATE OR REPLACE FUNCTION gestik.tickets_actualizar_fecha_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
declare
  v_registrar_fechas text;
begin
  	if(old.estado != new.estado) then
      select registrar_fechas into v_registrar_fechas from estados where new.estado = estado;
      if 'f_realizacion' = v_registrar_fechas and new.f_realizacion is null THEN new.f_realizacion := current_date; end if;
      if 'f_instalacion' = v_registrar_fechas and new.f_instalacion is null THEN new.f_instalacion := current_date; end if;
  	end if;
  return new;
end;
$BODY$;

CREATE TRIGGER tickets_actualizar_fecha_trg
  before UPDATE 
  ON tickets
  FOR EACH ROW
  EXECUTE PROCEDURE gestik.tickets_actualizar_fecha_trg(); 