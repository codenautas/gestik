"use strict";

// import * as Path from 'path';
import { AppBackend, Context, Request, 
    ClientModuleDefinition, OptsClientPage, MenuDefinition, MenuInfoBase
} from "backend-plus";

// import {changing} from 'best-globals';

import {ProceduresGestik} from "./procedures-gestik";

import { usuarios   } from './table-usuarios';
import { tickets   } from './table-tickets';
import { solapas   } from './table-solapas';
import { estados   } from './table-estados';
import { equipos   } from './table-equipos';
import { prioridades   } from './table-prioridades';
import { proyectos   } from './table-proyectos';
import { tipos_ticket   } from './table-tipos_ticket';
import { proyectos_estados   } from './table-proyectos_estados';
import { proyectos_solapas } from './table-proyectos_solapas';
import { proyectos_estados_solapas } from './table-proyectos_estados_solapas';
import { parametros } from './table-parametros';

import {staticConfigYaml} from './def-config';

export class AppGestik extends AppBackend{
    constructor(){
        super();
    }
    async postConfig(){
        await super.postConfig();
    }
    configStaticConfig(){
        super.configStaticConfig();
        this.setStaticConfig(staticConfigYaml);
    }

    async getProcedures(){
        var be = this;
        return [
            ...await super.getProcedures(),
            ...ProceduresGestik
        ].map(be.procedureDefCompleter, be);
    }
    getMenu(context:Context):MenuDefinition{
        var menuContent:MenuInfoBase[]=[
            {menuType:'table', name:'tickets'},
            {menuType:'table', name:'proyectos'},
            {menuType:'table', name:'solapas'},
        ];
        if(context.user && context.user.rol=="admin"){
            menuContent.push(
                {menuType:'menu', name:'config', label:'configurar', menuContent:[
                    {menuType:'table', name:'equipos'},
                    {menuType:'table', name:'estados'},
                    {menuType:'table', name:'prioridades'},
                    {menuType:'table', name:'tipos_ticket'},
                    {menuType:'table', name:'parametros'},
                    {menuType:'table', name:'usuarios'},
                ]}
            )
        };
        return {menu:menuContent};
    }
    clientIncludes(req:Request|null, opts:OptsClientPage):ClientModuleDefinition[]{
        var menuedResources:ClientModuleDefinition[]=req && opts && !opts.skipMenu ? [
            { type:'js' , src:'client.js' },
        ]:[
            {type:'js' , src:'unlogged.js' },
        ];
        var list: ClientModuleDefinition[] = [
            ...super.clientIncludes(req, opts),
            { type: 'css', file: 'menu.css' },
            ... menuedResources
        ] satisfies ClientModuleDefinition[];
        return list;
    }
    prepareGetTables(){
        super.prepareGetTables();
        this.getTableDefinition={
            ... this.getTableDefinition,
            tipos_ticket,
            tickets,
            proyectos,
            prioridades,
            solapas,
            estados,
            proyectos_estados_solapas,
            proyectos_estados,
            proyectos_solapas,
            equipos,
            parametros,
            usuarios
        }
    }       
}
