SET search_path = "gestik";

ALTER TABLE "equipos_proyectos" ADD COLUMN "es_solo_lectura" BOOLEAN DEFAULT FALSE;

DROP POLICY "bp all" ON tickets;
CREATE POLICY "bp select" ON "tickets" AS RESTRICTIVE FOR select TO gestik_admin USING ( ( 
                            SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                        ) OR (
                            requirente = get_app_user()
                        ) OR ( 
                            asignado = get_app_user()
                        ) OR (
                            SELECT true 
                                FROM equipos_usuarios eu INNER JOIN equipos_usuarios et ON eu.equipo = et.equipo
                                WHERE eu.usuario = get_app_user()
                                    AND (et.usuario = tickets.requirente OR et.usuario = tickets.asignado) limit 1
                        ) OR (
                            SELECT true 
                                FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
                                WHERE eu.usuario = get_app_user()
                                    AND ep.proyecto = tickets.proyecto
                                    AND ep.es_asignado limit 1
                        )
                     );
ALTER POLICY "debe ser del equipo requirente" ON "tickets" WITH CHECK ( (
                            SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                        ) OR (
                            SELECT true 
                                FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
                                WHERE eu.usuario = get_app_user()
                                    AND ep.proyecto = tickets.proyecto
                                    AND ep.es_requirente
                                    AND ep.es_solo_lectura = FALSE
                                    LIMIT 1
                        )
                     );
CREATE POLICY "bp update" ON "tickets" AS RESTRICTIVE FOR update TO gestik_admin USING ( 
    ( 
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR (
        requirente = get_app_user()
    ) OR ( 
        asignado = get_app_user()
    ) OR (
        SELECT true 
            FROM equipos_usuarios eu INNER JOIN equipos_usuarios et ON eu.equipo = et.equipo
            WHERE eu.usuario = get_app_user()
                AND (et.usuario = tickets.requirente OR et.usuario = tickets.asignado) limit 1
    ) OR (
        SELECT true 
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user()
                AND ep.proyecto = tickets.proyecto
                AND ep.es_asignado
                AND ep.es_solo_lectura = FALSE limit 1
    )
 );
CREATE POLICY "bp delete" ON "tickets" AS RESTRICTIVE FOR delete TO gestik_admin USING ( 
    ( 
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR (
        requirente = get_app_user()
    ) OR ( 
        asignado = get_app_user()
    ) OR (
        SELECT true 
            FROM equipos_usuarios eu INNER JOIN equipos_usuarios et ON eu.equipo = et.equipo
            WHERE eu.usuario = get_app_user()
                AND (et.usuario = tickets.requirente OR et.usuario = tickets.asignado) limit 1
    ) OR (
        SELECT true 
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user()
                AND ep.proyecto = tickets.proyecto
                AND ep.es_asignado
                AND ep.es_solo_lectura = FALSE limit 1
    )
 );

DROP POLICY "bp all" ON proyectos;
CREATE POLICY "bp select" ON "proyectos" AS RESTRICTIVE FOR select TO gestik_admin USING ( (
                        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                    ) OR (
                        SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo)
                            WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto limit 1
                    ) );
CREATE POLICY "bp insert" ON "proyectos" AS RESTRICTIVE FOR insert TO gestik_admin WITH CHECK ( (
                        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                    ) OR (
                        SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo)
                            WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto and ep.es_solo_lectura = FALSE limit 1
                    ) );
CREATE POLICY "bp update" ON "proyectos" AS RESTRICTIVE FOR update TO gestik_admin USING ( (
                        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                    ) OR (
                        SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo)
                            WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto and ep.es_solo_lectura = FALSE limit 1
                    ) );
CREATE POLICY "bp delete" ON "proyectos" AS RESTRICTIVE FOR delete TO gestik_admin USING ( (
                        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                    ) OR (
                        SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo)
                            WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto and ep.es_solo_lectura = FALSE limit 1
                    ) );-- install/../node_modules/pg-triggers/lib/recreate-his.sql
