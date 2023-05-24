"use strict"

import { TableDefinition, TableContext } from "types-gestik";

export function equipos(context: TableContext):TableDefinition{
    var admin = context.user.rol == 'admin';
    const td:TableDefinition = {
        editable: admin,
        name: 'equipos',
        fields: [
            {name:'equipo', typeName:'text' },
            {name:'descripcion', typeName:'text' }
        ],
        primaryKey: ['equipo'],
        detailTables: [
            ...(admin?[
                {table: 'equipos_usuarios' , fields:['equipo'], abr:'U', label:'usuarios' },
                {table: 'equipos_proyectos', fields:['equipo'], abr:'P', label:'proyectos'},
            ]:[]),
            {table: 'tickets', fields: [{source:'equipo', target:'equipo_requirente'}], label: 'tickets requeridos', abr: 'TR'},
            {table: 'tickets', fields: [{source:'equipo', target:'equipo_asignado'  }], label: 'tickets asginados' , abr: 'TA'}
        ],
    }
    return td
}