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
            {table: "proyectos_solapas", fields: [ "solapa"], abr: "P", label: "proyectos"},
            {table: "estados", fields: ["solapa"], abr: "E"},
            {table: "tickets", fields: [{source:'solapa' , target:'estados__solapa'}], abr: "T"},
        ],
        sql:{fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM estados e inner join tickets t on t.estado = e.estado WHERE e.solapa = solapas.solapa)` }}}
    }
    return td
}