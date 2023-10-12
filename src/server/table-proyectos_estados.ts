"use strict"

import { sqlExprCantTickets } from "./table-tickets";
import { TableContext, TableDefinition } from "./types-gestik";

export function proyectos_estados(context:TableContext):TableDefinition{

    const td:TableDefinition = {
        editable: false,
        allow: {"vertical-edit": false},
        name: 'proyectos_estados',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'estado', typeName: 'text'},
            {name: 'cant_tickets', typeName: 'bigint'},
        ],
        primaryKey: ['proyecto', 'estado'],
        softForeignKeys: [
            {references: 'estados', fields: ['estado'], displayFields: ['solapa', 'orden'], displayAfterFieldName: 'cant_tickets'}
        ],
        detailTables: [
            {table: 'tickets', fields: ['proyecto', 'estado'], abr: 't'}
        ],
        sql: {
            isTable: false,
            from: `(SELECT * 
                FROM proyectos AS p 
                CROSS JOIN estados AS e 
                LEFT JOIN LATERAL 
                    ${sqlExprCantTickets(context, `t.proyecto = p.proyecto AND t.estado = e.estado`)}
                AS t ON true
            )`
        },
        sortColumns: [{column: 'estados__orden'}, {column: 'estado'}, {column: 'proyecto'}]
    }
    return td
}