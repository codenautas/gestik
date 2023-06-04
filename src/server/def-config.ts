export const staticConfigYaml=`
server:
  port: 3021
  session-store: memory-saved
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
    maxAge: 864000000
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
install:
  dump:
    db:
      owner: gestik_owner
    scripts:
      post-adapt:
      - ../node_modules/pg-triggers/lib/recreate-his.sql
      - ../node_modules/pg-triggers/lib/table-changes.sql
      - ../node_modules/pg-triggers/lib/function-changes-trg.sql
      - ../node_modules/pg-triggers/lib/enance.sql    
      - ../install/ticket_pk_trg.sql
      - ../install/anotaciones_pk_trg.sql
      - ../install/set_ticket_default_estado.sql
      - ../install/set_ticket_default_tipo.sql
logo: 
  path: client/img
`;