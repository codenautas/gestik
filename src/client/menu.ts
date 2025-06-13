"use strict";

import {DateTime, date} from "best-globals";
import {html} from "js-to-html"

function pretty(number:number):string{
    if(number>9999){
        if(number>999999){
            return Math.floor(number/1000000+0.5)+'M'
        }else{
            return Math.floor(number/1000+0.5)+'k'
        }
    }
    return ''+(number||0)
}

myOwn.clientSides.nothing = {
    update: function(){},
    prepare: async function(){}
}

myOwn.clientSides.solapas = {
    update: function(depot, fieldName){
        const control = depot.rowControls[fieldName];
        const solapas_cant = depot.row.solapas_cant as {solapa:string, cant:number}[]
        solapas_cant.forEach(({solapa, cant}) => {
            const button = control.buttons[solapa] as HTMLButtonElement
            button.textContent = solapa;
            button.appendChild(html.span({class:'numero-centrado'}, pretty(cant)).create());
        });
    },
    prepare: async function(depot, fieldName){
        const control = depot.rowControls[fieldName];
        const proyecto = depot.row.proyecto;
        const solapas_cant = depot.row.solapas_cant as {solapa:string, cant:number}[]
        const buttons: Record<string, HTMLButtonElement> = {}
        solapas_cant.forEach(({solapa}) => {
            const ff = {estados__solapa: solapa, proyecto}
            const button = myOwn.createForkeableButton({w:'table', table:'tickets', ff}, {
                label: solapa, 
                onclick: (event)=>{
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    if (event.ctrlKey) return
                    depot.row.solapa = solapa;
                    if (depot.detailControls.tickets.show) {
                        depot.detailControls.tickets.refreshAllRowsInGrid(true)
                    } else {
                        depot.detailControls.tickets.forceDisplayDetailGrid({})
                    }
                    solapas_cant.forEach(s => {
                        if (s.solapa == solapa) { 
                            buttons[s.solapa].setAttribute('is-selected','yes')
                        } else {
                            buttons[s.solapa].removeAttribute('is-selected')
                        }
                    })
                    event?.preventDefault();
                }
            });
            control.appendChild(button);
            buttons[solapa] = button;
        })
        control.buttons = buttons;
    }
}

function timeStampHtml(timestamp: DateTime){
    const today = date.today()
    if (timestamp.toDmy() == today.toDmy()) {
        return html.span({class:'ts-time', title:timestamp.toLocaleString()}, [timestamp.toHm()])
    } else if (timestamp.getFullYear() == today.getFullYear()) {
        return html.span({class:'ts-sameyear', title:timestamp.toLocaleString()}, [timestamp.toDmy().replace(/[-/]\d+$/,'')])
    } else {
        return html.span({class:'ts-otheryear', title:timestamp.toLocaleString()}, [timestamp.toDmy()])
    }
}

myOwn.clientSides.timestamp = {
    prepare: function(depot, fieldName){
        const control = depot.rowControls[fieldName];
        if (control.disabled) {
            const timestamp = depot.row[fieldName];
            control.innerHTML = "";
            if (timestamp) {
                control.appendChild(timeStampHtml(timestamp).create())
            }
        }
    }
}

myOwn.clientSides.timestamp.update = myOwn.clientSides.timestamp.prepare;

myOwn.clientSides.anotaciones = {
    prepare: function(depot){
        const control = depot.rowControls.detalle;
        const img = control.getElementsByClassName('anot-img');
        if (depot.row.anotacion === 0) {
            depot.rowControls.detalle.style.fontWeight = 'bold';
            depot.rowControls.detalle.disable(true);
        }
        if (!img[0] && depot.row.archivo && /\.(jpg|jpeg|png|svg)$/.test(depot.row.archivo)) {
            control.appendChild(html.img({class:'anot-img', src:`./download/file?proyecto=${depot.row.proyecto}&ticket=${depot.row.ticket}&anotacion=${depot.row.anotacion}`}).create())
        }
    }
}

myOwn.clientSides.anotaciones.update = myOwn.clientSides.anotaciones.prepare;

