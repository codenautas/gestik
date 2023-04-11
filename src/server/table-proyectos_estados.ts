"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos_estados():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        name: 'proyectos_estados',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'estado', typeName: 'text'},
            {name: 'cant_tickets', typeName: 'bigint', inTable:false,},
        ],
        primaryKey: ['proyecto', 'estado'],
        sql: {
            isTable: false,
            from: `(SELECT * FROM proyectos CROSS JOIN estados)`,
            fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM tickets t WHERE t.estado = proyectos_estados.estado and t.proyecto = proyectos_estados.proyecto)` }},
        },
    }
    return td
}