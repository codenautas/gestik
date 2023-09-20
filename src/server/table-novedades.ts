"use strict"

import { TableContext, TableDefinition } from "backend-plus";

export function novedades(context: TableContext):TableDefinition{
    const td:TableDefinition = {
        editable: context.user.rol == 'admin',
        name: 'novedades',
        fields: [
            {name:'descripcion', typeName:'text',},
        ],
        primaryKey: ['key'],
    }
    return td
}