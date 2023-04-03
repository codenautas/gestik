"use strict"

import { TableDefinition } from "backend-plus";

export function solapas():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'solapas',
        fields: [
            {name:'solapa', typeName:'text',},
            {name:'orden', typeName:'integer' },
        ],
        primaryKey: ['solapa'],
        sortColumns: [
            {column:'orden'}, {column:'solapa'}
        ],
        detailTables: [{
            "table": "estados",
            "fields": [
                "solapa"
            ],
            "abr": "E"
            }
        ],
    }
    return td
}