myOwn.wScreens.ticket = {
    parameters:[
        {name: "proyecto", typeName:"text"  , references:"proyectos"},
        {name: "ticket"  , typeName:"bigint"},
    ],
    mainAction: async function(params:{proyecto:string, ticket:number}, divResult){
        const fixedFields = [
            {fieldName:"proyecto", value:params.proyecto},
            {fieldName:"ticket", value:params.ticket}
        ];
        const nuevoDiv = function(elemento:HTMLDivElement, className?:string){
            const nuevo = html.div({class:className??"w-ticket"}).create();
            elemento.appendChild(nuevo);
            return nuevo;
        }
        if (window.location.hash.includes('autoproced')) {
            myOwn.tableGrid("tickets1", nuevoDiv(divResult), {fixedFields})
            myOwn.tableGrid("tickets3", nuevoDiv(divResult), {fixedFields})
        }
        myOwn.tableGrid("tickets2", nuevoDiv(divResult), {fixedFields})
        myOwn.tableGrid("anotaciones", nuevoDiv(divResult,"w-aclaraciones"), {fixedFields})
        return 'ok'
    }
}

myOwn.wScreens.mis_verificaciones = {
    parameters:[
        {name: "username", typeName:"text"},
    ],
    mainAction: async function(params:{username:string}, divResult){
        const fixedFields = [
            {fieldName:"requirente", value:params.username, show:true},
            {fieldName:"estado", value:"a_verificar", show:true},
        ];
        const fixedFields2 = [
            {fieldName:"estado", value:"a_verificar", show:true},
        ];
        const nuevoDiv = function(elemento:HTMLDivElement, className?:string){
            const nuevo = html.div({class:className??"w-verificaciones"}).create();
            elemento.appendChild(nuevo);
            return nuevo;
        }
        myOwn.tableGrid("tickets", nuevoDiv(divResult), {fixedFields, tableDef: {title: "Tickets"}})
        myOwn.tableGrid("tickets_equipos_usuarios", nuevoDiv(divResult), {fixedFields: fixedFields2, tableDef: {title: "Tickets de mis colegas"}})
        return 'ok';
    }
}

myOwn.wScreens.mis_pendientes = {
    parameters:[
        {name: "username", typeName:"text"},
    ],
    mainAction: async function(params:{username:string}, divResult){
        const fixedFields = [
            {fieldName:"asignado_pendiente", value:params.username, show:true},
        ];
        const nuevoDiv = function(elemento:HTMLDivElement, className?:string){
            const nuevo = html.div({class:className??"w-verificaciones"}).create();
            elemento.appendChild(nuevo);
            return nuevo;
        }
        myOwn.tableGrid("tickets", nuevoDiv(divResult), {fixedFields, tableDef: {title: "Tickets"}})
        myOwn.tableGrid("tickets_pendientes", nuevoDiv(divResult), {tableDef: {title: "Tickets sin asignar"}})
        return 'ok'
    }
}

myOwn.wScreens.proyectos_inactivos = {
    parameters: [
        //{name: "username", typeName: "text"},
        {name: "proyecto", typeName: "text"},  // Nuevo parámetro para filtrar por proyecto
        {name: "ticket", typeName: "bigint"},  // Nuevo parámetro para filtrar por ticket
    ],
    mainAction: async function(params:{ proyecto: string, ticket: number}, divResult) {
        const fixedFields = [
            {fieldName: "proyectos_inactivos", value: params.proyecto, show: true},
            {fieldName:"ticket", value:params.ticket}
            
            //{fieldName: "asignado", value: params.username, show: true}, // Filtra por usuario asignado
        ];
        
     

        const nuevoDiv = function(elemento: HTMLDivElement, className?: string) {
            const nuevo = html.div({class: className ?? "w-proyectos-inactivos"}).create();
            elemento.appendChild(nuevo);
            return nuevo;
        };

        // Tabla de tickets de proyectos inactivos con los filtros aplicados
        myOwn.tableGrid("tickets", nuevoDiv(divResult), {fixedFields, tableDef: {title: "Tickets de Proyectos Inactivos"}});
        
        // Otra tabla si se necesitan detalles adicionales
        myOwn.tableGrid("tickets_proyectos_inactivos", nuevoDiv(divResult), {fixedFields});

        return "ok";
    }
};
