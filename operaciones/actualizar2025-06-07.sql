SET search_path = "gestik";

ALTER TABLE equipos_proyectos ADD COLUMN puede_leer boolean NOT NULL DEFAULT true;
ALTER TABLE equipos_proyectos ADD CONSTRAINT "puede leer" CHECK (puede_leer is true);

DROP POLICY "bp all" on "tickets";
CREATE POLICY "bp select" ON "tickets" AS RESTRICTIVE FOR select TO gestik_admin USING ( ( 
                            SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()
                        ) OR (
                            requirente = get_app_user()
                        ) OR ( 
                            asignado = get_app_user()
                        ) OR (
                            SELECT true 
                                FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep ON eu.equipo = ep.equipo
                                WHERE eu.usuario = get_app_user()
                                    AND ep.proyecto = tickets.proyecto limit 1
                        )
                    );
CREATE POLICY "bp update" ON "tickets" AS RESTRICTIVE FOR update TO gestik_admin USING ( ( 
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
CREATE POLICY "bp delete" ON "tickets" AS RESTRICTIVE FOR delete TO gestik_admin USING ( ( 
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