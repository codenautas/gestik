"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'proyectos',
        fields: [
            {name:'proyecto', typeName:'text',}
        ],
        primaryKey: ['proyecto'],
        detailTables: [{
            "table": "tickets",
            "fields": [
                "proyecto"
            ],
            "abr": "T"
            }
        ],
    }
    return td
}