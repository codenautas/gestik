"use strict"

import { TableContext, TableDefinition } from "backend-plus";

export function prioridades(context: TableContext):TableDefinition{
    const td:TableDefinition = {
        editable: context.user.rol == 'admin',
        name: 'prioridades',
        fields: [
            {name:'prioridad', typeName:'text',},
            {name:'orden', typeName:'integer' }
        ],
        primaryKey: ['prioridad'],
        sortColumns: [
            {column:'orden'}, {column:'prioridad'}
        ],
        detailTables: [{
            "table": "tickets",
            "fields": [
                "prioridad"
            ],
            "abr": "T"
            }
        ],
    }
    return td
}