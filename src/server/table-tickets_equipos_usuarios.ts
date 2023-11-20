"use strict"

import { TableDefinition, TableContext } from "backend-plus";
import { tickets } from "./table-tickets";

type Opts = {
    sin_asignar?:boolean
}

export function tickets_equipos_usuarios(context:TableContext, opts: Opts = {}):TableDefinition{
    const td = tickets(context);
    const q = context.be.db.quoteLiteral(context.user.usuario);
    td.name = 'tickets_equipos_usuarios';
    const where_requirente = `tickets.requirente <> ${q}`;
    const where_sin_asignar = `asignado is null and estados.solapa <> 'cerrados'`;
    td.sql && (
        td.sql.isTable=false, 
        td.sql.from=`(
            select tickets.* 
            from tickets
            inner join estados on (estados.estado = tickets.estado)
            inner join (
                select eu.usuario, ep.proyecto
                from equipos_proyectos ep
                inner join equipos_usuarios eu on eu.equipo = ep.equipo
                where eu.equipo in (
                    select eu.equipo 
                    from equipos_usuarios eu 
                    where eu.usuario = ${q} 
                )
            ) up on (up.usuario = tickets.requirente and up.proyecto = tickets.proyecto)
        )`,
        td.sql.where = opts.sin_asignar ? where_sin_asignar : where_requirente
    );
    return td
}

export function tickets_pendientes(context:TableContext){
    return tickets_equipos_usuarios(context, {sin_asignar: true})
}