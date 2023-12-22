import {html} from "js-to-html";

import * as likeAr from "like-ar";

import "dialog-promise";

var getSubirArchivoPathAndParams = (depot:myOwn.Depot) =>
    ({
        ajaxPath: 'archivo_subir',
        params: {
            proyecto:depot.row.proyecto,
            ticket:depot.row.ticket,
            anotacion:depot.row.anotacion,
        }
    })

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
                let {ajaxPath, params} = getSubirArchivoPathAndParams(depot);
                my.dialogUpload(
                    [ajaxPath], 
                    params,
                    function(result:any){
                        depot.rowControls.archivo.setTypedValue(result.nombre);
                        botonCargarExcel.disabled = true;
                        let grid = depot.manager;
                        grid.depotRefresh(depot,result.row);
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
        let grid = depot.manager;
        // @ts-ignore
        var botonCargarExcel:HTMLButtonElement = depot.botonCargarExcel;
        botonCargarExcel.disabled = depot.row.archivo != null || depot.row.anotacion == null;
        likeAr(depot.rowControls).forEach((control, _i)=>{
            control.onpaste = async function(e:ClipboardEvent){
                if (e.clipboardData) {
                    var items = e.clipboardData.items;
                    if (!items) return;
                    //access data directly
                    var is_image = false;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            //image
                            var blob = items[i].getAsFile()!;
                            var myImageDepot = depot;
                            var promiseChain = Promise.resolve();
                            if(depot.row.archivo){
                                promiseChain = promiseChain.then(async ()=>{
                                    await confirmPromise("la anotación ya contiene un adjunto, desea crear una nueva?")
                                    myImageDepot=grid.createRowInsertElements(null,depot);
                                    return
                                })
                            }
                            await promiseChain;
                            var {ajaxPath, params} = getSubirArchivoPathAndParams(myImageDepot);
                            var newFile = new File([blob], `pasted-${params.anotacion || '$$anotacion'}.${blob.name.split('.').pop()}`, {type: blob.type});
                            is_image = true;
                            var {row} = await my.ajax[ajaxPath]({
                                ...params,
                                anotacion: params.anotacion || null,
                                files: [newFile]
                            })
                            grid.depotRefresh(myImageDepot,{updatedRow:row, sendedForUpdate:{}},{noDispatchEvents:true});
                        }
                    }
                    if(is_image == true){
                        e.preventDefault();
                    }
                }
            }
        })
     
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
            td.appendChild(html.a({class:'link-descarga-archivo', href:`menu#w=ticket&autoproced=true&ff=,proyecto:${depot.row.proyecto_relacionado},ticket:${depot.row.ticket_relacionado}`},`${depot.row.proyecto_relacionado}-${depot.row.ticket_relacionado}`).create());            
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