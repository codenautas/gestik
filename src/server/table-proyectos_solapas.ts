"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos_solapas():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        name: 'proyectos_solapas',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'solapa', typeName: 'text'},
            {name: 'cant_tickets', typeName: 'bigint', inTable:false,},
        ],
        primaryKey: ['proyecto', 'solapa'],
        sql: {
            isTable: false,
            from: `(SELECT * FROM proyectos CROSS JOIN estados)`,
            fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM tickets t WHERE t.solapa = proyectos_solapas.solapa and t.proyecto = proyectos_solapas.proyecto)` }},
        },
    }
    return td
}