SET search_path = 'gestik';
CREATE OR REPLACE FUNCTION no_editar_proyectos_cerrados()
RETURNS trigger
LANGUAGE plpgsql
AS $BODY$
DECLARE
    v_abierto boolean;
BEGIN
   if tg_op = 'INSERT' THEN
      select abierto = true into v_abierto from proyectos where proyecto = new.proyecto;
      IF v_abierto = false AND tg_op = 'INSERT' THEN
         RAISE EXCEPTION 'No se pueden insertar tickets en proyectos cerrados.';
      end if;
   end if;
   if tg_op = 'DELETE' OR tg_op = 'UPDATE' THEN
      select abierto = true into v_abierto from proyectos where proyecto = old.proyecto;
   	  if v_abierto = false AND tg_op = 'DELETE' THEN
         RAISE EXCEPTION 'No se pueden eliminar tickets de proyectos cerrados.';
	  end if;
	  if v_abierto = false AND tg_op = 'UPDATE' THEN
         RAISE EXCEPTION 'No se pueden actualizar tickets de proyectos cerrados.';
      end if;
   end if;
   RETURN new;
END;
$BODY$;
CREATE TRIGGER trg_no_editar_proyectos_cerrados
BEFORE INSERT OR DELETE OR UPDATE ON gestik.tickets
FOR EACH ROW
EXECUTE FUNCTION no_editar_proyectos_cerrados();