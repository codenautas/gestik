"use strict"

import { TableDefinition } from "backend-plus";

export function prioridades():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'prioridades',
        fields: [
            {name:'prioridad', typeName:'text',},
            {name:'orden', typeName:'integer' }
        ],
        primaryKey: ['prioridad'],
        detailTables: [{
            "table": "tickets",
            "fields": [
                "prioridad"
            ],
            "abr": "P"
            }
        ],
    }
    return td
}