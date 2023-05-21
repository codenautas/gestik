import {html} from "js-to-html";

import "dialog-promise";

myOwn.clientSides.subirAdjunto = {
    prepare: function(depot:myOwn.Depot, fieldName:string){
        var botonCargarExcel = html.button('excel').create();
        depot.rowControls[fieldName].appendChild(botonCargarExcel);
        botonCargarExcel.addEventListener('click', async function(){
            var showWithMiniMenu = false;
            var messages = {
                importDataFromFile: 'Seleccione un archivo',
                import: 'Cargar'
            };
            var ajaxPath = ['archivo_subir'];
            var params = {
                campo:'archivo',
                anotacion:depot.row.anotacion,
                ticket:depot.row.ticket,
            };
            my.dialogUpload(
                ajaxPath, 
                params,
                function(result:any){
                    depot.rowControls.archivo.setTypedValue(result.nombre, true);
                    return result.message;
                },
                showWithMiniMenu,
                messages
            )    
        });
        
    }
}

myOwn.clientSides.bajarAdjunto = {
    update:function(depot:myOwn.Depot, fieldName:string):void{
        let td=depot.rowControls[fieldName];
        td.innerHTML='';
        let excelFileName=depot.row.archivo;
        if(excelFileName){
            td.appendChild(html.a({class:'link-descarga-archivo', href:`download/file?name=${excelFileName}&anotacion=${depot.row.anotacion}&ticket=${depot.row.ticket}`, download:excelFileName},"excel").create());            
        }
    },
    prepare:function(_depot:myOwn.Depot, _fieldName:string):void{
    }
}