set search_path = gestik;
CREATE OR REPLACE FUNCTION no_editar_proyectos_cerrados_trg()
  RETURNS trigger
  LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
  v_es_proyecto_abierto boolean;
  v_cant_proyecto_abierto integer;
BEGIN
  if tg_op = 'INSERT' THEN
    select abierto is true into v_es_proyecto_abierto from proyectos where proyecto = new.proyecto;
    IF v_es_proyecto_abierto = false THEN
      RAISE EXCEPTION 'No se pueden insertar tickets en proyectos cerrados.';
    end if;
  end if;
  if tg_op = 'UPDATE' THEN
    select count(*) into v_cant_proyecto_abierto from gestik.proyectos where (proyecto = old.proyecto or proyecto = new.proyecto) and abierto is false LIMIT 1;
    if v_cant_proyecto_abierto > 0 THEN
      RAISE EXCEPTION 'No se pueden actualizar tickets de proyectos cerrados.';
    end if;
  end if;
  if tg_op = 'DELETE' THEN
    select abierto is true into v_es_proyecto_abierto from proyectos where proyecto = old.proyecto;
    if v_es_proyecto_abierto = false THEN
      RAISE EXCEPTION 'No se pueden eliminar tickets de proyectos cerrados.';
    end if;
    RETURN old;
  end if;
  RETURN new;
END;
$BODY$;

CREATE TRIGGER no_editar_proyectos_cerrados_trg
  BEFORE INSERT OR DELETE OR UPDATE
  ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION no_editar_proyectos_cerrados_trg();