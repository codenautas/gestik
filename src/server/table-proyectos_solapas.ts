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
            from: `(SELECT * FROM proyectos AS p CROSS JOIN solapas AS s
                    LEFT JOIN LATERAL (
                        SELECT count(*) as cant_tickets 
                        FROM estados e inner join tickets t on e.estado = t.estado 
                        WHERE e.solapa = s.solapa and t.proyecto = p.proyecto
                    ) AS t ON true
                )`,
        },
        detailTables: [
            {"table": "proyectos_estados_solapas", "fields": ["solapa","proyecto"], "abr": "PES", label: "pes"},
        ],
    }
    return td
}