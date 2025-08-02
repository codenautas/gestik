# gestik

Gestión de tickets y requerimientos

https://docs.google.com/document/d/1_ledLpcftrm6K8RE0VXthgrjBE2OGSNfYo_-fa8qCmE/edit#

## instalación

En ambiente de desarrollo se puede instalar usando los scripts de code-run. 

   1. Preparación:
      1. Clonar `codenautas/code-run`, preparar el script `local-path` en base al ejemplo para luego utilizar `run-sql`
      2. Instalar las dependencias `npm install`
      3. Generar las instrucciones de creación de la base de datos `npm run dumpb`
      4. Crear la base de datos `run-sql create-db`
      5. Generar el esquema y su contenido `run-sql create-schema`
   2. Cada vez que haya un cambio que implique *generar la base de datos desde cero **borrando el contenido de los datos que hubiera***:
      1. Compilar server side, generar el esquema de db, impactarlo en la db, compilar el client side, arrancar el sistema
         (deteníendose en la primer falla): `call npm run dumpb && call run-sql create-schema && call npm run build-cli && call npm start`
   3. Cada vez que haya un cambio que **no** implique generar la base de datos:
      1. Compilar todo y arrancar el sistema (deteníendose en la primer falla): 
      `call npm run prepare && call npm start`

## testing

1. **Preparación**
   1. Asegurarse de tener en el path la carpeta `code-run/devel`
   2. Configurar las variables de ambiente 
      ```bash
      set PGPORT=54316
      set PGUSER=postgres
      set PGPASSWORD=********
      ```
   3. correr `npm install` y luego `npm test`, si es la primera vez va a fallar y hay que crear la base de datos corriendo: `run-sql create-db`
2. **Correr los test**
   1. ejecutar `npm test` se puede omitir si no hubo cambios en la estructura de la base de datos porque este paso vuelve a crear el esquema de cero
   2. luego `npm run test-only` (para asegurarse que los test se puedan correr dos veces seguidas)