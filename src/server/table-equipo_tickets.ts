"use strict"

import { whereTickets } from "./table-tickets";
import { TableContext, TableDefinition } from "./types-gestik";

export function equipo_tickets(context:TableContext, modo?:string):TableDefinition{
    modo = modo ?? ''
    const td:TableDefinition = {
        editable: false,
        allow: {"vertical-edit": false},
        name: `equipo_${modo}_tickets`,
        fields: [
            {name: 'equipo'  , typeName: 'text'},
            {name: 'proyecto', typeName: 'text'},
            {name: 'ticket'  , typeName: 'bigint'},
        ],
        primaryKey: ['equipo', 'proyecto', 'ticket'],
        sql: {
            isTable: false,
            from: `(SELECT equipo, proyecto, ticket
                    FROM tickets t INNER JOIN equipos_usuarios u ON ${modo ? `u.usuario = t.${modo}` : `u.usuario = t.requirente OR t.usuario = t.asignado`}
                    WHERE ${whereTickets(context, 't')}
                    GROUP BY equipo, proyecto, ticket
                    )`,
        },
        detailTables: [
            {table: 'anotaciones', fields: ['proyecto', 'ticket'], abr:'A'}
        ],
        softForeignKeys: [
            {references: 'equipos', fields: ['equipo'], displayAllFields:true },
            {references: 'tickets', fields: ['proyecto', 'ticket'], displayAllFields:true }
        ]
    }
    return td
}

export function equipo_requirente_tickets(context:TableContext):TableDefinition{
    return equipo_tickets(context, 'requirente');
}

export function equipo_asignado_tickets(context:TableContext):TableDefinition{
    return equipo_tickets(context, 'asignado');
}
