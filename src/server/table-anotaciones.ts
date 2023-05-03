"use strict"

import { TableDefinition } from "backend-plus";

export function anotaciones():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'anotaciones',
        fields: [
            {name:'anotacion', typeName:'text' },
            {name:'descripcion', typeName:'text' }
        ],
        primaryKey: ['anotacion'],
    }
    return td
}