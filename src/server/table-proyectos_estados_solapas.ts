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
                    FROM (
                            (SELECT p.proyecto, e.estado 
                            FROM proyectos p
                            CROSS JOIN estados e
                            ) as sub_proyectos_estados 
                            CROSS JOIN solapas
                        ) AS pes
                        LEFT JOIN LATERAL (
                            SELECT count(*) AS cant_tickets FROM tickets t 
                            WHERE t.estado = pes.estado and t.proyecto = pes.proyecto
                        ) AS t ON true
                    )`,
        },
        detailTables: [
            {"table": "tickets", "fields": ["proyecto","estado"], "abr": "T"},
        ],
    }
    return td
}