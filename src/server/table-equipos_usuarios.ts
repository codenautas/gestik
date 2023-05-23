"use strict"

import { TableDefinition } from "backend-plus";

export function equipos_usuarios():TableDefinition{

    const td:TableDefinition = {
        editable: false,
        allow: {"vertical-edit": false},
        name: 'equipos_usuarios',
        fields: [
            {name: 'equipo', typeName: 'text'},
            {name: 'usuario', typeName: 'text'},
        ],
        primaryKey: ['equipo', 'usuario'],
        foreignKeys: [
            {references: "usuarios", fields: ['usuario']},
            {references: "equipos", fields: ['equipo']},
        ],
    }
    return td
}