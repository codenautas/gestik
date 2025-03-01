"use strict"

import { TableContext, TableDefinition } from "backend-plus";

export function tipos_ticket(context: TableContext):TableDefinition{
    const td:TableDefinition = {
        editable: context.user.rol == 'admin',
        name: 'tipos_ticket',
        fields: [
            {name:'tipo_ticket', typeName:'text' }
        ],
        primaryKey: ['tipo_ticket'],
        detailTables: [
            {table: "tickets", fields: ["tipo_ticket"], abr: "T"}
        ],
    }
    return td
}