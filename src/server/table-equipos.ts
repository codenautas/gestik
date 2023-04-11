"use strict"

import { TableDefinition } from "backend-plus";

export function equipos():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'equipos',
        fields: [
            {name:'equipo', typeName:'text' },
            {name:'descripcion', typeName:'text' }
        ],
        primaryKey: ['equipo'],
        detailTables: [{
            "table": "tickets",
            "fields": [
                {source:'equipo', target:'equipo_requirente', },
            ],
            label: "equipo_ticket",
            "abr": "T"
            }
        ],
    }
    return td
}