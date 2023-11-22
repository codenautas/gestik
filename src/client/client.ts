import {html} from "js-to-html";

import "dialog-promise";

myOwn.clientSides.subirAdjunto = {
    prepare: function(depot:myOwn.Depot, fieldName:string){
        var botonCargarExcel = html.button('archivo').create();
        if (depot.row.archivo == null && depot.row.anotacion !== 0) {
            depot.rowControls[fieldName].appendChild(botonCargarExcel);
            if (depot.row.anotacion == null) botonCargarExcel.disabled = true;
            botonCargarExcel.addEventListener('click', async function(){
                var showWithMiniMenu = false;
                var messages = {
                    importDataFromFile: 'Seleccione un archivo',
                    import: 'Cargar'
                };
                var ajaxPath = ['archivo_subir'];
                var params = {
                    proyecto:depot.row.proyecto,
                    ticket:depot.row.ticket,
                    anotacion:depot.row.anotacion,
                };
                my.dialogUpload(
                    ajaxPath, 
                    params,
                    function(result:any){
                        depot.rowControls.archivo.setTypedValue(result.nombre);
                        botonCargarExcel.disabled = true;
                        return result.message;
                    },
                    showWithMiniMenu,
                    messages
                )    
            });
        }
        // @ts-ignore
        depot.botonCargarExcel = botonCargarExcel;
    },
    update: function(depot:myOwn.Depot){
        // @ts-ignore
        var botonCargarExcel:HTMLButtonElement = depot.botonCargarExcel;
        botonCargarExcel.disabled = depot.row.archivo != null || depot.row.anotacion == null;
    }
}

myOwn.clientSides.bajarAdjunto = {
    update:function(depot:myOwn.Depot, fieldName:string):void{
        let td=depot.rowControls[fieldName];
        td.innerHTML='';
        if(depot.row.archivo){
            let fileParts = depot.row.archivo.split('/');
            let fileName = fileParts.pop();
            if(fileName){
                td.appendChild(html.a({class:'link-descarga-archivo', href:`download/file?proyecto=${depot.row.proyecto}&ticket=${depot.row.ticket}&anotacion=${depot.row.anotacion}`, download:fileName},"archivo").create());            
            }
        }
    },
    prepare:function(_depot:myOwn.Depot, _fieldName:string):void{
    }
}

myOwn.clientSides.link_a_ticket = {
    update:function(depot:myOwn.Depot, fieldName:string):void{
        let td=depot.rowControls[fieldName];
        td.innerHTML='';
        if(depot.row.proyecto_relacionado && depot.row.ticket_relacionado){
            td.appendChild(html.a({class:'link-descarga-archivo', href:`menu#w=ticket&autoproced=true&ff=,proyecto:${depot.row.proyecto_relacionado},ticket:${depot.row.ticket_relacionado}`},`${depot.row.proyecto_relacionado}#${depot.row.ticket_relacionado}`).create());            
        }
    },
    prepare:function(_depot:myOwn.Depot, _fieldName:string):void{
    }
}

myOwn.wScreens.proc.result.cambiar_proyecto_ticket=function(result, divResult:HTMLDivElement){ 
    divResult.appendChild(
        html.div({class: 'result-div', style: 'background-color: orange;'}, result.message).create()
    )
}