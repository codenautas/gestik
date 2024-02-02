"use strict"

import { sqlExprCantTickets } from "./table-tickets";
import { TableDefinition, TableContext } from "./types-gestik";

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
            {name:'solapas', typeName: 'text', clientSide:'solapas', inTable:false, editable:false},
            {name:'solapas_cant', typeName: 'jsonb', inTable:false},
            {name:'solapa', typeName:'text', clientSide:'nothing', inTable:false, serverSide:false},
            {name:'es_general', typeName:'boolean', defaultValue:false }
        ],
        primaryKey: ['proyecto'],
        softForeignKeys:[
            // {references:'solapas', fields:['solapa'], displayFields:[]}
        ],
        detailTables: [
            ...(admin?[{ table: 'equipos_proyectos', fields: ['proyecto'], abr: 'Q', label: 'equipos' }]:[]),
            { table: 'proyectos_solapas', fields: ['proyecto'], abr: 'S', label: 'solapas' },
            { table: 'proyectos_estados', fields: ['proyecto'], abr: 'E', label: 'estados' },
            { table: 'tickets', fields: [ 'proyecto', {source:'solapa', target:'estados__solapa', nullMeansAll:true} ], abr: 'T' },
        ],
        sql:{
            fields:{ 
                cant_tickets:{ expr: sqlExprCantTickets(context, `t.proyecto = proyectos.proyecto`) },
                solapas_cant:{ expr: `(
                    SELECT jsonb_agg(jsonb_build_object('solapa', s.solapa, 'cant', cant_tickets, 'orden', s.orden) order by s.orden) 
                        from solapas s  
                            inner join lateral ${sqlExprCantTickets(context, `t.proyecto = proyectos.proyecto and e.solapa = s.solapa`, true)} as x on true
                )`}
            },
            where: admin ? 'true' : `EXISTS (SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo) WHERE usuario = ${q(context.user.usuario)} and ep.proyecto = proyectos.proyecto)`
        },
        hiddenColumns:['solapas_cant', 'solapa']
    }
    return td
}