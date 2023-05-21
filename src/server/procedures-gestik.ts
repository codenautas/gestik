"use strict";

import { UploadedFileInfo } from "backend-plus";
import * as fs from "fs-extra";
import { ProcedureDef } from './types-gestik';

export const ProceduresGestik:ProcedureDef[] = [
    {
        action:'archivo_subir',
        progress: true,
        parameters:[
            {name: 'campo'    , typeName: 'text'},
            {name: 'anotacion', typeName: 'text'},
            {name: 'ticket', typeName: 'text'},
        ],
        files:{count:1},
        coreFunction:async function(context, parameters, files){
            const be=context.be;
            const client=context.client;
            const campos:{[k:string]:{
                nombre:string
                sqlset:string
            }}={
                archivo:{
                    nombre:'archivo',
                    sqlset:`archivo = coalesce(archivo, $1)`
                },
            };
            if(!(parameters.campo in campos)){
                throw new Error('invalid')
            }
            const campoDef = campos[parameters.campo];
            context.informProgress({message:be.messages.fileUploaded});
            let file = files![0]
            let originalFilename = file.originalFilename;
            let filename=originalFilename;
            var createResponse = function createResponse(adjuntoRow:any){
                let resultado = {
                    message: `el archivo ${adjuntoRow[campoDef.nombre]} se subió correctamente.`,
                    nombre: adjuntoRow[campoDef.nombre],
                }
                return resultado
            }
            var moveFile = async function moveFile(file:UploadedFileInfo, anotacion:string, ticket:string, fileName:string){
                let newPath = `local-attachments/${anotacion}/${ticket}/${fileName}`;
                return fs.move(file.path, newPath, { overwrite: true });
            }
            var {row} = await client.query(`
                update anotaciones 
                    set ${campoDef.sqlset}
                    where anotacion = $2 and ticket = $3 returning *
            `,
                [filename, parameters.anotacion, parameters.ticket]
            ).fetchUniqueRow();
            var resultado = createResponse(row);
            await moveFile(file,row.anotacion,row.ticket, row[campoDef.nombre]);
            return resultado;
        }
    }
];
