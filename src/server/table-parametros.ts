"use strict";

import { TableContext, TableDefinition } from "backend-plus";


export function parametros(context: TableContext): TableDefinition {
    const admin = context.user.rol === 'admin';
    return {
        name: 'parametros',
        elementName: 'parametro',
        editable: admin,
        fields: [
            { name: "unico_registro", typeName: 'boolean', nullable:false },
            { name: "estado_predeterminado", typeName: 'text', nullable:false },
            { name: "tipo_predeterminado", typeName: 'text', nullable:false },
        ],
        primaryKey: ['unico_registro'],
        constraints:[
            {consName:'unico registro', constraintType:'check', expr:'unico_registro is true'}
        ],
        foreignKeys: [
            {references: "estados", fields: [{source:'estado_predeterminado' , target:'estado'}], alias: 'estado'},
            {references: "tipos_ticket", fields: [{source:'tipo_predeterminado' , target:'tipo_ticket'}], alias: 'tipo_ticket'},
        ],
    };
}