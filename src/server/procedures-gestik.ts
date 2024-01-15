"use strict";

import { CoreFunctionParameters, ProcedureContext, UploadedFileInfo } from "backend-plus";
import * as fs from "fs-extra";
import { ProcedureDef } from './types-gestik';

export const ProceduresGestik:ProcedureDef[] = [
    {
        action:'archivo_subir',
        progress: true,
        parameters:[
            {name: 'proyecto' , typeName: 'text'},
            {name: 'ticket'   , typeName: 'bigint'},
            {name: 'anotacion', typeName: 'bigint'},
        ],
        files:{count:1},
        coreFunction:async function(context, parameters, files){
            const be=context.be;
            const client=context.client;
            context.informProgress({message:be.messages.fileUploaded});
            let file = files![0]
            let originalFilename = file.originalFilename;
            let anotacion = parameters.anotacion
            if(!anotacion){
                let {row:insertedRow} = await client.query(`
                    insert into anotaciones 
                        (proyecto, ticket, usuario) values ($1, $2, $3) 
                    returning *
                `,
                    [parameters.proyecto, parameters.ticket, context.username]
                ).fetchUniqueRow();
                originalFilename = originalFilename.replace('pasted-$$anotacion',`pasted-${insertedRow.anotacion}`)
                anotacion = insertedRow.anotacion;
            }
            let filename=`${parameters.proyecto}/${parameters.ticket}/${originalFilename}`;
            var createResponse = function createResponse(adjuntoRow:any){
                let resultado = {
                    message: `el archivo ${adjuntoRow.archivo} se subió correctamente.`,
                    nombre: adjuntoRow.archivo,
                }
                return resultado
            }
            var moveFile = async function moveFile(file:UploadedFileInfo, fileName:string){
                let newPath = `local-attachments/${fileName}`;
                return fs.move(file.path, newPath, { overwrite: true });
            }
            var {row} = await client.query(`
                update anotaciones 
                    set archivo = $1
                    where proyecto = $2 and ticket = $3 and anotacion = $4 returning *
            `,
                [filename, parameters.proyecto, parameters.ticket, anotacion]
            ).fetchUniqueRow();
            var resultado = createResponse(row);
            await moveFile(file, row.archivo);
            return {...resultado, row};
        }
    },
    {
        action: 'cambiar_proyecto',
        parameters:[
            {name:'del_proyecto'   , typeName:'text'   , references: 'proyectos'},
            {name:'el_ticket'      , typeName:'integer' },
            {name:'al_proyecto'    , typeName:'text', references: 'proyectos'},
        ],
        proceedLabel:'cambiar',
        roles:['admin'],
        coreFunction:async function(context:ProcedureContext, params:CoreFunctionParameters){
            if (params.del_proyecto == params.al_proyecto) {
                throw new Error("Tiene que espeficar dos proyectos distintos.");
            }
            const {row:last_ticket} = await context.client.query(`
                select tickets.ticket as max_value
                    from tickets
                        right join (
                            select ep.proyecto
                                from equipos_proyectos ep
                                inner join equipos_usuarios eu on eu.equipo = ep.equipo
                                where eu.usuario = $1 and ep.proyecto = $2 and ep.es_requirente
                                limit 1
                        ) up on (up.proyecto = tickets.proyecto)                                                                        
                    order by tickets.ticket desc
                    limit 1
                `,
                [context.user.usuario, params.al_proyecto]
            ).fetchOneRowIfExists();
            if (!last_ticket) {
                throw new Error(`El usuario no esta en un equipo que pueda hacer requerimientos en el proyecto "${params.al_proyecto}" o bien el proyecto no existe.`);
            }
            let numTicket:number = (last_ticket.max_value ?? 0) + 1;
            const {row:updated_ticket} = await context.client.query(`
                update tickets 
                    set proyecto = $3, ticket = $4
                    where proyecto = $1 and ticket = $2
                    returning *
                `, 
                [params.del_proyecto, params.el_ticket, params.al_proyecto, numTicket]
            ).fetchOneRowIfExists();
            if (updated_ticket) {
                return `El ticket "${params.del_proyecto}-${params.el_ticket}" se cambió a "${params.al_proyecto}-${updated_ticket.ticket}"`;
            } else {
                throw new Error(`No se encuentra el ticket "${params.del_proyecto}-${params.el_ticket}" en el proyecto `)
            }
        }
    },
    {
        action: 'buscar_ticket',
        parameters:[
            {name:'buscar'    , typeName:'text'},
        ],
        roles:['admin'],
        resultOk:'showGrid',
        coreFunction:async function(_context:ProcedureContext, params:CoreFunctionParameters){
            return {tableName:'tickets', pick:params.buscar};
        }
    },
];
