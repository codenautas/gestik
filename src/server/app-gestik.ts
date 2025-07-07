"use strict";

// import * as Path from 'path';
import { AppBackend, Context, Request,
    ClientModuleDefinition, OptsClientPage, MenuDefinition, MenuInfoBase
} from "backend-plus";

// import {changing} from 'best-globals';

import {ProceduresGestik} from "./procedures-gestik";
import { rm } from "fs/promises";

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
import { archivos_borrar } from "./table-archivos_borrar";
import { roles } from './table-roles';
import { equipos_proyectos } from './table-equipos_proyectos';
import { equipos_usuarios } from './table-equipos_usuarios';
import { equipo_asignado_tickets, equipo_requirente_tickets } from "./table-equipo_tickets";
import * as  MiniTools from "mini-tools";
import * as backendPlus from "backend-plus";

import {staticConfigYaml} from './def-config';

const cronMantenimiento = (be:AppBackend) => {
    const interval = setInterval(async ()=>{
        try{
            const d = new Date();
            const date = `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}, ${d.getHours()}:${d.getMinutes()}`;
            if(d.getHours() == 23 && d.getMinutes() == 58){
                const result = await be.inTransaction(null, async (client)=>{
                    const {rows} = await client.query("select ruta_archivo from archivos_borrar").fetchAll();
                    if(rows.length>0){
                        rows.forEach(async (element) => {
                            const path = `local-attachments/${element.ruta_archivo}`;
                            await client.query(`delete from archivos_borrar where ruta_archivo = $1`, [element.ruta_archivo]).execute();
                            await rm(path, { force: true });
                        });
                        return `Se borraron archivos adjuntos en la fecha y hora: ${date}`;
                    }else{
                        return `No hay archivos adjuntos para borrar en la fecha y hora: ${date}`;
                    }
                })
                console.info("Resultado de cron: ", result);
            }
        }catch(err){
            console.error(`Error en cron. ${err}`);
        }
    },60000);
    be.shutdownCallbackListAdd({
        message:'cron Mantenimiento',
        fun:async function(){
            clearInterval(interval);
            return Promise.resolve();
        }
    });
}
export class AppGestik extends AppBackend{

    addSchrödingerServices(mainApp:backendPlus.Express, baseUrl:string){
        const be = this;
        super.addSchrödingerServices(mainApp, baseUrl);
        mainApp.get(baseUrl+'/download/file', async function (req, res) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await be.inDbClient(req, async (client)=>{
                const result = await client.query(
                    'SELECT proyecto, ticket, anotacion, archivo FROM anotaciones WHERE proyecto = $1 and ticket = $2 AND anotacion = $3',
                    [req.query.proyecto, req.query.ticket, req.query.anotacion]
                ).fetchUniqueRow();
                const path = `local-attachments/${result.row.archivo}`;
                MiniTools.serveFile(path, {})(req, res);
            })
        });
    }
    async postConfig(){
        const be = this;
        cronMantenimiento(be);
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
        const parentProc = await super.getProcedures();
                return parentProc.concat(ProceduresGestik);
    }
    getMenu(context:Context):MenuDefinition{
        const menuContent:MenuInfoBase[]=[
            {menuType:'menu', name:'tickets', menuContent:[
                {menuType:'proc', name:'buscar_ticket', label:'buscar'},
                {menuType:'table', name:'nuevo', table:'tickets', td:{forInsertOnlyMode:true, gridAlias:'nuevo_ticket'}},
                {menuType:'proc' , name:'cambiar_proyecto', label:'cambiar de proyecto'},
            ]},
            //{menuType:'table', name:'proyectos'},//Esta opción se borra cuando se termine las de proyectos_abiertos y proyectos_cerrados
            {menuType:'proyectos_abiertos', autoproced: true, name:'proyectos_abiertos'},
            {menuType:'proyectos_cerrados', autoproced: true, name:'proyectos_cerrados'},

        ];
        const mis_verificaciones = {menuType:'mis_verificaciones', autoproced: true, name:'mis_verificaciones', ff:{username: context?.username}};
        if(context.user && context.user.rol=="admin"){
            menuContent.push(
                {menuType:'mis_pendientes', autoproced: true, name:'mis_pendientes', ff:{username: context?.username}},
                mis_verificaciones,
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
        }
        return {menu:menuContent};
    }
    clientIncludes(req:Request|null, opts:OptsClientPage):ClientModuleDefinition[]{
        const menuedResources:ClientModuleDefinition[]=req && opts && !opts.skipMenu ? [
            { type:'js' , src:'client.js' },
        ]:[
            {type:'js' , src:'unlogged.js' },
        ];
        const list: ClientModuleDefinition[] = [
            ...super.clientIncludes(req, opts),
            { type: 'css', file: 'menu.css' },
            ... menuedResources
        ] satisfies ClientModuleDefinition[];
        return list;
    }
    prepareGetTables(){
        const be = this;
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
            tickets_equipos_usuarios,tickets_pendientes,
            archivos_borrar
        }
        for(const table in this.getTableDefinition){
            be.appendToTableDefinition(table, function(tableDef){
                tableDef.selfRefresh = true;
                tableDef.refrescable = true;
            });
        }
    }
}
