"use strict"

import { TableContext, TableDefinition } from "./types-gestik";

import { sqlExprCantTickets } from "./table-tickets"

export function estados(context:TableContext):TableDefinition{
    const td:TableDefinition = {
        editable: context.user.rol == 'admin',
        name: 'estados',
        fields: [
            {name:'estado', typeName:'text' },
            {name:'descripcion', typeName:'text' },
            {name:'solapa', typeName:'text' },
            {name:'registrar_fechas', typeName:'text' },
            {name:'todos_pueden_modificar', typeName:'boolean', defaultValue:false},
            {name:'cant_tickets', typeName: 'bigint', inTable:false, editable:false}, 
            {name:'orden', typeName: 'integer'}, 
            {name:'esta_pendiente', typeName: 'boolean', defaultValue:true, nullable:false}
        ],
        sortColumns: [
            {column:'orden'}, {column:'estado'}
        ],
        primaryKey: ['estado'],
        foreignKeys: [
            {references: "solapas", fields: ['solapa']}
        ],
        detailTables: [
            { table: "proyectos_estados", fields: [ "estado"], abr: "P", label: "proyectos"},
            { table: "tickets", fields: [ "estado"], abr: "T" },
        ],
        sql:{fields:{ cant_tickets:{ expr: sqlExprCantTickets(context, `t.estado = estados.estado`) }}}
    }
    return td
}