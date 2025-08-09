"use strict";

import { AppGestik } from '../server/app-gestik';
// import * as MiniTools from 'mini-tools';
import * as discrepances from 'discrepances';

import { date } from "best-globals";

import { AppBackendConstructor, Contexts, EmulatedSession, startBackendAPIContext, startNavigatorContext } from "serial-tester";

import { expected } from "cast-error";

import * as ctts from "./contracts.js";

// const PORT = 3333;

const ADMIN_REQ = {user:{usuario:'bob', rol:''}};

const TEST_BACKEND_VIA_API = {
    name: "via api",
    startContext: startBackendAPIContext
}

type EmulatedGestikSession = EmulatedSession<AppGestik>;


const TEST_VIA_CHROMIUM = {
    name: "via chromium",
    startContext: (app:AppBackendConstructor<AppGestik>) => startNavigatorContext(app, {
        browserType: 'chromium',
        headless: false,
        slowMo: 100
    }),
}

console.log(TEST_BACKEND_VIA_API, TEST_VIA_CHROMIUM);

var testIn = [
    TEST_BACKEND_VIA_API,
    // TEST_VIA_CHROMIUM,
];

var backendsAUsar = testIn.length;
testIn.forEach(t => describe("gestik tests " + t.name, function(){
    // se necesitan *var* porque se inicializa en la función before
    var server: AppGestik;    // eslint-disable-line no-var
    var serverContext: Contexts<AppGestik>;
    before(async function(){
        this.timeout(4000);
        serverContext = await t.startContext(AppGestik);
        server = serverContext.backend;
        await server.inDbClient(ADMIN_REQ, async (client) => {
            // limpia la base de datos
            await client.executeSentences([
                // "CALL set_app_user('bob')",
                "DELETE FROM archivos_borrar WHERE ruta_archivo like '%autotest%'",
                "DELETE FROM equipos_proyectos WHERE equipo like '%autotest-agregado%'",
                "DELETE FROM equipos WHERE equipo like '%autotest-agregado%'",
                "DELETE FROM tickets WHERE proyecto like '%autotest-agregado%' OR asunto like '%autotest%'",
            ]);
        });
    });

    after(async function(){
        this.timeout(10000);
        await server.shutdownBackend({skipTurnOff: !!--backendsAUsar});
        console.log('server down!');
        server = null as unknown as AppGestik;
        await new Promise((resolve) => setTimeout(resolve, 100 + 5000));
        console.log();
    })

    describe("not connected", function(){
        var session: EmulatedGestikSession;        // eslint-disable-line no-var
        before(function(){
            session = serverContext.createSession();
        })
        it("rechaza passowrd invalido", async function(){
            const result = await session.login({
                username: 'autotest-inactivo',
                password: 'clave4321',
            }, {returnErrorMessage: true});
            discrepances.showAndThrow(result, "usuario o clave incorrecta");
        });
        it("rechaza usuario inactivo con password correcto", async function(){
            const result = await session.login({
                username: 'autotest-inactivo',
                password: 'clave1234',
            }, {returnErrorMessage: true});
            discrepances.showAndThrow(result, "el usuario está marcado como inactivo");
        });
        it("acepta usuario", async function(){
            await session.login({
                username: 'autotest-desarrollador',
                password: 'clave1234',
            });
        });
    });

    var today = date.today(); // eslint-disable-line no-var

    const dolarFieldsTrue = {
        "$allow.update": true,
        "$allow.delete": true,
    }
    
    describe("usuario administrador", function(){
        var session: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            session = serverContext.createSession();
            await session.login({
                username: 'autotest-administrador',
                password: 'clave1234',
            });
        })
        it("determina es_general en el proyecto general agrega un equipo y verifica la asignación", async function(){
            // quita es_general
            await session.saveRecord(ctts.proyectos, {proyecto: 'GENERAL', es_general:false}, 'update');
            // agrega un equipo
            await session.saveRecord(ctts.equipos, {equipo: 'autotest-agregado'}, 'new');
            // verifica que no se haya generado automáticamente una entrada en GENERAL-autotest para el equipo nuevo.
            await session.tableDataTest("equipos_proyectos", [
            ],'all',{fixedFields:{proyecto: 'GENERAL', equipo: 'autotest-agregado'}})
            // pone es_general
            await session.saveRecord(ctts.proyectos, {proyecto: 'GENERAL', es_general:true}, 'update');
            // agrega un equipo nuevo
            await session.saveRecord(ctts.equipos, {equipo: 'autotest-agregado2'}, 'new');
            // verifica que se haya generado automáticamente una entrada en GENERAL-autotest para el equipo nuevo.
            await session.tableDataTest("equipos_proyectos", [
                {proyecto: 'GENERAL', equipo: 'autotest-agregado2'}
            ],'all',{fixedFields:{proyecto: 'GENERAL', equipo: 'autotest-agregado2'}})
        })
        it.skip("rechaza la edición de la tabla archivos_borrar", async function(){
            try {
                await session.saveRecord(ctts.archivos_borrar, {ruta_archivo: 'cualquier_dato_autotest'}, 'new');
                throw new Error("debería fallar porque no tendría que tener permisos para agregar")
            } catch (err) {
                const error = expected(err);
                if (!error.message.match(/insert not allowed|inserción no permitida/)) throw error;
            }
        })
    });


    describe("usuario desarrollador", function(){
        var session: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            session = serverContext.createSession();
            await session.login({
                username: 'autotest-desarrollador',
                password: 'clave1234',
            });
        })
        it("carga el ticket número 1", async function(){
            const row = await session.saveRecord(ctts.tickets, {proyecto: 'INTERNO-autotest', asunto:'terminar de escribir los tests (autotest)'}, 'new');
            // verifica el número de ticket y otros valores por defecto
            discrepances.showAndThrow(row, {
                proyecto: 'INTERNO-autotest', 
                ticket: 1, 
                tipo_ticket: 'tarea',
                asunto: 'terminar de escribir los tests (autotest)',
                requirente: 'autotest-desarrollador',
                estado: 'nuevo',
                f_ticket: today,
                estados__solapa: 'nuevos',
                ...dolarFieldsTrue
            }, {notMemberAsUndefined: true, autoTypeCast: true});
        })
        it("la visibilidad de tickets depende pertenecer a un equipo asignado", async function(){
            await session.tableDataTest("tickets", [
                {ticket: 1},
                {ticket: 2},
                {ticket: 3},
                {ticket: 4},
            ],'all',{fixedFields:{proyecto: 'PROYECTO1-autotest', tema:'prueba visibilidad'}});
        })
    })
    describe("usuario usuario", function(){
        var session: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            session = serverContext.createSession();
            await session.login({
                username: 'autotest-usuario',
                password: 'clave1234',
            });
        })
        it("la visibilidad de tickets depende de ser requirente", async function(){
            await session.tableDataTest("tickets", [
                {ticket: 1, proyecto: 'PROYECTO1-autotest'},
                {ticket: 2, proyecto: 'PROYECTO1-autotest'},
                {ticket: 3, proyecto: 'PROYECTO1-autotest'},
                {ticket: 4, proyecto: 'PROYECTO1-autotest'},
                {ticket: 1, proyecto: 'PROYECTO2-autotest'},
            ],'all',{fixedFields:{tema:'prueba visibilidad'}});
        })
        it.skip("no puede cargar tickets si no es_requirente", async function(){
            let error: Error|null = null;
            try {
                await session.saveRecord(ctts.tickets, {proyecto: 'INTERNO-autotest', asunto:'no debería poder'}, 'new');
            } catch (err) {
                error = expected(err);
            }
            // verifica que se lance un error
            discrepances.showAndThrow(error, new Error("Backend error: el nuevo registro viola la política de seguridad de registros «debe ser del equipo requirente» para la tabla «tickets»"));
        })
        it("puede cargar tickets si es_requirente", async function(){
            const row = await session.saveRecord(ctts.tickets, {proyecto: 'PROYECTO1-autotest', asunto:'ticket nuevo de usuario (autotest)'}, 'new');
            // verifica el número de ticket y otros valores por defecto
            discrepances.showAndThrow(row, {
                proyecto: 'PROYECTO1-autotest', 
                ticket: 5, 
                tipo_ticket: 'tarea',
                asunto: 'ticket nuevo de usuario (autotest)',
                requirente: 'autotest-usuario',
                estado: 'nuevo',
                f_ticket: today,
                estados__solapa: 'nuevos',
                ...dolarFieldsTrue
            }, {notMemberAsUndefined: true, autoTypeCast: true});
        })
        it("ve solo los proyectos relacionados", async function(){
            await session.tableDataTest('proyectos', [
                {proyecto: 'PROYECTO1-autotest'}
            ], 'all');
        })
    })
}));
