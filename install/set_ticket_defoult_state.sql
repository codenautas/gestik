set search_path=gestik;
CREATE or replace FUNCTION get_default_state() RETURNS text AS $$ SELECT estado_predeterminado FROM parametros; $$ LANGUAGE SQL;
ALTER TABLE tickets alter column estado set default get_default_state();