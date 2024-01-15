DROP FUNCTION if exists insertar_equipo_trg();
CREATE OR REPLACE FUNCTION insertar_equipo_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
DECLARE
  equipo TEXT = new.equipo;
  proyecto TEXT = (select proyecto from gestik.proyectos where proyecto = 'GENERAL');
begin
  if (proyecto = 'GENERAL')then
  	INSERT INTO gestik.equipos_proyectos (equipo, proyecto)
  	VALUES (equipo, 'GENERAL');
  end if;
  return new;
end;
$BODY$;

DROP TRIGGER IF EXISTS insertar_equipo_trg ON equipos;
CREATE TRIGGER insertar_equipo_trg
  AFTER INSERT 
  ON equipos
  FOR EACH ROW
  EXECUTE PROCEDURE insertar_equipo_trg(); 