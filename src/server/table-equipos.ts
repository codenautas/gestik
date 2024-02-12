"use strict"

import { TableDefinition, TableContext } from "./types-gestik";

export function equipos(context: TableContext):TableDefinition{
    const admin = context.user.rol == 'admin';
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
            {table: 'equipo_requirente_tickets', fields: ['equipo'], label: 'tickets requeridos', abr: 'Ɍ'},
            {table: 'equipo_asignado_tickets'  , fields: ['equipo'], label: 'tickets asginados' , abr: '₳'}
        ],
    }
    return td
}