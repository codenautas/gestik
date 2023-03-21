"use strict"

import { TableDefinition } from "backend-plus";

export function tickets():TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'tickets',
        fields: [
            {name:'ticket', typeName:'bigint', sequence:{prefix:undefined, firstValue:101, name:'tickets_seq' }},
            {name:'titulo', typeName:'text', label:'título'},
            {name:'descripcion', typeName:'text' },
            {name:'operativo', typeName:'text' },
            {name:'prioridad', typeName:'text' },
            {name:'esfuerzo_estimado', typeName:'text' },
            {name:'asignado', typeName:'text' },
            {name:'estado', typeName:'text' },
            {name:'modulo', typeName:'text', label:'módulo' },
            {name:'tema', typeName:'text'},
            {name:'fecha_pedido', typeName:'date' },
            {name:'persona_pidio', typeName:'text', label:'persona pidió'},
            {name:'persona_recibio', typeName:'text', label:'persona recibió'},
            {name:'fecha_realizacion', typeName:'date', label:'fecha_realización'},
            {name:'observaciones', typeName:'text'},
            {name:'sugerencias PEI', typeName:'text'},

            {name:'bloqueado', typeName:'boolean' }
        ],
        primaryKey: ['ticket']
    }
    return td
}