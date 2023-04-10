"use strict"

import { TableDefinition } from "backend-plus";

export function proyectos_estados():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        name: 'proyectos_estados',
        fields: [
            {name: 'proyecto', typeName: 'text'},
            {name: 'estado', typeName: 'text'}
        ],
        primaryKey: ['proyecto', 'estado'],
        sql: {
            isTable: false,
            from: `(SELECT * FROM proyectos CROSS JOIN estados)`
        },
    }
    return td
}