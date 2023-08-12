"use strict"

import { TableContext, TableDefinition } from "./types-gestik";
import { sqlExprCantTickets } from "./table-tickets";

export function solapas(context: TableContext):TableDefinition{
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
        sql:{
            fields:{ cant_tickets:{ expr: sqlExprCantTickets(context, `e.solapa = solapas.solapa`, true) }},
            orderBy: ['orden']
        }
    }
    return td
}