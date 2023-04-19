CREATE OR REPLACE FUNCTION get_default_tipo_ticket() RETURNS text AS
$$
DECLARE
  v_ticket text;
BEGIN
  SELECT tipo_predeterminado INTO v_ticket FROM gestik.parametros;
  RETURN v_ticket;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE tickets ALTER COLUMN tipo_ticket SET DEFAULT gestik.get_default_tipo_ticket();