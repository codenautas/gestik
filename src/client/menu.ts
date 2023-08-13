"use strict";

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
                        depot.detailControls.tickets.displayDetailGrid({})
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
