SET search_path=gestik;

ALTER POLICY "bp all" ON "proyectos" USING ( (
                        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                    ) OR ( (
                            SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo) WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto limit 1
                        ) AND (
                            (SELECT rol!='lectura' FROM usuarios WHERE usuario = get_app_user()) OR visualizar)
                    ) );