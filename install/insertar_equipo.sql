DROP FUNCTION if exists insertar_equipo_trg();
CREATE OR REPLACE FUNCTION insertar_equipo_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
DECLARE
  proyecto RECORD;
  equipo TEXT = new.equipo;
begin
  FOR proyecto IN SELECT * FROM gestik.proyectos where es_general = true LOOP
    INSERT INTO gestik.equipos_proyectos (equipo, proyecto)
    VALUES (equipo, proyecto.proyecto);
  END LOOP;
  return new;
end;
$BODY$;

DROP TRIGGER IF EXISTS insertar_equipo_trg ON equipos CASCADE;
CREATE TRIGGER insertar_equipo_trg
  AFTER INSERT 
  ON equipos
  FOR EACH ROW
  EXECUTE PROCEDURE insertar_equipo_trg(); 