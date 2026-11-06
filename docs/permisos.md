# Permisos

Hay dos roles de usuario (`roles`): **admin** y **usuario**. El admin ve y edita todo. Para un usuario común, lo que puede hacer depende de **los equipos a los que pertenece** y de cómo participa cada equipo en cada proyecto (`equipos_proyectos`).

## Regla general

Un ticket es **de un equipo** cuando su requirente o su asignado pertenece a ese equipo.

| quién                                                                      | ve                                    | crea, modifica, borra y anota      |
|----------------------------------------------------------------------------|---------------------------------------|------------------------------------|
| **admin**                                                                  | todos los tickets                     | todos los tickets                  |
| usuario de un equipo que está en el proyecto con `es_requirente` o `es_asignado` | solo los tickets **de ese equipo**   | solo los tickets **de ese equipo** |
| usuario de un equipo que está en el proyecto sin `es_requirente` ni `es_asignado` (**auditores**) | todos los tickets del proyecto | nada                         |
| usuario sin equipos en el proyecto                                         | nada (tampoco ve el proyecto)         | nada                               |

Las anotaciones (y sus adjuntos) tienen los mismos permisos que su ticket.

Si un usuario está en varios equipos, se suman los permisos de cada uno. La comparación es siempre contra el **mismo** equipo: si María está en el equipo *ipc* y ese equipo es requirente en el proyecto IPC, María ve los tickets de IPC cuyo requirente o asignado es alguien del equipo *ipc*.

Por ejemplo, si un admin que no está en el equipo *ipc* carga un ticket en IPC sin asignarlo a nadie de ese equipo, los integrantes de *ipc* no lo ven. Sí lo ven los otros admin y los auditores del proyecto.

Lo que cuenta es el equipo. **Ser personalmente el requirente o el asignado de un ticket no da permisos** si el equipo no está en el proyecto. Si alguien deja de estar en el equipo, pierde el acceso aunque figure en el ticket.

Un ticket nuevo lo ve el equipo de quien lo pide. Si lo tiene que resolver otro equipo, hay que asignárselo a alguien de ese equipo para que lo vea.

Además, en los proyectos cerrados nadie puede crear, modificar ni borrar tickets, tampoco un admin (trigger `no_editar_proyectos_cerrados_trg`).

## Dónde está implementado

### En la base de datos (RLS)

Los permisos sobre datos están implementados con **políticas de Row Level Security de PostgreSQL**. Así se aplican a cualquier consulta, venga de una grilla, de un procedimiento o de la descarga de adjuntos.

- `tickets`: `select`, `insert`, `update` y `delete`. Generadas por `sqlPermisoTicket` en `src/server/table-tickets.ts`.
- `anotaciones`: las mismas cuatro, generadas por `sqlPermisoTicketPadre`, que aplica la regla del ticket al que pertenece la anotación (`src/server/table-anotaciones.ts`).
- `proyectos`: una política `all` en `src/server/table-proyectos.ts`, que deja ver el proyecto si es admin o si alguno de sus equipos está en el proyecto.

backend-plus crea en cada una de estas tablas una política `"bp base"` permisiva (`USING (true)`), y las políticas `"bp select"`, `"bp insert"`, etc. son `RESTRICTIVE`: una fila es accesible solo si cumple todas las restrictivas que le corresponden. Se aplican al usuario de base `gestik_admin` (con el que se conecta la aplicación), y el usuario logueado se obtiene con `get_app_user()`.

### En la aplicación

- Las tablas de configuración (equipos, estados, solapas, prioridades, tipos de ticket, parámetros, usuarios y roles) son editables solo por un admin. Esto está en la definición de cada tabla (`editable: admin`), no en RLS.
- En `usuarios`, un usuario común ve y edita solo su propia fila (no puede cambiar su `rol` ni su `activo`).
- La pestaña de equipos dentro de un proyecto y el menú *configurar* se muestran solo a los admin.
- `cambiar_proyecto`: un usuario común solo puede mover un ticket a un proyecto donde alguno de sus equipos es **requirente**. Para modificar el ticket en el proyecto de origen también aplican las políticas de `tickets`.

## Cómo dar permisos a alguien

1. Agregar al usuario a un equipo (*configurar › equipos › U*, o desde el usuario, pestaña *Q*).
2. Verificar que el equipo esté en el proyecto con el rol que corresponde (*proyecto › Q* o *equipo › P*):
   - para que **vea todo** el proyecto sin poder editar (auditor): dejar `es_requirente` y `es_asignado` en false;
   - para que **cargue y trabaje** los tickets de su equipo: marcar `es_requirente` o `es_asignado`. Ojo: con eso deja de ver los tickets de otros equipos.

Los equipos nuevos se agregan solos a los proyectos marcados como `es_general`.

## Producción: las políticas se aplican a mano

El instalador (`npm run dump` y `run-sql create-schema`) genera las políticas solo cuando se crea la base desde cero. **En producción no se regeneran**: cada cambio de permisos tiene que ir acompañado de un script en `operaciones/` (por ejemplo `operaciones/actualizar2026-11-02.sql`) que haga el `DROP POLICY` y el `CREATE POLICY` correspondientes, y ese script hay que correrlo a mano. Las políticas vigentes son las de `operaciones/actualizar2026-11-06.sql`.

Si en producción alguien ve de más o de menos, comparar las políticas reales con las de una base local recién generada:

```sql
select polrelid::regclass as tabla, polname, polcmd, polpermissive,
       pg_get_expr(polqual, polrelid) as using_expr,
       pg_get_expr(polwithcheck, polrelid) as check_expr
  from pg_policy
  where polrelid::regclass::text like 'gestik.%'
  order by 1, 2;
```
