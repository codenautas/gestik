"use strict"

import { TableDefinition } from "backend-plus";

export function equipos_proyectos():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        allow: {"vertical-edit": false},
        name: 'equipos_proyectos',
        fields: [
            {name: 'equipo', typeName: 'text'},
            {name: 'proyecto', typeName: 'text'},
            {name: 'es_requirente', typeName: 'boolean'},
            {name: 'es_asignado', typeName: 'boolean'},
        ],
        primaryKey: ['equipo', 'proyecto'],
        foreignKeys: [
            {references: "proyectos", fields: ['proyecto']},
            {references: "equipos", fields: ['equipo']},
        ],
    }
    return td
}