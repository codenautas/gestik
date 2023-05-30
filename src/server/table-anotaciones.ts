"use strict"

import { TableDefinition, TableContext } from "types-gestik";

export function anotaciones(context:TableContext):TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'anotaciones',
        elementName: 'anotación',
        fields: [
            {name:'proyecto', typeName:'text'},
            {name:'ticket', typeName:'bigint' },
            {name:'anotacion', typeName:'bigint', nullable:true, title:'anotación', editable:false },
            {name:'usuario', typeName:'text', defaultValue: context.user.usuario  },
            {name:'detalle', typeName:'text' },
            {name:'timestamp', typeName:'timestamp', defaultDbValue:'current_timestamp', editable:false },
            {name:'subir', editable:false, clientSide:'subirAdjunto', typeName:'text'},
            {name:'archivo', title:'archivo', editable:false , typeName:'text'},
            {name:'bajar', editable:false, clientSide:'bajarAdjunto', typeName:'text'},
        ],
        primaryKey: ['proyecto', 'ticket', 'anotacion'],
        foreignKeys: [
            {references: 'tickets', fields: ['proyecto','ticket']},
            {references: 'usuarios', fields: ['usuario']},
        ],
        constraints:[
            {constraintType:'unique', fields:['proyecto','ticket','archivo']},
        ],
    }
    return td
}