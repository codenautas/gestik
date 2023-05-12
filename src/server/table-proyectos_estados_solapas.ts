"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos_estados_solapas():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        allow: {"vertical-edit": false},
        name: 'proyectos_estados_solapas',
        elementName: 'estado',
        title: 'estados',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'solapa', typeName: 'text'},
            {name: 'estado', typeName: 'text'},
            {name: 'cant_tickets', typeName: 'bigint', inTable:false},
        ],
        primaryKey: ['proyecto', 'solapa', 'estado'],
        sql: {
            isTable: false,
            from: `(SELECT *
                    FROM (
                            (SELECT p.proyecto, e.estado, e.solapa as solapa_pe, e.orden as estado_orden
                            FROM proyectos p
                            CROSS JOIN estados e
                            ) as sub_proyectos_estados 
                            LEFT JOIN solapas s on s.solapa = sub_proyectos_estados.solapa_pe
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
        softForeignKeys: [
            {references: 'estados', fields: ['estado'], displayFields: ['orden'], displayAfterFieldName: 'cant_tickets'},
            {references: 'solapas', fields: ['solapa'], displayFields: ['orden'], displayAfterFieldName: 'cant_tickets'}
        ],
        hiddenColumns:['estados__orden','solapas__orden'],
        sortColumns: [{column: 'solapas__orden'},{column: 'estados__orden'},]
    }
    return td
}