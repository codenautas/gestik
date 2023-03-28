"use strict"

import { TableDefinition } from "backend-plus";

export function tickets():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'tickets',
        fields: [
            {name:'ticket', typeName:'bigint', nullable:true, editable:false, sequence:{prefix:undefined, firstValue:101, name:'tickets_seq' }},
            {name:'asunto', typeName:'text', label:'asubto'},
            {name:'descripcion', typeName:'text', label:'descripción' },
            {name:'proyecto', typeName:'text' },
            {name:'prioridad', typeName:'text' },
            {name:'f_tiket', typeName:'text', label:'fecha tiket' },
            {name:'requirente', typeName:'text' },
            {name:'estado', typeName:'text' },
            {name:'destino', typeName:'text' },
            {name:'asignado', typeName:'text' },
            {name:'version', typeName:'text', label:'versión' },
            {name:'esfuerzo_estimado', typeName:'text', label:'esfuerzo estimado'},
            {name:'f_realizacion', typeName:'date', label:'fecha realización'},
            {name:'f_instalacion', typeName:'date', label:'fecha instalación'},
            {name:'modulo', typeName:'text', label:'módulo' },
            {name:'tema', typeName:'text'},
            {name:'observaciones', typeName:'text'},
            {name:'sugerencias PEI', typeName:'text'}
        ],
        primaryKey: ['ticket']
    }
    return td
}