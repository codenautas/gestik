"use strict"

import { TableDefinition, TableContext } from "./types-gestik";

export function archivos_borrar(context: TableContext):TableDefinition{
    const td:TableDefinition = {
        // no editable desde la aplicación (el cron borra del disco lo que haya acá)
        // pero en el dump sí, para que gestik_admin tenga los grants que usan
        // el trigger archivo_borrar_trg (insert) y el cron de mantenimiento (delete)
        editable: !!context.forDump,
        name: 'archivos_borrar',
        fields: [
            {name:'ruta_archivo', typeName:'text',},
        ],
        primaryKey: ['ruta_archivo'],
    }
    return td
}
