"use strict"

import { sqlExprCantTickets } from "./table-tickets";
import { TableDefinition, TableContext } from "./types-gestik";

const sqlExprEsAdmin = `SELECT rol='admin' FROM usuarios WHERE usuario = get_app_user()`;
const sqlExprPuedeVer = `SELECT puede_ver = true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo) WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto limit 1`;
const sqlExprEsEquipoAsignado = `SELECT true FROM equipos_usuarios eu INNER JOIN equipos_proyectos ep USING (equipo) WHERE usuario = get_app_user() and ep.proyecto = proyectos.proyecto limit 1`;

export function proyectos(context: TableContext):TableDefinition{
    const admin = context.user.rol == 'admin';
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
            {name:'es_general', typeName:'boolean', defaultDbValue: 'false' },
            {name:'visualizar', typeName:'boolean', defaultDbValue: 'true' },
            {name:'activo', typeName:'boolean', defaultDbValue: 'true' },
            {name:'observaciones', typeName:'text' },
            {name:'descripcion', typeName:'text'},


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
            policies: {
                select: {
                    using: `(${sqlExprEsAdmin}) OR (${sqlExprPuedeVer}) OR (${sqlExprEsEquipoAsignado})`,
                },
                update: {
                    using: `(${sqlExprEsAdmin}) OR (${sqlExprEsEquipoAsignado})`
                },
                insert: {
                    check: `(${sqlExprEsAdmin}) OR (${sqlExprEsEquipoAsignado})`
                },
                delete: {
                    using: `(${sqlExprEsAdmin}) OR (${sqlExprEsEquipoAsignado})`
                },
            }
        },
        hiddenColumns:['solapas_cant', 'solapa']
    }
    return td
}