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
  ('autotest-procesamiento');

insert into usuarios (usuario, rol, interno) values 
  ('autotest-desarrollador', 'admin'  , 'autotest-desarrollo'   ),
  ('autotest-usuario'      , 'usuario', 'autotest-usuarios'     ),
  ('autotest-inactivo'     , 'usuario', 'autotest-usuarios'     ),
  ('autotest-procesador'   , 'usuario', 'autotest-procesamiento');

update usuarios 
  set md5clave = md5('clave1234'||usuario),
      activo = usuario not like '%inactivo%'
  where usuario like '%autotest%';

insert into equipos_usuarios (usuario, equipo)
  select usuario, interno
    from usuarios
    where interno like '%autotest%';

insert into proyectos (proyecto) values
  ('GENERAL-autotest'), ('INTERNO-autotest'), ('PROYECTO1-autotest');
--  */