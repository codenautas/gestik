SET search_path = 'gestik';

ALTER POLICY "debe ser del equipo requirente" ON tickets WITH CHECK ((
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR (
        SELECT true 
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user()
                AND ep.proyecto = tickets.proyecto
                AND ep.es_requirente
                LIMIT 1
    )
);