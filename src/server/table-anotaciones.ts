"use strict"

import { TableDefinition, TableContext } from "./types-gestik";

export function anotaciones(context:TableContext):TableDefinition{

    const sqlRequirenteOAsignado = `
        SELECT COALESCE(ep.es_requirente, false) OR COALESCE(ep.es_asignado, false)
        FROM equipos_proyectos ep
        JOIN equipos_usuarios eu ON (eu.equipo = ep.equipo)
        WHERE eu.usuario = get_app_user() AND ep.proyecto = anotaciones.proyecto
        LIMIT 1
    `;

    const sqlMyUser = 'usuario = get_app_user()';

    const sqlPoliticasTickets = (modo : 'delete' | 'insert' | 'update') => {
        let specificPolicy: string;
        switch (modo) {
            case 'insert': specificPolicy = sqlRequirenteOAsignado; break;
            case 'update': specificPolicy = sqlMyUser; break;
            case 'delete': specificPolicy = sqlMyUser; break;
            default: specificPolicy = 'false'; break;
        }
        return `(
            SELECT rol = 'admin' FROM usuarios WHERE usuario = get_app_user()
        ) OR (
            ${specificPolicy}
        )`;
    };

    const td:TableDefinition = {
        editable: true,
        name: 'anotaciones',
        elementName: 'anotación',
        fields: [
            {name:'proyecto', typeName:'text'},
            {name:'ticket', typeName:'bigint' },
            {name:'anotacion', typeName:'bigint', nullable:true, title:'anotación', editable:false, defaultDbValue:'0'},
            {name:'usuario', typeName:'text', editable:false, defaultValue: context.user.usuario  },
            {name:'detalle', typeName:'text'},
            {name:'proyecto_relacionado', typeName:'text', title:'link_proyecto'},
            {name:'ticket_relacionado', typeName:'bigint', title:'link_ticket'},
            {name:'link_a_ticket', typeName:'text', clientSide:'link_a_ticket', editable:false, title:'link'},
            {name:'timestamp', typeName:'timestamp', defaultDbValue:'current_timestamp', editable:false, inTable:true, clientSide:'timestamp', title:'📅'},
            {name:'subir', editable:false, clientSide:'subirAdjunto', typeName:'text'},
            {name:'archivo', title:'archivo', editable:false , typeName:'text'},
            {name:'bajar', editable:false, clientSide:'bajarAdjunto', typeName:'text'},
        ],
        primaryKey: ['proyecto', 'ticket', 'anotacion'],
        foreignKeys: [
            {references: 'tickets', fields: ['proyecto','ticket']},
            {references: 'usuarios', fields: ['usuario']},
            {
                references: 'tickets', fields: [
                    {source: 'proyecto_relacionado', target: 'proyecto'},
                    {source: 'ticket_relacionado', target: 'ticket'},
                ],
                alias: 'tickets_relacionados'
            },
            {
                references: 'proyectos', fields: [
                    {source: 'proyecto_relacionado', target: 'proyecto'},
                ],
                alias: 'proyectos_relacionados'
            },
        ],
        constraints:[
            {constraintType:'unique', fields:['proyecto','ticket','archivo']},
        ],
        hiddenColumns: ['archivo'],
        sql:{
            policies: {
                update: {
                    using: sqlPoliticasTickets('update'),
                    check: sqlPoliticasTickets('update'),
                },
                delete: {
                    using: sqlPoliticasTickets('delete'),
                },
                insert:{
                    check: sqlPoliticasTickets('insert'),
                }
            },
        },
        clientSide:'anotaciones'
    }
    return td
}