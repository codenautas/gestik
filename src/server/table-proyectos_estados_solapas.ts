"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos_estados_solapas():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        name: 'proyectos_estados_solapas',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'estado', typeName: 'text'},
            {name: 'solapa', typeName: 'text'},
            {name: 'cant_tickets', typeName: 'bigint', inTable:false},
        ],
        primaryKey: ['proyecto', 'estado', 'solapa'],
        sql: {
            isTable: false,
            from: `(SELECT *
                    FROM ((SELECT proyectos.proyecto, estados.estado 
                           FROM proyectos CROSS JOIN estados) as sub_proyectos_estados CROSS JOIN solapas))`,
            fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM tickets t WHERE t.estado = proyectos_estados_solapas.estado and t.proyecto = proyectos_estados_solapas.proyecto)` }},
        },
        detailTables: [
            {"table": "tickets", "fields": ["proyecto","estado"], "abr": "T"},
        ],
    }
    return td
}