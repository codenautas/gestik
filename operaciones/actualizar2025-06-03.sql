set search_path=gestik;

ALTER TABLE roles DROP COLUMN puede_ver_todo;

ALTER POLICY "bp select" ON "tickets" TO gestik_admin USING ( ( 
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR (
        SELECT puede_ver = true FROM equipos_usuarios eu
        INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
        INNER JOIN proyectos USING (proyecto)
        WHERE usuario = 'lector' AND ep.proyecto = proyectos.proyecto
        limit 1
    ) OR (
        requirente = get_app_user() OR asignado = get_app_user()
    ) OR (                    
        SELECT true FROM equipos_usuarios eu INNER JOIN equipos_usuarios et ON eu.equipo = et.equipo
        WHERE eu.usuario = get_app_user() AND (et.usuario = tickets.requirente OR et.usuario = tickets.asignado) limit 1
    ) OR (
        SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
        WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto AND ep.es_asignado limit 1
    ) );

ALTER POLICY "bp select" ON "proyectos" TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR (
        SELECT puede_ver = true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo)
        WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto limit 1
    ) OR (
        SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo)
        WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto limit 1
    ) );
