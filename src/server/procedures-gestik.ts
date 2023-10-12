"use strict";

import { UploadedFileInfo } from "backend-plus";
import * as fs from "fs-extra";
import { ProcedureDef } from './types-gestik';

export const ProceduresGestik:ProcedureDef[] = [
    {
        action:'archivo_subir',
        progress: true,
        parameters:[
            {name: 'proyecto' , typeName: 'text'},
            {name: 'ticket'   , typeName: 'text'},
            {name: 'anotacion', typeName: 'text'},
        ],
        files:{count:1},
        coreFunction:async function(context, parameters, files){
            const be=context.be;
            const client=context.client;
            context.informProgress({message:be.messages.fileUploaded});
            let file = files![0]
            let originalFilename = file.originalFilename;
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
                [filename, parameters.proyecto, parameters.ticket, parameters.anotacion]
            ).fetchUniqueRow();
            var resultado = createResponse(row);
            await moveFile(file, row.archivo);
            return resultado;
        }
    }
];
