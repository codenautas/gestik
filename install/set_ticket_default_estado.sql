CREATE OR REPLACE FUNCTION get_default_estado() RETURNS text AS
$$
DECLARE
  v_estado text;
BEGIN
  SELECT estado_predeterminado INTO v_estado FROM gestik.parametros;
  RETURN v_estado;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE tickets ALTER COLUMN estado SET DEFAULT gestik.get_default_estado();