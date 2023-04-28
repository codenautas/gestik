"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos_estados():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        allow: {"vertical-edit": false},
        name: 'proyectos_estados',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'estado', typeName: 'text'},
            {name: 'cant_tickets', typeName: 'bigint', inTable:false,},
        ],
        primaryKey: ['proyecto', 'estado'],
        detailTables: [
            {table: 'tickets', fields:['proyecto', 'estado'], abr:'t'}
        ],
        sql: {
            isTable: false,
            from: `(SELECT * 
                FROM proyectos AS p 
                CROSS JOIN estados AS e 
                LEFT JOIN LATERAL (
                    SELECT count(*) as cant_tickets FROM tickets t WHERE t.proyecto = p.proyecto AND t.estado = e.estado
                ) AS t ON true
            )`
        },
    }
    return td
}