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
                    var div = document.getElementById('sub-ticket-solapas') 
                    if (!div) {
                        div = html.div({id:'sub-ticket-solapas'}).create();
                        var main_layout = document.getElementById('main_layout')!;
                        main_layout.appendChild(div);
                    }
                    my.tableGrid('tickets', div, {fixedFields: [{fieldName:'estados__solapa', value:solapa}, {fieldName:'proyecto', value:proyecto}]});
                    event?.preventDefault();
                }
            }));
        })
    }
}
