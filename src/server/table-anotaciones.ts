"use strict"

import { TableDefinition } from "backend-plus";

export function anotaciones():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'anotaciones',
        fields: [
            {name:'anotacion', typeName:'bigint', nullable:true, title:'anotación', editable:false, sequence:{prefix:undefined, firstValue:1, name:'anotacion_seq' } },
            {name:'ticket', typeName:'bigint' },
            {name:'usuario', typeName:'text' },
            {name:'detalle', typeName:'text' },
            {name:'timestamp', typeName:'timestamp', defaultDbValue:'current_timestamp', editable:false },
        ],
        primaryKey: ['anotacion', 'ticket'],
        foreignKeys: [
            {references: "tickets", fields: ['ticket']},
            {references: "usuarios", fields: ['usuario']},
        ],
    }
    return td
}