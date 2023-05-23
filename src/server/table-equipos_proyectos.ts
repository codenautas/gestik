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
        ],
        primaryKey: ['equipo', 'usuario'],
        foreignKeys: [
            {references: "proyectos", fields: ['proyecto']},
            {references: "equipos", fields: ['equipo']},
        ],
    }
    return td
}