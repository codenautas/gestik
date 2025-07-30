set search_path = gestik;
CREATE OR REPLACE FUNCTION no_editar_proyectos_cerrados_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
    v_abierto boolean;
BEGIN
   if tg_op = 'INSERT' THEN
      select abierto is true into v_abierto from proyectos where proyecto = new.proyecto;
      IF v_abierto = false THEN
         RAISE EXCEPTION 'No se pueden insertar tickets en proyectos cerrados.';
      end if;
   end if;
   if tg_op = 'UPDATE' THEN
      select abierto is true into v_abierto from proyectos where proyecto = old.proyecto;
      if v_abierto = false THEN
         RAISE EXCEPTION 'No se pueden actualizar tickets de proyectos cerrados.';
      end if;
	  select abierto is true into v_abierto from proyectos where proyecto = new.proyecto;
      if v_abierto = false THEN
         RAISE EXCEPTION 'No se pueden actualizar tickets de proyectos cerrados.';
      end if;
   end if;
   if tg_op = 'DELETE' THEN
      select abierto is true into v_abierto from proyectos where proyecto = old.proyecto;
   	  if v_abierto = false THEN
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