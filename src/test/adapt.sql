-- Datos de test
-- /*
set search_path = gestik;

delete from tickets where requirente like '%autotest%';
delete from usuarios where usuario like '%autotest%';
delete from equipos where equipo like '%autotest%';
delete from equipos_proyectos where equipo like '%autotest%';
delete from proyectos where proyecto like '%auto%';

insert into equipos (equipo) values 
  ('autotest-desarrollo'),
  ('autotest-usuarios'),
  ('autotest-procesamiento'),
  ('autotest-auditores');

insert into usuarios (usuario, rol, interno) values
  ('autotest-administrador', 'admin'  , 'autotest-desarrollo'   ),
  ('autotest-desarrollador', 'usuario', 'autotest-desarrollo'   ),
  ('autotest-usuario'      , 'usuario', 'autotest-usuarios'     ),
  ('autotest-inactivo'     , 'usuario', 'autotest-usuarios'     ),
  ('autotest-procesador'   , 'usuario', 'autotest-procesamiento'),
  ('autotest-auditor'      , 'usuario', 'autotest-auditores'    ),
  ('autotest-auditor-desa' , 'usuario', 'autotest-auditores'    );

update usuarios 
  set md5clave = md5('clave1234'||usuario),
      activo = usuario not like '%inactivo%'
  where usuario like '%autotest%';

insert into equipos_usuarios (usuario, equipo)
  select usuario, interno
    from usuarios
    where interno like '%autotest%';

-- auditor que además es del equipo de desarrollo (tiene permiso de escritura por ese otro equipo)
insert into equipos_usuarios (usuario, equipo) values
  ('autotest-auditor-desa', 'autotest-desarrollo');

insert into proyectos (proyecto) values
  ('GENERAL-autotest'), ('INTERNO-autotest'), ('PROYECTO1-autotest'), ('PROYECTO2-autotest'), ('CERRADO-autotest');

insert into equipos_proyectos (proyecto, equipo, es_asignado, es_requirente) values
  ('PROYECTO1-autotest', 'autotest-usuarios'     , false, true),
  ('PROYECTO1-autotest', 'autotest-desarrollo'   , true , true),
  ('PROYECTO1-autotest', 'autotest-auditores'    , false, false), -- solo lectura
  ('PROYECTO2-autotest', 'autotest-procesamiento', false, true),
  ('INTERNO-autotest'  , 'autotest-desarrollo'   , true , true),
  ('CERRADO-autotest'  , 'autotest-desarrollo'   , true , true);

-- los estados vienen de local-install, se fijan los que usa el trigger tickets_actualizar_fecha_trg
update estados set registrar_fechas = 'f_inicio'      where estado = 'en_proceso';
update estados set registrar_fechas = 'f_realizacion' where estado = 'a_verificar';

insert into tickets (proyecto, ticket, tema, requirente, estado, asignado, asunto) values 
  ('PROYECTO1-autotest', 1, 'prueba visibilidad', 'autotest-usuario'      , 'nuevo'       , null                    , 'ticket nuevo'     ),
  ('PROYECTO1-autotest', 2, 'prueba visibilidad', 'autotest-desarrollador', 'nuevo'       , null                    , 'ticket nuevo2 '   ),
  ('PROYECTO1-autotest', 3, 'prueba visibilidad', 'autotest-inactivo'     , 'en_proceso'  , 'autotest-desarrollador', 'ticket empezado'  ),
  ('PROYECTO1-autotest', 4, 'prueba visibilidad', 'autotest-desarrollador', 'en_proceso'  , 'autotest-desarrollador', 'ticket empezado 2'),
  ('PROYECTO2-autotest', 1, 'prueba visibilidad', 'autotest-usuario'      , 'en_proceso'  , 'autotest-desarrollador', 'ticket empezado 3'),
  ('PROYECTO2-autotest', 2, 'prueba visibilidad', 'autotest-procesador'   , 'en_proceso'  , 'autotest-desarrollador', 'ticket empezado 4'),
  ('CERRADO-autotest'  , 1, 'prueba cerrado'    , 'autotest-desarrollador', 'nuevo'       , null                    , 'ticket de proyecto cerrado');

-- se cierra después de cargar el ticket porque no_editar_proyectos_cerrados_trg impide insertar en proyectos cerrados
update proyectos set abierto = false where proyecto = 'CERRADO-autotest';
--  */