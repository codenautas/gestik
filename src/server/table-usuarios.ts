"use strict";

import {TableDefinition, TableContext} from "./types-gestik";

export function usuarios(context:TableContext):TableDefinition{
    var admin = context.user.rol==='admin';
    return {
        name:'usuarios',
        title:'Usuarios de la Aplicación',
        editable:admin,
        fields:[
            {name:'usuario'          , typeName:'text'    , nullable:false  },
            {name:'rol'              , typeName:'text'    },
            {name:'md5clave'         , typeName:'text'    , allow:{select: context.forDump} },
            {name:'activo'           , typeName:'boolean' , nullable:false ,defaultValue:false},
            {name:'nombre'           , typeName:'text'                      },
            {name:'apellido'         , typeName:'text'                      },
            {name:'telefono'         , typeName:'text'    , title:'teléfono'},
            {name:'interno'          , typeName:'text'                      },
            {name:'mail'             , typeName:'text'                      },
            {name:'mail_alternativo' , typeName:'text'                      },
            {name:'clave_nueva'      , typeName:'text', clientSide:'newPass', allow:{select:admin, update:true, insert:false}},
        ],
        primaryKey:['usuario'],
        sql:{
            where:admin || context.forDump?'true':"usuario = "+context.be.db.quoteNullable(context.user.usuario)
        },
        "detailTables": [
            {table: "tickets", abr: "TA", fields: [{source:'usuario', target:'asignado'}], refreshParent:true, refreshFromParent:true},
            {table: "tickets", abr: "TR", fields: [{source:'usuario', target:'requirente'}], refreshParent:true, refreshFromParent:true}
        ],
    };
}
