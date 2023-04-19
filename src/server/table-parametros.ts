"use strict";

import { TableContext, TableDefinition } from "backend-plus";

export function parametros(context: TableContext): TableDefinition {
    var admin = context.user.rol === 'admin';
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
        sql:{
            postCreateSqls:`insert into parametros (unico_registro,estado_predeterminado,tipo_predeterminado) values (true,'borrador','tarea');`
        },
        foreignKeys: [
            {references: "estados", fields: [{source:'estado_predeterminado' , target:'estado'}], alias: 'estado'},
            {references: "tipos_ticket", fields: [{source:'tipo_predeterminado' , target:'tipo_ticket'}], alias: 'tipo_ticket'},
        ],
    };
}