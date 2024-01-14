"use strict";

// import * as Path from 'path';
import { AppBackend, Context, Request, 
    ClientModuleDefinition, OptsClientPage, MenuDefinition, MenuInfoBase
} from "backend-plus";

// import {changing} from 'best-globals';

import {ProceduresGestik} from "./procedures-gestik";

import { usuarios   } from './table-usuarios';
import { tickets, tickets1, tickets2, tickets3} from './table-tickets';
import { solapas   } from './table-solapas';
import { estados   } from './table-estados';
import { equipos   } from './table-equipos';
import { prioridades   } from './table-prioridades';
import { proyectos   } from './table-proyectos';
import { tipos_ticket   } from './table-tipos_ticket';
import { proyectos_estados   } from './table-proyectos_estados';
import { tickets_equipos_usuarios, tickets_pendientes } from './table-tickets_equipos_usuarios';
import { proyectos_solapas } from './table-proyectos_solapas';
import { proyectos_estados_solapas } from './table-proyectos_estados_solapas';
import { parametros } from './table-parametros';
import { anotaciones } from './table-anotaciones';
import { roles } from './table-roles';
import { equipos_proyectos } from './table-equipos_proyectos';
import { equipos_usuarios } from './table-equipos_usuarios';
import { equipo_asignado_tickets, equipo_requirente_tickets } from "./table-equipo_tickets";
import * as  MiniTools from "mini-tools";
import * as backendPlus from "backend-plus";

import {staticConfigYaml} from './def-config';

export class AppGestik extends AppBackend{
    constructor(){
        super();
    }
    addSchrödingerServices(mainApp:backendPlus.Express, baseUrl:string){
        var be=this;
        super.addSchrödingerServices(mainApp, baseUrl);
        mainApp.get(baseUrl+'/download/file', async function (req, res) {
            // @ts-ignore
            be.inDbClient(req,async (client)=>{
                var result = await client.query(
                    'SELECT proyecto, ticket, anotacion, archivo FROM anotaciones WHERE proyecto = $1 and ticket = $2 AND anotacion = $3',
                    [req.query.proyecto, req.query.ticket, req.query.anotacion]
                ).fetchUniqueRow();
                let path = `local-attachments/${result.row.archivo}`;
                MiniTools.serveFile(path, {})(req, res);
            })
        });
    }
    async postConfig(){
        await super.postConfig();
    }
    configStaticConfig(){
        super.configStaticConfig();
        this.setStaticConfig(staticConfigYaml);
    }
    override async getDataDumpTransformations(rawData:string){
        const result = await super.getDataDumpTransformations(rawData);
        const columnas = ['observaciones', 'sugerencias_pei'];
        for (const columna of columnas){
            if (new RegExp(`COPY \\w+\\.tickets \\((\\w|\\s|,)+${columna}(,|\\))`).test(rawData)) {
                result.prepareTransformationSql.push(
                    `alter table tickets add column ${columna} text;`
                )
                result.endTransformationSql.push(
                    `alter table tickets drop column ${columna};`
                )
            }
        }
        return result;
    }
    async getProcedures(){
        var parentProc = await super.getProcedures();
        return parentProc.concat(ProceduresGestik);
    }
    getMenu(context:Context):MenuDefinition{
        var menuContent:MenuInfoBase[]=[
            {menuType:'menu', name:'tickets', menuContent:[
                {menuType:'proc', name:'buscar_ticket', label:'buscar'},
                {menuType:'table', name:'nuevo', table:'tickets', td:{forInsertOnlyMode:true, gridAlias:'nuevo_ticket'}},
            ]},
            {menuType:'table', name:'proyectos'},
        ];
            
        let mis_verificaciones = {menuType:'mis_verificaciones', autoproced: true, name:'mis_verificaciones', ff:{username: context?.username}};
        if(context.user && context.user.rol=="admin"){
            menuContent.push(
                {menuType:'mis_pendientes', autoproced: true, name:'mis_pendientes', ff:{username: context?.username}},
                mis_verificaciones,
                {menuType:'proc' , name:'cambiar_proyecto', label:'cambiar proyecto'},
                {menuType:'menu', name:'config', label:'configurar', menuContent:[
                    {menuType:'table', name:'equipos'},
                    {menuType:'table', name:'estados'},
                    {menuType:'table', name:'solapas'},
                    {menuType:'table', name:'prioridades'},
                    {menuType:'table', name:'tipos_ticket'},
                    {menuType:'table', name:'parametros'},
                    {menuType:'table', name:'usuarios'},
                    {menuType:'table', name:'roles'},
                ]}
            )
        } else {
            menuContent.push(
                mis_verificaciones,
                {menuType:'table', name:'usuarios', label:'mi usuario'}
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
        var be = this;
        super.prepareGetTables();
        this.getTableDefinition={
            ... this.getTableDefinition,
            tipos_ticket,
            tickets,tickets1,tickets2,tickets3,
            proyectos,
            prioridades,
            solapas,
            estados,
            proyectos_estados_solapas,
            proyectos_estados,
            proyectos_solapas,
            equipos,
            parametros,
            roles,
            usuarios,
            anotaciones,
            equipos_proyectos,
            equipos_usuarios,
            equipo_asignado_tickets, 
            equipo_requirente_tickets,
            tickets_equipos_usuarios,tickets_pendientes
        }
        for(var table in this.getTableDefinition){
            be.appendToTableDefinition(table, function(tableDef){
                tableDef.selfRefresh = true;
                tableDef.refrescable = true;
            });
        }
    }       
}
