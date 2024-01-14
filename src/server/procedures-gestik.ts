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
            {name:'proyecto'  , typeName:'text' },
            {name:'ticket'    , typeName:'integer' },
            {name:'proyecto_cambio'    , typeName:'text'},
        ],
        roles:['admin'],
        coreFunction:async function(context:ProcedureContext, params:CoreFunctionParameters){
            try{
                const {rows:proyects} = await context.client.query(`
                    select tickets.proyecto, max(tickets.ticket) as value_max
                        from tickets
                        inner join estados on (estados.estado = tickets.estado)
                        right join (
                            select ep.proyecto
                                from equipos_proyectos ep
                                inner join equipos_usuarios eu on eu.equipo = ep.equipo
                                where eu.usuario = $1 and (ep.proyecto = $2 or ep.proyecto = $3)
                        ) up on (up.proyecto = tickets.proyecto)                                                                        
                        group by tickets.proyecto
                    `,
                    [context.user.usuario, params.proyecto_cambio, params.proyecto]
                ).fetchAll()
                if(proyects.length > 1){
                    let numTicket:number = 0
                    const result = proyects.find(e => e.proyecto === params.proyecto_cambio);
                    
                    result ? (numTicket = result.value_max + 1) : (numTicket = 1) 
                    
                    if(numTicket>0){
                        const {row} = await context.client.query(`
                            update tickets 
                                set proyecto = $3, ticket = $4
                                where proyecto = $1 and ticket = $2
                                returning *
                            `, 
                            [params.proyecto, params.ticket, params.proyecto_cambio, numTicket]
                        ).fetchUniqueRow()
                        
                        return {data: row, message:`Se cambió el proyecto ${params.proyecto} y ticket ${params.ticket} al proyecto ${params.proyecto_cambio} y ticket ${row.ticket}`}
                    }else{
                        return {data: {}, message:`No se encuentra el proyecto ${params.proyecto} y ticket ${params.ticket}`}
                    }
                }else{
                    return {data: {}, message:`No tiene permisos para cambiar un proyecto al que no pertenece`}
                }
                
            }catch(message){
                throw Error(`${message}`)
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
