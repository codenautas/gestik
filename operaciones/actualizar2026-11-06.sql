SET search_path = "gestik";

-- Tickets "del equipo":
--   admin: ve y edita todo.
--   equipo del usuario en el proyecto con es_requirente o es_asignado: ve y edita solo los tickets
--     cuyo requirente o asignado pertenece a ese mismo equipo
--     (ej: el equipo ipc no ve los tickets que cargó en IPC un admin que no está en el equipo ipc).
--   equipo en el proyecto sin es_requirente ni es_asignado (auditores): ve todos los tickets, no edita.
-- Las anotaciones toman los permisos de su ticket.
-- Reemplaza las políticas de actualizar2026-11-02.sql

BEGIN;

DROP POLICY IF EXISTS "bp select" ON "tickets";
DROP POLICY IF EXISTS "bp insert" ON "tickets";
DROP POLICY IF EXISTS "bp update" ON "tickets";
DROP POLICY IF EXISTS "bp delete" ON "tickets";

DROP POLICY IF EXISTS "bp select" ON "anotaciones";
DROP POLICY IF EXISTS "bp insert" ON "anotaciones";
DROP POLICY IF EXISTS "bp update" ON "anotaciones";
DROP POLICY IF EXISTS "bp delete" ON "anotaciones";

CREATE POLICY "bp select" ON "tickets" AS RESTRICTIVE FOR select TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND ep.puede_leer AND (ep.es_requirente IS NOT TRUE AND ep.es_asignado IS NOT TRUE OR EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (tickets.requirente, tickets.asignado)
                ))
    )
 );
CREATE POLICY "bp insert" ON "tickets" AS RESTRICTIVE FOR insert TO gestik_admin WITH CHECK ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND (ep.es_requirente OR ep.es_asignado) AND ( EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (tickets.requirente, tickets.asignado)
                ))
    )
 );
CREATE POLICY "bp update" ON "tickets" AS RESTRICTIVE FOR update TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND (ep.es_requirente OR ep.es_asignado) AND ( EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (tickets.requirente, tickets.asignado)
                ))
    )
 );
CREATE POLICY "bp delete" ON "tickets" AS RESTRICTIVE FOR delete TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND (ep.es_requirente OR ep.es_asignado) AND ( EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (tickets.requirente, tickets.asignado)
                ))
    )
 );

CREATE POLICY "bp select" ON "anotaciones" AS RESTRICTIVE FOR select TO gestik_admin USING ( EXISTS (
        SELECT 1 FROM tickets t
            WHERE t.proyecto = anotaciones.proyecto AND t.ticket = anotaciones.ticket
                AND ((
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = t.proyecto
                AND ep.puede_leer AND (ep.es_requirente IS NOT TRUE AND ep.es_asignado IS NOT TRUE OR EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (t.requirente, t.asignado)
                ))
    )
)
    )
 );
CREATE POLICY "bp insert" ON "anotaciones" AS RESTRICTIVE FOR insert TO gestik_admin WITH CHECK ( EXISTS (
        SELECT 1 FROM tickets t
            WHERE t.proyecto = anotaciones.proyecto AND t.ticket = anotaciones.ticket
                AND ((
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = t.proyecto
                AND (ep.es_requirente OR ep.es_asignado) AND ( EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (t.requirente, t.asignado)
                ))
    )
)
    )
 );
CREATE POLICY "bp update" ON "anotaciones" AS RESTRICTIVE FOR update TO gestik_admin USING ( EXISTS (
        SELECT 1 FROM tickets t
            WHERE t.proyecto = anotaciones.proyecto AND t.ticket = anotaciones.ticket
                AND ((
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = t.proyecto
                AND (ep.es_requirente OR ep.es_asignado) AND ( EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (t.requirente, t.asignado)
                ))
    )
)
    )
 );
CREATE POLICY "bp delete" ON "anotaciones" AS RESTRICTIVE FOR delete TO gestik_admin USING ( EXISTS (
        SELECT 1 FROM tickets t
            WHERE t.proyecto = anotaciones.proyecto AND t.ticket = anotaciones.ticket
                AND ((
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = t.proyecto
                AND (ep.es_requirente OR ep.es_asignado) AND ( EXISTS (
                    SELECT 1 FROM equipos_usuarios et
                        WHERE et.equipo = eu.equipo AND et.usuario IN (t.requirente, t.asignado)
                ))
    )
)
    )
 );

COMMIT;
