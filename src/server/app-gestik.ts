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
            {menuType:'menu', name:'redaccion', label:'redacción',  menuContent:[
                {menuType:'table', name:'tickets'},
                {menuType:'table', name:'equipos'},
                {menuType:'table', name:'estados'},
                {menuType:'table', name:'prioridades'},
                {menuType:'table', name:'proyectos'},
                {menuType:'table', name:'solapas'},
                {menuType:'table', name:'tipos_ticket'},
            ]},
        ];
        if(context.user && context.user.rol=="admin"){
            menuContent.push(
                {menuType:'menu', name:'config', label:'configurar', menuContent:[
                    {menuType:'table', name:'usuarios'  },
                ]}
            )
        };
        return {menu:menuContent};
    }
    clientIncludes(req:Request|null, opts:OptsClientPage):ClientModuleDefinition[]{
        var UsandoREact = true;
        var menuedResources:ClientModuleDefinition[]=req && opts && !opts.skipMenu ? [
            { type:'js' , src:'client.js' },
        ]:[
            {type:'js' , src:'unlogged.js' },
        ];
        var list: ClientModuleDefinition[] = [
            ...(UsandoREact?[
                { type: 'js', module: 'react', modPath: 'umd', fileDevelopment:'react.development.js', file:'react.production.min.js' },
                { type: 'js', module: 'react-dom', modPath: 'umd', fileDevelopment:'react-dom.development.js', file:'react-dom.production.min.js' },
                { type: 'js', module: '@mui/material', modPath: 'umd', fileDevelopment:'material-ui.development.js', file:'material-ui.production.min.js' },
                { type: 'js', module: 'material-styles', fileDevelopment:'material-styles.development.js', file:'material-styles.production.min.js' },
                { type: 'js', module: 'clsx', file:'clsx.min.js' },
                { type: 'js', module: 'redux', modPath:'../dist', fileDevelopment:'redux.js', file:'redux.min.js' },
                { type: 'js', module: 'react-redux', modPath:'../dist', fileDevelopment:'react-redux.js', file:'react-redux.min.js' },
            ]:[]) satisfies ClientModuleDefinition[],
            ...super.clientIncludes(req, opts),
            ...(UsandoREact?[
                { type: 'js', module: 'redux-typed-reducer', modPath:'../dist', file:'redux-typed-reducer.js' },
                { type: 'js', src: 'adapt.js' },
            ]:[])  satisfies ClientModuleDefinition[],
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
            equipos,
            usuarios
        }
    }       
}
