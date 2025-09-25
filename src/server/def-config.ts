export const staticConfigYaml=`
server:
  port: 3021
  session-store: memory-saved
  base-url: /gestik
db:
  motor: postgresql
  host: localhost
  database: gestik_db
  schema: gestik
  user: gestik_admin
login:
  table: usuarios
  userFieldName: usuario
  passFieldName: md5clave
  rolFieldName: rol
  infoFieldList: [usuario, rol]
  activeClausule: activo
  unloggedLandPage: false
  plus:
    maxAge-5-sec: 5000
    maxAge: 8640000
    maxAge-10-day: 864000000
    allowHttpLogin: true
    fileStore: true
    loginForm:
      formTitle: entrada
      formImg: unlogged/tables-lock.png
client-setup:
  menu: true
  lang: es
  user-scalable: no
  cursors: true
  title: gestik
  grid-row-retain-moved-or-deleted: true
  grid-smart-caption: alone
install:
  dump:
    db:
      owner: gestik_owner
    enances: inline
    skip-content: true
    drop-his: true
    scripts:
      post-adapt:
      - ../node_modules/pg-triggers/lib/recreate-his.sql
      - ../node_modules/pg-triggers/lib/table-changes.sql
      - ../node_modules/pg-triggers/lib/function-changes-trg.sql
      - ../node_modules/pg-triggers/lib/enance.sql
      - ../install/ticket_pk_trg.sql
      - ../install/set_ticket_default_estado.sql
      - ../install/set_ticket_default_tipo.sql
      - ../install/tickets_actualizar_fecha_trg.sql
      - ../install/anotacion_constraint.sql
      - ../install/insertar_equipo_trg.sql
      - ../install/archivo_borrar_trg.sql
      - ../install/no_editar_proyectos_cerrados_trg.sql
logo:
  path: client/img
`;