import {html} from "js-to-html";

import * as likeAr from "like-ar";

import "dialog-promise";

const getSubirArchivoPathAndParams = (depot:myOwn.Depot) =>
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
        const botonCargarExcel = html.button('archivo').create();
        if (depot.row.archivo == null && depot.row.anotacion !== 0) {
            depot.rowControls[fieldName].appendChild(botonCargarExcel);
            if (depot.row.anotacion == null) botonCargarExcel.disabled = true;
            botonCargarExcel.addEventListener('click', async function(){
                const showWithMiniMenu = false;
                const messages = {
                    importDataFromFile: 'Seleccione un archivo',
                    import: 'Cargar'
                };
                const {ajaxPath, params} = getSubirArchivoPathAndParams(depot);
                my.dialogUpload(
                    [ajaxPath], 
                    params,
                    function(result:{nombre: string, message:string, row:Record<string, string>}){
                        depot.rowControls.archivo.setTypedValue(result.nombre);
                        botonCargarExcel.disabled = true;
                        const grid = depot.manager;
                        grid.depotRefresh(depot,result.row);
                        return result.message;
                    },
                    showWithMiniMenu,
                    messages
                )
            });
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        depot.botonCargarExcel = botonCargarExcel;
    },
    update: function(depot:myOwn.Depot){
        const grid = depot.manager;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const botonCargarExcel:HTMLButtonElement = depot.botonCargarExcel;
        botonCargarExcel.disabled = depot.row.archivo != null || depot.row.anotacion == null;
        likeAr(depot.rowControls).forEach((control, _i)=>{
            control.onpaste = async function(e:ClipboardEvent){
                if (e.clipboardData) {
                    const items = e.clipboardData.items;
                    if (!items) return;
                    //access data directly
                    let is_image = false;
                    for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            //image
                            const blob = items[i].getAsFile()!;
                            let myImageDepot = depot;
                            let promiseChain = Promise.resolve();
                            if(depot.row.archivo){
                                promiseChain = promiseChain.then(async ()=>{
                                    await confirmPromise("la anotación ya contiene un adjunto, desea crear una nueva?")
                                    myImageDepot=grid.createRowInsertElements(null,depot);
                                    return
                                })
                            }
                            await promiseChain;
                            const {ajaxPath, params} = getSubirArchivoPathAndParams(myImageDepot);
                            const newFile = new File([blob], `pasted-${params.anotacion || '$$anotacion'}.${blob.name.split('.').pop()}`, {type: blob.type});
                            is_image = true;
                            const {row} = await my.ajax[ajaxPath]({
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
        const td=depot.rowControls[fieldName];
        td.innerHTML='';
        if(depot.row.archivo){
            const fileParts = depot.row.archivo.split('/');
            const fileName = fileParts.pop();
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
        const td=depot.rowControls[fieldName];
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