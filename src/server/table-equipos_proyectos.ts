"use strict"

import { TableDefinition, TableContext } from "./types-gestik";

export function equipos_proyectos(context: TableContext):TableDefinition{
    const admin = context.user.rol == 'admin';
    const td:TableDefinition = {
        editable: admin,
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
            {references: 'proyectos', fields: ['proyecto'], displayAllFields:true},
            {references: 'equipos'  , fields: ['equipo'  ], displayAllFields:true},
        ],
    }
    return td
}