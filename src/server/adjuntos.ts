"use strict";

import * as Path from 'path';

export const CARPETA_ADJUNTOS = 'local-attachments';

// el nombre del archivo lo manda el cliente: se queda solo con el nombre, sin carpetas
export function nombreAdjuntoSeguro(nombre: string){
    const base = (nombre.split(/[\\/]/).pop() ?? '').trim();
    if (!base || base == '.' || base == '..') {
        throw new Error(`Nombre de archivo inválido: ${nombre}`);
    }
    return base;
}

// ruta del adjunto dentro de CARPETA_ADJUNTOS, falla si el nombre intenta salir de ella
export function rutaAdjunto(archivo: string){
    const carpeta = Path.resolve(CARPETA_ADJUNTOS);
    const ruta = Path.resolve(carpeta, archivo);
    if (!ruta.startsWith(carpeta + Path.sep)) {
        throw new Error(`Ruta de adjunto fuera de ${CARPETA_ADJUNTOS}: ${archivo}`);
    }
    return ruta;
}
