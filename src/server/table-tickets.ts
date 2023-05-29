"use strict"

import { TableContext, TableDefinition } from "backend-plus";

export function tickets(context: TableContext):TableDefinition{
    var admin = context.user.rol == 'admin';
    var q = context.be.db.quoteLiteral;
    const td:TableDefinition = {
        editable: true,
        name: 'tickets',
        elementName: 'ticket',
        fields: [
            {name:'proyecto', typeName:'text' },
            {name:'ticket', typeName:'bigint', nullable:true, editable:false, defaultDbValue:'0'},
            {name:'tipo_ticket', typeName:'text', title:'tipo ticket'},
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
            {name:'sugerencias_pei', typeName:'text'}
        ],
        detailTables: [
            {table: "anotaciones", fields: ["proyecto", "ticket"], abr: "A"},
        ],
        hiddenColumns:['estados__solapa'],
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
        sql:{
            where: admin ? 'true' : `(
                EXISTS (
                    SELECT true FROM equipos_usuarios eu WHERE usuario = ${q(context.user.usuario)}
                        AND (eu.equipo = tickets.equipo_requirente OR eu.equipo = tickets.equipo_asignado)
                )
                OR requirente = ${q(context.user.usuario)}
                OR asignado = ${q(context.user.usuario)}
            )`
        }
    }
    return td
}