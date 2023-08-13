"use strict";

import {html} from "js-to-html";

function pretty(number:number):string{
    if (number == null) return '  0 '
    if (number < 10 ) return '  ' + number + ' '
    if (number < 100 ) return ' ' + number
    return ''+number
}

function labelSolapa(solapa:string, cant:number){
    return `${solapa}${pretty(cant)}`
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
                onclick: function(event){
                    // @ts-ignore
                    if (event.ctrlKey) return
                    var div = document.getElementById('sub-ticket-solapas') 
                    if (!div) {
                        div = html.div({id:'sub-ticket-solapas'}).create();
                        var main_layout = document.getElementById('main_layout')!;
                        main_layout.appendChild(div);
                    }
                    my.tableGrid('tickets', div, {fixedFields: [{fieldName:'estados__solapa', value:solapa}, {fieldName:'proyecto', value:proyecto}]});
                    var grid = depot.manager;
                    if (grid.depots.length > 1) {
                        if (!grid.view.filter?.length) {
                            grid.view.filter=[grid.createRowFilter(0,[{column:'proyecto', operator:'=', value:proyecto}])];
                        } else {
                            grid.view.filter[0].row.proyecto = proyecto
                            grid.view.filter[0].rowControls.proyecto.setTypedValue(proyecto, false);
                        }
                        grid.updateFilterInfo(' (F) ');
                        grid.displayBody();
                    }
                    event?.preventDefault();
                }
            });
            control.appendChild(button);
            buttons[solapa] = button;
        })
        control.buttons = buttons;
    }
}
