import {html} from "js-to-html";

import "dialog-promise";

myOwn.clientSides.subirAdjunto = {
    prepare: function(depot:myOwn.Depot, fieldName:string){
        var botonCargarExcel = html.button('archivo').create();
        if (depot.row.archivo == null) {
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
                    campo:'archivo',
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
        let excelFileName=depot.row.archivo;
        if(excelFileName){
            td.appendChild(html.a({class:'link-descarga-archivo', href:`download/file?proyecto=${depot.row.proyecto}&ticket=${depot.row.ticket}&anotacion=${depot.row.anotacion}`, download:excelFileName},"archivo").create());            
        }
    },
    prepare:function(_depot:myOwn.Depot, _fieldName:string):void{
    }
}