"use strict"

import { TableDefinition, TableContext } from "types-gestik";

export function proyectos(context: TableContext):TableDefinition{
    var admin = context.user.rol == 'admin';
    var q = context.be.db.quoteLiteral;
    const td:TableDefinition = {
        editable: admin,
        name: 'proyectos',
        elementName: 'proyecto',
        fields: [
            {name:'proyecto', typeName: 'text'},
            {name:'cant_tickets', typeName: 'bigint', inTable:false, editable:false},
            {name:'solapas', typeName: 'text', clientSide:'solapas', inTable:false, editable:false}
        ],
        primaryKey: ['proyecto'],
        detailTables: [
            ...(admin?[{ table: 'equipos_proyectos', fields: ['proyecto'], abr: 'Q', label: 'equipos' }]:[]),
            { table: 'proyectos_solapas', fields: ['proyecto'], abr: 'S', label: 'solapas' },
            { table: 'proyectos_estados', fields: ['proyecto'], abr: 'E', label: 'estados' },
            { table: 'tickets', fields: [ 'proyecto' ], abr: 'T' },
        ],
        sql:{
            fields:{ cant_tickets:{ expr: `(SELECT count(*) FROM tickets t WHERE t.proyecto = proyectos.proyecto)` }},
            where: admin ? 'true' : `EXISTS (SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo) WHERE usuario = ${q(context.user.usuario)} and ep.proyecto = proyectos.proyecto)`
        }
    }
    return td
}