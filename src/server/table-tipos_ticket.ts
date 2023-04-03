"use strict"

import { TableDefinition } from "backend-plus";

export function tipos_ticket():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'tipos_ticket',
        fields: [
            {name:'tipo_ticket', typeName:'text' }
        ],
        primaryKey: ['tipo_ticket'],
        detailTables: [{
            "table": "tickets",
            "fields": [
                "tipo_ticket"
            ],
            "abr": "T"
            }
        ],
    }
    return td
}