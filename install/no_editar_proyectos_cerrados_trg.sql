SET search_path = 'gestik';
CREATE OR REPLACE FUNCTION no_editar_proyectos_cerrados()
RETURNS trigger
LANGUAGE plpgsql
AS $BODY$
DECLARE
    v_abierto boolean;
BEGIN
 select abierto into v_abierto from proyectos where proyecto = OLD.proyecto;
    IF v_abierto = false THEN
	   if tg_op = 'INSERT' THEN
          RAISE EXCEPTION 'No se pueden insertar tickets en proyectos cerrados.';
		  end if;
       if tg_op = 'DELETE' THEN
          RAISE EXCEPTION 'No se pueden eliminar tickets de proyectos cerrados.';
		  end if;
       if tg_op = 'UPDATE' THEN
          RAISE EXCEPTION 'No se pueden actualizar tickets de proyectos cerrados.';
	   end if;
	 end if;
   RETURN NEW;
END;
$BODY$;
CREATE TRIGGER trg_no_editar_proyectos_cerrados
AFTER INSERT OR DELETE OR UPDATE ON gestik.tickets
FOR EACH ROW
EXECUTE FUNCTION no_editar_proyectos_cerrados();

