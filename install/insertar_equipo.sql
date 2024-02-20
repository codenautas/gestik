CREATE OR REPLACE FUNCTION insertar_equipo_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
DECLARE
  equipo_new TEXT = new.equipo;
begin
    INSERT INTO gestik.equipos_proyectos (equipo, proyecto)
    SELECT equipo_new, proyecto
    FROM gestik.proyectos 
    WHERE es_general = true;
  return new;
end;
$BODY$;

CREATE TRIGGER insertar_equipo_trg
  AFTER INSERT 
  ON equipos
  FOR EACH ROW
  EXECUTE PROCEDURE insertar_equipo_trg(); 