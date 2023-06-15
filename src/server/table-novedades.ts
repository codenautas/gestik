"use strict"

import { TableDefinition } from "backend-plus";

export function novedades():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'novedades',
        fields: [
            {name:'descripcion', typeName:'text',},
        ],
        primaryKey: ['key'],
    }
    return td
}