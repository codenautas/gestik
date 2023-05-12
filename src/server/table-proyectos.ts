"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'proyectos',
        elementName: 'proyecto',
        fields: [
            {name:'proyecto', typeName:'text'},
            {name:'cant_tickets', typeName: "bigint", inTable:false, editable:false}
        ],
        primaryKey: ['proyecto'],
        detailTables: [
            { table: "proyectos_solapas", fields: [ "proyecto"], abr: "S", label: "solapas" },
            { table: "proyectos_estados", fields: [ "proyecto"], abr: "E", label: "estados" },
            { table: "tickets", fields: [ "proyecto" ], abr: "T" },
        ],
        sql:{fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM tickets t WHERE t.proyecto = proyectos.proyecto)` }}}
    }
    return td
}