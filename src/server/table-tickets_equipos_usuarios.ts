"use strict"

import { TableDefinition, TableContext } from "backend-plus";
import { tickets } from "./table-tickets";

export function tickets_equipos_usuarios(context:TableContext):TableDefinition{
    const td = tickets(context);
    var q = context.be.db.quoteLiteral(context.user.usuario);
    td.name = 'tickets_equipos_usuarios';
    td.sql && (
        td.sql.isTable=false, 
        td.sql.where = `tickets.requirente <> ${q} and exists (select * from equipos_usuarios eu where eu.usuario = tickets.requirente and 
        eu.equipo in (select e.equipo from equipos_usuarios e where e.usuario = ${q}))`
    );
    return td
}