"use strict";
import { ProcedureContext, UploadedFileInfo } from "backend-plus";
import * as fs from "fs-extra";
import { ProcedureDef } from './types-gestik';
import { guarantee, DefinedType, is } from "guarantee-type"

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
            const file = files![0]
            let originalFilename = file.originalFilename;
            let anotacion = parameters.anotacion
            if(!anotacion){
                const {row:insertedRow} = await client.query(`
                    insert into anotaciones
                        (proyecto, ticket, usuario) values ($1, $2, $3)
                    returning *
                `,
                    [parameters.proyecto, parameters.ticket, context.username]
                ).fetchUniqueRow();
                originalFilename = originalFilename.replace('pasted-$$anotacion',`pasted-${insertedRow.anotacion}`)
                anotacion = insertedRow.anotacion;
            }
            const filename=`${parameters.proyecto}/${parameters.ticket}/${originalFilename}`;
            const tipoAdjunto = is.object({
                archivo: is.string
            })
            type TipoAdjunto = DefinedType<typeof tipoAdjunto>;
            const createResponse = function createResponse(adjuntoRow: TipoAdjunto){
                const resultado = {
                    message: `el archivo ${adjuntoRow.archivo} se subió correctamente.`,
                    nombre: adjuntoRow.archivo,
                }
                return resultado
            }
            const moveFile = async function moveFile(file:UploadedFileInfo, fileName:string){
                const newPath = `local-attachments/${fileName}`;
                return fs.move(file.path, newPath, { overwrite: true });
            }
            const row = guarantee(tipoAdjunto, (await client.query(`
                update anotaciones
                    set archivo = $1
                    where proyecto = $2 and ticket = $3 and anotacion = $4 returning *
            `,
                [filename, parameters.proyecto, parameters.ticket, anotacion]
            ).fetchUniqueRow()).row);
            const resultado = createResponse(row);
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
        coreFunction:async function(context:ProcedureContext, params:{del_proyecto:string, el_ticket:number, al_proyecto:string}){
            if (params.del_proyecto == params.al_proyecto) {
                throw new Error("Tiene que espeficar dos proyectos distintos.");
            }
            let rowLastTikectGlobal;
            if(context.user.rol == 'admin'){
                const {row: rowLastTikect} = await context.client.query(`
                    select get_next_ticket_number($1) as next_value
                `,
                [params.al_proyecto]
                ).fetchOneRowIfExists();
                if (!rowLastTikect) {
                    throw new Error(`El proyecto "${params.al_proyecto}" no existe.`);
                }
                rowLastTikectGlobal = rowLastTikect;
            }else{
                const {row: rowLastTikect} = await context.client.query(`
                    select get_next_ticket_number(proyecto) as next_value
                        from equipos_proyectos ep
                            inner join equipos_usuarios eu on eu.equipo = ep.equipo
                            inner join usuarios u on u.usuario = eu.usuario
                        where eu.usuario = $1 and ep.proyecto = $2 and (ep.es_requirente or u.rol = 'admin')
                        limit 1
                    `,
                    [context.user.usuario, params.al_proyecto]
                ).fetchOneRowIfExists();
                if (!rowLastTikect) {
                    throw new Error(`El usuario no esta en un equipo que pueda hacer requerimientos en el proyecto "${params.al_proyecto}" o bien el proyecto no existe.`);
                }
                rowLastTikectGlobal = rowLastTikect;
            }
            const numTicket:number = guarantee(is.object({next_value: is.number}),rowLastTikectGlobal).next_value;
            const {row: rowUpdatedTicket} = await context.client.query(`
                update tickets
                    set proyecto = $3, ticket = $4
                    where proyecto = $1 and ticket = $2
                    returning *
                `,
                [params.del_proyecto, params.el_ticket, params.al_proyecto, numTicket]
            ).fetchOneRowIfExists();
            if (rowUpdatedTicket) {
                const ticket:number = guarantee(is.object({ticket: is.number}),rowUpdatedTicket).ticket;
                return `El ticket "${params.del_proyecto}-${params.el_ticket}" se cambió a "${params.al_proyecto}-${ticket}"`;
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
        resultOk:'showGrid',
        coreFunction:async function(_context:ProcedureContext, params:{buscar:string}){
            return {tableName:'tickets', pick:params.buscar};
        }
    },
];
