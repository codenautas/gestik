"use strict"

import { TableContext, TableDefinition } from "./types-gestik";

export function whereTickets(context: TableContext, aliasTickets: string = 'tickets'){
    var admin = context.user.rol == 'admin';
    var q = context.be.db.quoteLiteral;
    return admin ? 'true' : `(
        requirente = ${q(context.user.usuario)} OR
        asignado = ${q(context.user.usuario)} OR
        EXISTS (
            SELECT true 
                FROM equipos_usuarios eu INNER JOIN equipos_usuarios et ON eu.equipo = et.equipo
                WHERE eu.usuario = ${q(context.user.usuario)}
                AND (et.usuario = ${aliasTickets}.requirente OR et.usuario = ${aliasTickets}.asignado)
        )
    )`
}

export function sqlExprCantTickets(context: TableContext, filter: string, joinEstados?:boolean){
    return `(SELECT nullif(count(*), 0) as cant_tickets FROM tickets t
        ${joinEstados ? `INNER JOIN estados e ON t.estado = e.estado` : ``}
        WHERE (${whereTickets(context, 't')})
            AND (${filter}))`;
}

export function tickets(context: TableContext):TableDefinition{
    const td:TableDefinition = {
        editable: true,
        name: 'tickets',
        elementName: 'ticket',
        fields: [
            {name:'proyecto', typeName:'text' },
            {name:'ticket', typeName:'bigint', nullable:true, editable:false, defaultDbValue:'0'},
            {name:'tipo_ticket', typeName:'text', title:'tipo ticket'},
            {name:'cant_anotaciones', typeName: 'bigint', inTable:false, editable:false, title:'c.a.', description: 'cantidad anotaciones'}, 
            {name:'asunto', typeName:'text', title:'asunto', nullable:false},
            {name:'descripcion', typeName:'text', title:'descripción' },
            {name:'requirente', typeName:'text', defaultValue: context.user.usuario },
            {name:'estado', typeName:'text'},
            {name:'asignado', typeName:'text' },
            {name:'modulo', typeName:'text', title:'módulo' },
            {name:'prioridad', typeName:'text' },
            {name:'f_ticket', typeName:'date', title:'fecha', defaultDbValue: 'current_date'},
            {name:'version', typeName:'text', title:'versión' },
            {name:'esfuerzo_estimado', typeName:'text', title:'esfuerzo estimado'},
            {name:'f_realizacion', typeName:'date', title:'realización'},
            {name:'f_instalacion', typeName:'date', title:'instalación'},
            {name:'tema', typeName:'text'},
            // {name:'observaciones', typeName:'text'},
            // {name:'sugerencias_pei', typeName:'text'},
            {name:'asignado_pendiente', typeName:'text', inTable:false}
        ],
        primaryKey: ['proyecto', 'ticket'],
        foreignKeys: [
            {references: "estados", fields: ['estado'], displayFields:['solapa']},
            {references: "proyectos", fields: ['proyecto']},
            {references: "usuarios", fields: [{source:'asignado' , target:'usuario'}], alias: 'asignado'},
            {references: "usuarios", fields: [{source:'requirente' , target:'usuario'}], alias: 'requirente'},
            {references: "prioridades", fields: ['prioridad']},
            {references: "tipos_ticket", fields: ['tipo_ticket']},
        ],
        detailTables: [
            {table: "anotaciones", fields: ["proyecto", "ticket"], abr: "A"},
        ],
        sql:{
            fields:{ 
                cant_anotaciones:{ expr: `(SELECT nullif(count(*),0) FROM anotaciones a WHERE a.proyecto = tickets.proyecto and a.ticket = tickets.ticket)` },
                asignado_pendiente:{ expr:`(CASE WHEN estados.esta_pendiente THEN tickets.asignado ELSE null END)`}
            },
            where: whereTickets(context)
        },
        hiddenColumns:['asignado_pendiente','estados__solapa']
    }
    return td
}

