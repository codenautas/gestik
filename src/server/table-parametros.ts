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
        ],
        primaryKey: ['unico_registro'],
        constraints:[
            {consName:'unico registro', constraintType:'check', expr:'unico_registro is true'}
        ],
        sql:{
            postCreateSqls:'insert into parametros (unico_registro) values (true);'
        }
    };
}