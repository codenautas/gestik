"use strict"

import { TableContext, TableDefinition } from "./types-gestik";
import { sqlExprCantTickets } from "./table-tickets"

export function proyectos_solapas(context:TableContext):TableDefinition{

    const td:TableDefinition = {
        editable: false,
        allow: {"vertical-edit": false},
        name: 'proyectos_solapas',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'solapa', typeName: 'text'},
            {name: 'cant_tickets', typeName: 'bigint', inTable:false,},
        ],
        primaryKey: ['proyecto', 'solapa'],
        softForeignKeys: [
            {references: 'solapas', fields: ['solapa'], displayFields: ['orden'], displayAfterFieldName: 'cant_tickets'}
        ],
        sql: {
            isTable: false,
            from: `(SELECT * FROM proyectos AS p CROSS JOIN solapas AS s
                    LEFT JOIN LATERAL 
                       ${sqlExprCantTickets(context, `e.solapa = s.solapa and t.proyecto = p.proyecto`, true)}
                    AS t ON true
                )`,
        },
        detailTables: [
            {table: "proyectos_estados_solapas", fields: ["proyecto", "solapa"], abr: "E", label: "esatdos"},
            {table: "tickets", fields: ["proyecto", {source:'solapa' , target:'estados__solapa'}], abr: "T"},
        ],
        sortColumns: [{column: 'solapas__orden'}, {column: 'solapa'}, {column: 'proyecto'}]
    }
    return td
}