"use strict"

import { TableContext, TableDefinition, FieldDefinition } from "./types-gestik";

const sqlView = `
    (
		requirente = get_app_user()
	) OR (
		asignado = get_app_user()
	) OR (
        SELECT true
        FROM equipos_usuarios eu
        JOIN equipos_usuarios et ON (eu.equipo = et.equipo)
		JOIN equipos_proyectos ep ON (eu.equipo = ep.equipo)
        WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto AND ((et.usuario = tickets.requirente) OR (et.usuario = tickets.asignado))
        LIMIT 1
	) OR (
		SELECT true
		FROM equipos_proyectos ep
		JOIN equipos_usuarios eu ON (eu.equipo = ep.equipo)
		WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto and ep.es_asignado is not true and ep.es_requirente is not true
		LIMIT 1
	)`;

const sqlEsRequirente = `
    (
        SELECT COALESCE(ep.es_requirente, false)
        FROM equipos_proyectos ep
        JOIN equipos_usuarios eu ON (eu.equipo = ep.equipo)
        WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
        LIMIT 1
    ) AND (
        requirente = get_app_user()
    )`;

const sqlEsAsignado = `
    (
        SELECT COALESCE(ep.es_asignado, false)
        FROM equipos_proyectos ep
        JOIN equipos_usuarios eu ON (eu.equipo = ep.equipo)
        WHERE eu.usuario = get_app_user() AND ep.proyecto = tickets.proyecto
        LIMIT 1
    ) AND (
        asignado = get_app_user()
    )`;

const sqlPoliticasTickets = (modo : 'delete' | 'insert' | 'update' | 'select') => {
    let specificPolicy: string;
    switch (modo) {
        case 'select': specificPolicy = sqlView; break;
        case 'insert': specificPolicy = sqlEsRequirente; break;
        case 'update': specificPolicy = `(${sqlEsRequirente}) OR (${sqlEsAsignado})`; break;
        case 'delete': specificPolicy = `(${sqlEsRequirente}) OR (${sqlEsAsignado})`; break;
        default: specificPolicy = 'false'; break;
    }
    return `(
        SELECT rol = 'admin' FROM usuarios WHERE usuario = get_app_user()
    ) OR (
        ${specificPolicy}
    )`;
};

export function sqlExprCantTickets(_context: TableContext, filter: string, joinEstados?:boolean){
    return `(SELECT nullif(count(*), 0) as cant_tickets FROM tickets t
        ${joinEstados ? `INNER JOIN estados e ON t.estado = e.estado` : ``}
        WHERE (${filter}))`;
}

type Opts = {
    zona?:string,
}

export function tickets(_context: TableContext, opts: Opts = {}):TableDefinition{
    const isTable = opts.zona == null; // zona se usa para dividir en partes la pantalla de carga de tickets
    const fields: (FieldDefinition & {zona:string, siempre?:boolean})[] = [
        {name:'proyecto'           , typeName:'text'  , zona:'1' ,siempre:true , },
        {name:'ticket'             , typeName:'bigint', zona:'1' ,siempre:true , nullable:true, editable:false, defaultDbValue:'0'},
        {name:'tipo_ticket'        , typeName:'text'  , zona:'1' , title:'tipo ticket'},
        {name:'cant_anotaciones'   , typeName:'bigint', zona:'0' , inTable:false, editable:false, title:'c.a.', description: 'cantidad anotaciones'},
        {name:'asunto'             , typeName:'text'  , zona:'1' , title:'asunto', nullable:false},
        {name:'descripcion'        , typeName:'text'  , zona:'2' , title:'descripción' },
        {name:'requirente'         , typeName:'text'  , zona:'3' , specialDefaultValue: 'current_user'},
        {name:'estado'             , typeName:'text'  , zona:'3' , alwaysShow:true},
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
        fields: fields.filter(def => opts.zona == null || def.siempre || def.zona == opts.zona).map(
            ({zona, ...def}) => def // eslint-disable-line @typescript-eslint/no-unused-vars, no-unused-vars
        ),
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
            isTable,
            fields:{
                cant_anotaciones:{ expr: `(SELECT nullif(count(*),0) FROM anotaciones a WHERE a.proyecto = tickets.proyecto and a.ticket = tickets.ticket)` },
                asignado_pendiente:{ expr:`(CASE WHEN estados.esta_pendiente THEN tickets.asignado ELSE null END)`}
            },
            ...(isTable ? {
                policies: {
                    update: {
                        using: sqlPoliticasTickets('update'),
                        check: sqlPoliticasTickets('update'),
                    },
                    delete: {
                        using: sqlPoliticasTickets('delete'),
                    },
                    select: {
                        using: sqlPoliticasTickets('select'),
                    },
                    insert:{
                        check: sqlPoliticasTickets('insert'),
                    }
                },
            } : {})
            },
        hiddenColumns:['asignado_pendiente','estados__solapa' /*,...(opts.zona == '1' || opts.zona == null ? [] : ['proyec'])*/],
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
