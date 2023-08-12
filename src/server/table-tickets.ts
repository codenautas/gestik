"use strict"

import { TableContext, TableDefinition } from "./types-gestik";

export function whereTickets(context: TableContext){
    var admin = context.user.rol == 'admin';
    var q = context.be.db.quoteLiteral;
    return admin ? 'true' : `(
        EXISTS (
            SELECT true FROM equipos_usuarios eu WHERE usuario = ${q(context.user.usuario)}
                AND (eu.equipo = tickets.equipo_requirente OR eu.equipo = tickets.equipo_asignado)
        )
        OR requirente = ${q(context.user.usuario)}
        OR asignado = ${q(context.user.usuario)}
    )`
}

export function sqlExprCantTickets(context: TableContext, filter: string, joinEstados?:boolean){
    return `(SELECT nullif(count(*), 0) FROM tickets t 
        ${joinEstados ? `INNER JOIN estados e ON t.estado = e.estado` : ``}
        WHERE (${whereTickets(context)})
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
            {name:'modulo', typeName:'text', title:'módulo' },
            {name:'prioridad', typeName:'text' },
            {name:'f_ticket', typeName:'date', title:'fecha ticket', defaultDbValue: 'current_date'},
            {name:'requirente', typeName:'text', defaultValue: context.user.usuario },
            {name:'equipo_requirente', typeName:'text' },
            {name:'estado', typeName:'text'},
            {name:'equipo_asignado', typeName:'text' },
            {name:'asignado', typeName:'text' },
            {name:'version', typeName:'text', title:'versión' },
            {name:'esfuerzo_estimado', typeName:'text', title:'esfuerzo estimado'},
            {name:'f_realizacion', typeName:'date', title:'fecha realización'},
            {name:'f_instalacion', typeName:'date', title:'fecha instalación'},
            {name:'tema', typeName:'text'},
            {name:'observaciones', typeName:'text'},
            {name:'sugerencias_pei', typeName:'text'},
            {name:'asignado_pendiente', typeName:'text', inTable:false}
        ],
        primaryKey: ['proyecto', 'ticket'],
        foreignKeys: [
            {references: "estados", fields: ['estado'], displayFields:['solapa']},
            {references: "proyectos", fields: ['proyecto']},
            {references: "usuarios", fields: [{source:'asignado' , target:'usuario'}], alias: 'usuario_asignado'},
            {references: "usuarios", fields: [{source:'requirente' , target:'usuario'}], alias: 'usuario_requirente'},
            {references: "prioridades", fields: ['prioridad']},
            {references: "tipos_ticket", fields: ['tipo_ticket']},
            {references: "equipos", fields: [{source:'equipo_requirente' , target:'equipo'}], alias:'equipo_requirente'},
            {references: "equipos", fields: [{source:'equipo_asignado' , target:'equipo'}], alias: 'equipo_asignado'},
        ],
        detailTables: [
            {table: "anotaciones", fields: ["proyecto", "ticket"], abr: "A"},
        ],
        sql:{
            fields:{ 
                cant_anotaciones:{ expr: `(SELECT count(*) FROM anotaciones a WHERE a.proyecto = tickets.proyecto and a.ticket = tickets.ticket)` },
                asignado_pendiente:{ expr:`(CASE WHEN estados.esta_pendiente THEN tickets.asignado ELSE null END)`}
            },
            where: whereTickets(context)
        },
        hiddenColumns:['asignado_pendiente','estados__solapa']
    }
    return td
}

