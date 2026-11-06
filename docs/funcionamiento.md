# Cómo funciona gestik

Gestik es un sistema de gestión de tickets y requerimientos. Los tickets se organizan en **proyectos**, los usuarios se agrupan en **equipos** y cada equipo participa en los proyectos con un rol (requirente, asignado o solo lectura). Sobre cada ticket se van agregando **anotaciones**, que pueden llevar un archivo adjunto.

Está hecho con [backend-plus](https://github.com/codenautas/backend-plus): cada tabla se define en un archivo `src/server/table-*.ts` y a partir de esas definiciones se generan la base de datos (PostgreSQL), las grillas y los formularios.

Ver también:
- [permisos.md](permisos.md): quién puede ver y editar qué.
- [desarrollo.md](desarrollo.md): instalación, tests y actualización de producción.

## Conceptos

```
usuarios ──< equipos_usuarios >── equipos ──< equipos_proyectos >── proyectos
                                                (es_requirente,          │
                                                 es_asignado,            │
                                                 puede_leer)             │
                                                                      tickets ──> estados ──> solapas
                                                                         │
                                                                    anotaciones (+ archivo adjunto)
```

### Proyectos (`proyectos`)

Agrupan tickets. Campos importantes:

- `abierto`: los proyectos cerrados no admiten altas, cambios ni bajas de tickets (lo impide el trigger `no_editar_proyectos_cerrados_trg`). En el menú aparecen separados en *proyectos* y *proyectos cerrados*.
- `es_general`: cuando se crea un equipo nuevo, se lo agrega automáticamente a todos los proyectos generales (trigger `insertar_equipo_trg`).

Desde un proyecto se ven sus tickets filtrados por solapa, con un contador por solapa y por estado.

### Equipos (`equipos`, `equipos_usuarios`, `equipos_proyectos`)

Un usuario puede estar en varios equipos, y un equipo en varios proyectos. La relación equipo–proyecto define qué puede hacer el equipo en ese proyecto:

| campo           | significado                                        |
|-----------------|----------------------------------------------------|
| `es_requirente` | el equipo pide cosas en el proyecto                |
| `es_asignado`   | el equipo resuelve tickets del proyecto            |
| `puede_leer`    | el equipo ve tickets del proyecto (hoy siempre es `true`) |

Un equipo requirente o asignado ve y trabaja solo los tickets **de su equipo**, o sea, aquellos cuyo requirente o asignado es alguien del equipo. Un equipo que no es requirente ni asignado funciona como **auditor**: ve todo el proyecto y no edita. El detalle está en [permisos.md](permisos.md).

### Tickets (`tickets`)

Se identifican por `proyecto` + `ticket`. El número se asigna solo y es correlativo **dentro de cada proyecto** (`get_next_ticket_number`, trigger `ticket_pk_trg`). Por ejemplo, `GESTIK-42`.

Campos principales:

- `asunto` (obligatorio) y `descripcion`
- `tipo_ticket`: requerimiento, tarea, reporte de error, etc. Si no se carga, toma el valor de `parametros.tipo_predeterminado`.
- `estado`: si no se carga, toma `parametros.estado_predeterminado`.
- `requirente`: por defecto es el usuario que lo crea. `asignado` es quien lo resuelve.
- `prioridad`, `modulo`, `tema`, `version`, `esfuerzo_estimado`
- Fechas: `f_ticket` (alta), `f_inicio`, `f_realizacion` y `f_instalacion`.

La pantalla de un ticket está dividida en zonas (`tickets1`, `tickets2`, `tickets3`): datos de identificación, descripción y datos de seguimiento. Todas son vistas de la misma tabla.

### Estados y solapas (`estados`, `solapas`)

Cada estado pertenece a una solapa, y las solapas son las pestañas con contador que se ven en cada proyecto. Configuración inicial:

| solapa       | estados                                                   |
|--------------|-----------------------------------------------------------|
| **nuevos**   | borrador, nuevo                                           |
| **activos**  | en_analisis, en_proceso, en_espera, a_verificar           |
| **cerrados** | verificado, finalizado, anulado                           |

Otros campos del estado:

- `registrar_fechas`: nombre de una columna de fecha (`f_inicio`, `f_realizacion` o `f_instalacion`). Cuando un ticket pasa a ese estado y la fecha está vacía, se completa con la fecha del día (trigger `tickets_actualizar_fecha_trg`).
- `esta_pendiente`: indica que el ticket todavía requiere trabajo del asignado. Se usa en *mis pendientes* y en el detalle "tickets pendientes" de cada usuario.
- `orden`: orden de presentación.
- `todos_pueden_modificar`: está en la tabla, pero el código no lo usa.

### Anotaciones (`anotaciones`)

Es el historial de comentarios de un ticket. Se numeran solas dentro de cada ticket (trigger `anotacion_pk_trg`) y guardan el usuario y el momento en que se crearon.

- Una anotación puede **referenciar otro ticket** (`proyecto_relacionado` + `ticket_relacionado`; tienen que cargarse los dos o ninguno), y se muestra como link.
- Una anotación puede tener **un archivo adjunto**.

### Adjuntos

- **Subida**: procedimiento `archivo_subir`. Si la anotación todavía no existe, la crea. El archivo se guarda en `local-attachments/` con el nombre `adjunto-gestik-<numero_adjunto>-<nombre original>`, y ese nombre queda en `anotaciones.archivo`. Los nombres se sanean para que no puedan salir de esa carpeta (`src/server/adjuntos.ts`).
- **Descarga**: `GET /download/file?proyecto=&ticket=&anotacion=`. La consulta pasa por las políticas de la base, así que solo descarga quien puede ver la anotación. Las imágenes se muestran embebidas en la anotación.
- **Borrado**: al borrar una anotación con archivo, el trigger `archivo_borrar_trg` encola la ruta en `archivos_borrar`. Un proceso interno del servidor borra esos archivos del disco todos los días a las 23:58 (`borrarArchivosPendientes` en `src/server/app-gestik.ts`). El archivo no se borra en el momento para que, si la transacción falla, no se pierda.

## Pantallas (menú)

| menú                       | qué muestra                                                                                                     | quién |
|----------------------------|-----------------------------------------------------------------------------------------------------------------|-------|
| tickets › buscar           | busca un ticket                                                                                                 | todos |
| tickets › nuevo            | alta de ticket                                                                                                  | todos |
| tickets › cambiar de proyecto | mueve un ticket a otro proyecto, donde recibe un número nuevo (procedimiento `cambiar_proyecto`)             | todos |
| proyectos / proyectos cerrados | proyectos visibles para el usuario, con contadores por solapa y estado                                      | todos |
| mis verificaciones         | tickets que pidió el usuario y están `a_verificar`, más los de sus colegas de equipo en ese estado              | todos |
| mis pendientes             | tickets asignados al usuario en estados pendientes, más los tickets sin asignar ni cerrar pedidos por sus colegas | admin |
| configurar                 | equipos, estados, solapas, prioridades, tipos de ticket, parámetros, usuarios y roles                            | admin |
| mi usuario                 | datos propios y cambio de clave                                                                                 | no admin |

## Parámetros (`parametros`)

Es una tabla de una sola fila con el estado y el tipo de ticket que se usan por defecto en los tickets nuevos.

## Historial de cambios

Al instalar la base se agregan los scripts de [pg-triggers](https://github.com/codenautas/pg-triggers) (ver `install.dump.scripts` en `src/server/def-config.ts`). Esos scripts registran los cambios de las tablas.
