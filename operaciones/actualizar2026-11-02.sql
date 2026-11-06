SET search_path = "gestik";

-- Permisos por equipo en el proyecto (o admin):
--   ver: algún equipo del usuario está en el proyecto con puede_leer
--   editar (insert/update/delete de tickets y anotaciones): algún equipo es_requirente o es_asignado
-- Ya no cuenta ser personalmente el requirente o asignado del ticket.

BEGIN;

DROP POLICY IF EXISTS "bp select" ON "tickets";
DROP POLICY IF EXISTS "bp insert" ON "tickets";
DROP POLICY IF EXISTS "bp update" ON "tickets";
DROP POLICY IF EXISTS "bp delete" ON "tickets";

CREATE POLICY "bp select" ON "tickets" AS RESTRICTIVE FOR select TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND ep.puede_leer
    )
 );
CREATE POLICY "bp insert" ON "tickets" AS RESTRICTIVE FOR insert TO gestik_admin WITH CHECK ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND (ep.es_requirente OR ep.es_asignado)
    )
 );
CREATE POLICY "bp update" ON "tickets" AS RESTRICTIVE FOR update TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND (ep.es_requirente OR ep.es_asignado)
    )
 );
CREATE POLICY "bp delete" ON "tickets" AS RESTRICTIVE FOR delete TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
                AND (ep.es_requirente OR ep.es_asignado)
    )
 );

DROP POLICY IF EXISTS "bp select" ON "anotaciones";
DROP POLICY IF EXISTS "bp insert" ON "anotaciones";
DROP POLICY IF EXISTS "bp update" ON "anotaciones";
DROP POLICY IF EXISTS "bp delete" ON "anotaciones";

-- nueva: antes no había política de select y cualquiera leía las anotaciones de cualquier proyecto
CREATE POLICY "bp select" ON "anotaciones" AS RESTRICTIVE FOR select TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = anotaciones.proyecto
                AND ep.puede_leer
    )
 );
CREATE POLICY "bp insert" ON "anotaciones" AS RESTRICTIVE FOR insert TO gestik_admin WITH CHECK ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = anotaciones.proyecto
                AND (ep.es_requirente OR ep.es_asignado)
    )
 );
CREATE POLICY "bp update" ON "anotaciones" AS RESTRICTIVE FOR update TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = anotaciones.proyecto
                AND (ep.es_requirente OR ep.es_asignado)
    )
 );
CREATE POLICY "bp delete" ON "anotaciones" AS RESTRICTIVE FOR delete TO gestik_admin USING ( (
        SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR EXISTS (
        SELECT 1
            FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
            WHERE eu.usuario = get_app_user() AND ep.proyecto = anotaciones.proyecto
                AND (ep.es_requirente OR ep.es_asignado)
    )
 );

COMMIT;
