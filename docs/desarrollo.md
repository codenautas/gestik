# Desarrollo

## Estructura del repositorio

| carpeta         | contenido                                                                                  |
|-----------------|--------------------------------------------------------------------------------------------|
| `src/server/`   | servidor: definición de tablas (`table-*.ts`), procedimientos, menú y configuración          |
| `src/client/`   | código que corre en el navegador: pantallas (`wScreens`) y controles de las grillas         |
| `src/unlogged/` | pantalla de login                                                                           |
| `src/test/`     | tests (mocha)                                                                               |
| `install/`      | datos iniciales (`*.tab`) y triggers o funciones SQL que se agregan al crear la base         |
| `operaciones/`  | scripts SQL para actualizar bases existentes (producción), uno por fecha                    |
| `local-attachments/` | archivos adjuntos (no se versiona)                                                     |

## Instalación

En el ambiente de desarrollo se instala con los scripts de code-run.

1. Preparación:
   1. Clonar `codenautas/code-run` y preparar el script `local-path` a partir del ejemplo, para poder usar `run-sql`.
   2. Instalar las dependencias: `npm install`
   3. Generar las instrucciones de creación de la base de datos: `npm run dumpb`
   4. Crear la base de datos: `run-sql create-db`
   5. Generar el esquema y su contenido: `run-sql create-schema`
2. Cada vez que haya un cambio que obligue a **generar la base de datos desde cero, borrando los datos que tuviera**:
   1. Compilar el servidor, generar el esquema de la base, aplicarlo, compilar el cliente y arrancar el sistema (frena en la primera falla):
      `call npm run dumpb && call run-sql create-schema && call npm run build-cli && call npm start`
3. Cada vez que haya un cambio que **no** obligue a regenerar la base:
   1. Compilar todo y arrancar el sistema (frena en la primera falla):
      `call npm run prepare && call npm start`

La configuración local va en `local-config.yaml` (ver `example-local-config.yaml`).

## Testing

1. **Preparación**
   1. Tener en el path la carpeta `code-run/devel`.
   2. Configurar las variables de ambiente:
      ```bash
      set PGPORT=54316
      set PGUSER=postgres
      set PGPASSWORD=********
      ```
   3. Correr `npm install` y luego `npm test`. La primera vez falla, y hay que crear la base de datos con `run-sql create-db`.
2. **Correr los tests**
   1. `npm test` vuelve a crear el esquema desde cero. Se puede omitir si no cambió la estructura de la base.
   2. Después, `npm run test-only`, para asegurarse de que los tests se pueden correr dos veces seguidas.

## Cambios en la base de datos

La base se genera a partir de las definiciones de `src/server/table-*.ts` y de los scripts listados en `install.dump.scripts` (`src/server/def-config.ts`). Eso alcanza para una base nueva, pero **las bases existentes no se actualizan solas**.

Cada cambio de estructura, de triggers o de políticas de seguridad tiene que llevar su script `operaciones/actualizarAAAA-MM-DD.sql`, y ese script se corre a mano en producción. Ver también [permisos.md](permisos.md#producción-las-políticas-se-aplican-a-mano).
