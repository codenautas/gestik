"use strict"

import { TableDefinition, TableContext } from "./types-gestik";

import { usuarios } from "./table-usuarios";

export function equipos_usuarios(context: TableContext):TableDefinition{
    const admin = context.user.rol == 'admin';
    const td:TableDefinition = {
        editable: admin,
        allow: {"vertical-edit": false},
        name: 'equipos_usuarios',
        fields: [
            {name: 'equipo', typeName: 'text'},
            {name: 'usuario', typeName: 'text'},
        ],
        primaryKey: ['equipo', 'usuario'],
        foreignKeys: [
            {references: "usuarios", fields: ['usuario'] , displayFields:['nombre', 'apellido', 'mail', 'interno'], onDelete:'cascade'},
            {references: "equipos" , fields: ['equipo']  , displayAllFields:true},
        ],
        detailTables: usuarios(context).detailTables,
    }
    return td
}