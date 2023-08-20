"use strict"

import { TableContext, TableDefinition, FieldDefinition } from "./types-gestik";

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
type Opts = {
    zona?:string
}

export function tickets(context: TableContext, opts: Opts = {}):TableDefinition{
    var fields: (FieldDefinition & {zona:string, siempre?:boolean})[] = [
        {name:'proyecto'           , typeName:'text'  , zona:'1' ,siempre:true , },
        {name:'ticket'             , typeName:'bigint', zona:'1' ,siempre:true , nullable:true, editable:false, defaultDbValue:'0'},
        {name:'tipo_ticket'        , typeName:'text'  , zona:'1' , title:'tipo ticket'},
        {name:'cant_anotaciones'   , typeName:'bigint', zona:'0' , inTable:false, editable:false, title:'c.a.', description: 'cantidad anotaciones'}, 
        {name:'asunto'             , typeName:'text'  , zona:'1' , title:'asunto', nullable:false},
        {name:'descripcion'        , typeName:'text'  , zona:'2' , title:'descripción' },
        {name:'requirente'         , typeName:'text'  , zona:'3' , defaultValue: context.user.usuario },
        {name:'estado'             , typeName:'text'  , zona:'3' , },
        {name:'asignado'           , typeName:'text'  , zona:'3' , },
        {name:'modulo'             , typeName:'text'  , zona:'3' , title:'módulo' },
        {name:'prioridad'          , typeName:'text'  , zona:'3' , },
        {name:'f_ticket'           , typeName:'date'  , zona:'3' , title:'fecha', defaultDbValue: 'current_date'},
        {name:'version'            , typeName:'text'  , zona:'3' , title:'versión' },
        {name:'esfuerzo_estimado'  , typeName:'text'  , zona:'3' , title:'esfuerzo estimado'},
        {name:'f_realizacion'      , typeName:'date'  , zona:'3' , title:'realización'},
        {name:'f_instalacion'      , typeName:'date'  , zona:'3' , title:'instalación'},
        {name:'tema'               , typeName:'text'  , zona:'3' , },
        {name:'asignado_pendiente' , typeName:'text'  , zona:'0' , inTable:false}
    ]
    const td:TableDefinition = {
        editable: true,
        name: 'tickets'+(opts.zona ?? ''),
        elementName: 'ticket',
        tableName: 'tickets',
        fields: fields.filter(def => opts.zona == null || def.siempre || def.zona == opts.zona).map(({zona, ...def})=>def),
        primaryKey: ['proyecto', 'ticket'],
        foreignKeys: [
            {references: "proyectos", fields: ['proyecto']},
            ...(opts.zona == null || opts.zona == '3' ? [
                {references: "estados", fields: ['estado'], displayFields:['solapa']},
                {references: "usuarios", fields: [{source:'asignado' , target:'usuario'}], alias: 'asignado'},
                {references: "usuarios", fields: [{source:'requirente' , target:'usuario'}], alias: 'requirente'},
                {references: "prioridades", fields: ['prioridad']},
            ] : []),
            ...(opts.zona == null || opts.zona == '1' ? [
                    {references: "tipos_ticket", fields: ['tipo_ticket']},
            ] : [])
        ],
        detailTables: opts.zona ? [] : [
            // {table: "anotaciones", fields: ["proyecto", "ticket"], abr: "A"},
            {wScreen: "ticket", fields: ["proyecto", "ticket"], abr:"A", label:"anotaciones"}
        ],
        sql:{
            isTable: opts.zona == null,
            fields:{ 
                cant_anotaciones:{ expr: `(SELECT nullif(count(*),0) FROM anotaciones a WHERE a.proyecto = tickets.proyecto and a.ticket = tickets.ticket)` },
                asignado_pendiente:{ expr:`(CASE WHEN estados.esta_pendiente THEN tickets.asignado ELSE null END)`}
            },
            where: whereTickets(context)
        },
        hiddenColumns:['asignado_pendiente','estados__solapa' /*,...(opts.zona == '1' || opts.zona == null ? [] : ['proyec'])*/]
    }
    return td
}

export function tickets1(context: TableContext){
    return tickets(context, {zona: '1'});
}
export function tickets2(context: TableContext){
    return tickets(context, {zona: '2'});
}
export function tickets3(context: TableContext){
    return tickets(context, {zona: '3'});
}
