"use strict";

import {html} from "js-to-html";
import {sleep} from "best-globals";

var solapasRecordset:Promise<Record<string,any>[]> = sleep(2000).then(async ()=>{
    return myOwn.ajax.table_data({
        table:'solapas',
        fixedFields:[],
        paramfun:{}
    });    
})

myOwn.clientSides.solapas = {
    update: function(){},
    prepare: async function(depot, fieldName){
        var solapas = await solapasRecordset;
        var control = depot.rowControls[fieldName];
        var proyecto = depot.row.proyecto;
        solapas.forEach(({solapa}) => {
            var ff = {estados__solapa: solapa, proyecto}
            control.appendChild(myOwn.createForkeableButton({w:'table', table:'tickets', ff}, {
                label:solapa, onclick: function(event){
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
            }));
        })
    }
}
