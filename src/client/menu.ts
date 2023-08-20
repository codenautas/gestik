"use strict";

import {DateTime, date} from "best-globals";
import {html} from "js-to-html"

function pretty(number:number):string{
    if (number == null) return '  0 '
    if (number < 10 ) return '  ' + number + ' '
    if (number < 100 ) return ' ' + number
    return ''+number
}

function labelSolapa(solapa:string, cant:number){
    return `${solapa}${pretty(cant)}`
}

myOwn.clientSides.nothing = {
    update: function(){},
    prepare: async function(){}
}

myOwn.clientSides.solapas = {
    update: function(depot, fieldName){
        var control = depot.rowControls[fieldName];
        var solapas_cant = depot.row.solapas_cant as {solapa:string, cant:number}[]
        solapas_cant.forEach(({solapa, cant}) => {
            var label = labelSolapa(solapa, cant)
            var button = control.buttons[solapa] as HTMLButtonElement
            button.textContent = label
        });
    },
    prepare: async function(depot, fieldName){
        var control = depot.rowControls[fieldName];
        var proyecto = depot.row.proyecto;
        var solapas_cant = depot.row.solapas_cant as {solapa:string, cant:number}[]
        var buttons: Record<string, HTMLButtonElement> = {}
        solapas_cant.forEach(({solapa, cant}) => {
            var ff = {estados__solapa: solapa, proyecto}
            var button = myOwn.createForkeableButton({w:'table', table:'tickets', ff}, {
                label: labelSolapa(solapa, cant), 
                onclick: (event)=>{
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
    var today = date.today()
    if (timestamp.toDmy() == today.toDmy()) {
        return html.span({class:'ts-time', title:timestamp.toLocaleString()}, [timestamp.toHm()])
    } else if (timestamp.getFullYear() == today.getFullYear()) {
        return html.span({class:'ts-sameyear', title:timestamp.toLocaleString()}, [timestamp.toDmy().replace(/[-\/]\d+$/,'')])
    } else {
        return html.span({class:'ts-otheryear', title:timestamp.toLocaleString()}, [timestamp.toDmy()])
    }
}

myOwn.clientSides.timestamp = {
    prepare: function(depot, fieldName){
        var control = depot.rowControls[fieldName];
        if (control.disabled) {
            var timestamp = depot.row[fieldName];
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
        var control = depot.rowControls.detalle;
        var img = control.getElementsByClassName('anot-img');
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
        var fixedFields = [
            {fieldName:"proyecto", value:params.proyecto},
            {fieldName:"ticket", value:params.ticket}
        ];
        var nuevoDiv = function(elemento:HTMLDivElement, className?:string){
            var nuevo = html.div({class:className??"w-ticket"}).create();
            elemento.appendChild(nuevo);
            return nuevo;
        }
        if (window.location.hash.includes('autoproced')) {
            myOwn.tableGrid("tickets1", nuevoDiv(divResult), {fixedFields})
            myOwn.tableGrid("tickets3", nuevoDiv(divResult), {fixedFields})
        }
        myOwn.tableGrid("tickets2", nuevoDiv(divResult), {fixedFields})
        myOwn.tableGrid("anotaciones", nuevoDiv(divResult,"w-aclaraciones"), {fixedFields})
    }
}