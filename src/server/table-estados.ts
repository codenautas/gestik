"use strict"

import { TableDefinition } from "backend-plus";

export function estados():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'estados',
        fields: [
            {name:'estado', typeName:'bigint',},
            {name:'label', typeName:'text',},
            {name:'codigo', typeName:'text' },
            {name:'descripcion', typeName:'text' },
            {name:'todos_pueden_modificar', typeName:'text' }
        ],
        primaryKey: ['estado']
    }
    return td
}