"use strict"

import { TableDefinition } from "backend-plus";

export function estados():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'estados',
        fields: [
            {name:'estado', typeName:'text' },
            {name:'descripcion', typeName:'text' },
            {name:'solapa', typeName:'text' },
            {name:'registrar_fecha', typeName:'text' },
            {name:'todos_pueden_modificar', typeName:'boolean', defaultValue:false},
            {name:'cant_tickets', typeName: "bigint", inTable:false, editable:false}, 
            {name:'orden', typeName: "integer"}, 
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
        sql:{fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM tickets t WHERE t.estado = estados.estado)` }}}
    }
    return td
}