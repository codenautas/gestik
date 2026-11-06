# gestik

Gestión de tickets y requerimientos.

Los tickets se organizan en proyectos y los usuarios trabajan en equipos. Cada equipo participa en los proyectos como requirente, asignado o solo lectura, y eso determina qué puede ver y editar cada usuario. Sobre los tickets se cargan anotaciones con archivos adjuntos.

## Inicio rápido

```bash
npm install
npm run dumpb            # genera el script de creación de la base
run-sql create-db        # (code-run) crea la base
run-sql create-schema    # crea el esquema
npm start                # http://localhost:3021/gestik
```

Los detalles de instalación y tests están en [docs/desarrollo.md](docs/desarrollo.md).

## Documentación

- [Cómo funciona gestik](docs/funcionamiento.md): proyectos, equipos, tickets, estados, anotaciones y adjuntos.
- [Permisos](docs/permisos.md): quién ve y edita qué, y cómo se aplican las políticas en producción.
- [Desarrollo](docs/desarrollo.md): estructura del repo, instalación, tests y actualización de bases existentes.
- [Documento original (Google Docs)](https://docs.google.com/document/d/1_ledLpcftrm6K8RE0VXthgrjBE2OGSNfYo_-fa8qCmE/edit#)
