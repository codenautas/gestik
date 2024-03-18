CREATE OR REPLACE FUNCTION archivo_borrar_trg()
    RETURNS trigger
    LANGUAGE 'plpgsql' 
AS $BODY$
begin
  if old.archivo is not null then
    insert into archivos_borrar ("ruta_archivo") values (old.archivo);
  end if;
  return old;
end;
$BODY$;

CREATE TRIGGER archivo_borrar_trg
  BEFORE DELETE 
  ON anotaciones
  FOR EACH ROW
  EXECUTE PROCEDURE archivo_borrar_trg();