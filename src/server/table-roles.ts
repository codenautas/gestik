"use strict"

import { TableContext, TableDefinition } from "backend-plus";

export function roles(context: TableContext):TableDefinition{
    const admin = context.user.rol==='admin';
    const td:TableDefinition = {
        editable: admin,
        name: 'roles',
        fields: [
            {name:'rol', typeName:'text',},
            {name: 'puede_ver_todo', typeName: 'boolean', defaultValue: false},
        ],
        primaryKey: ['rol'],
    }
    return td
}