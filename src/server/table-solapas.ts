"use strict"

import { TableDefinition } from "backend-plus";

export function solapas():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'solapas',
        fields: [
            {name:'solapa', typeName:'text',},
            {name:'orden', typeName:'integer' },
            {name:'cant_tickets', typeName: "bigint", inTable:false, editable:false}, 
        ],
        primaryKey: ['solapa'],
        sortColumns: [
            {column:'orden'}, {column:'solapa'}
        ],
        detailTables: [
            {"table": "estados", "fields": ["solapa"], "abr": "E"},
            {"table": "tickets", "fields": ["solapa"], "abr": "T"},
        ],
        sql:{fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM tickets t WHERE t.solapa = solapas.solapa)` }}}
    }
    return td
}