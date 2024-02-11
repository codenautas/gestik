"use strict";

import {TableDefinition, TableContext} from "./types-gestik";

export function usuarios(context:TableContext):TableDefinition{
    const admin = context.user.rol==='admin';
    return {
        name:'usuarios',
        title:'Usuarios de la Aplicación',
        editable:admin,
        fields:[
            {name:'usuario'          , typeName:'text'    , editable:admin , nullable:false },
            {name:'rol'              , typeName:'text'    , editable:admin },
            {name:'md5clave'         , typeName:'text'    , allow:{select: context.forDump} },
            {name:'activo'           , typeName:'boolean' , editable:admin , nullable:false ,defaultValue:false},
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
        foreignKeys: [
            {references: "roles", fields: ['rol']},
        ],
        detailTables: [
            {table: 'equipos_usuarios', abr: 'Q', label: 'equipos'  , fields: ['usuario'], refreshParent:true, refreshFromParent:true},
            {table: 'tickets', abr: '₳', label:'tickets asignados' , fields: [{source:'usuario', target:'asignado'}], refreshParent:true, refreshFromParent:true},
            {table: 'tickets', abr: 'Ᵽ', label:'tickets pendientes', fields: [{source:'usuario', target:'asignado_pendiente'}], refreshParent:true, refreshFromParent:true},
            {table: 'tickets', abr: 'Ɍ', label:'tickets requeridos', fields: [{source:'usuario', target:'requirente'}], refreshParent:true, refreshFromParent:true}
        ],
    };
}
