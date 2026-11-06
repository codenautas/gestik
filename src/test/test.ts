"use strict";

import { AppGestik, borrarArchivosPendientes } from '../server/app-gestik';
import * as fs from 'fs-extra';
// import * as MiniTools from 'mini-tools';
import * as discrepances from 'discrepances';
import { before } from 'mocha';

import { date } from "best-globals";

import { AppBackendConstructor, Contexts, EmulatedSession, startBackendAPIContext, startNavigatorContext } from "serial-tester";

import { expected } from "cast-error";

import * as ctts from "./contracts.js";

import { nombreAdjuntoSeguro, rutaAdjunto } from '../server/adjuntos';

// const PORT = 3333;

const ADMIN_REQ = {user:{usuario:'bob', rol:''}};

// para pruebas directas contra la base, con un usuario que pase las políticas
const AUTOTEST_ADMIN_REQ = {user:{usuario:'autotest-administrador', rol:'admin'}};

async function expectBackendError(action: () => Promise<unknown>, message: RegExp){
    try {
        await action();
    } catch (err) {
        const error = expected(err);
        if (!message.test(error.message)) throw error;
        return;
    }
    throw new Error(`se esperaba un error que coincida con ${message}`);
}

function pick<T extends object, K extends keyof T>(row: T, fields: K[]): Record<K, unknown>{
    return Object.fromEntries(fields.map(f => [f, row[f]])) as Record<K, unknown>;
}

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
        it("rechaza la edición de la tabla archivos_borrar", async function(){
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
        it("la visibilidad de tickets depende de que su equipo esté en el proyecto", async function(){
            // no ve PROYECTO2-autotest ticket 1 aunque es su requirente, porque su equipo no está en PROYECTO2-autotest
            await session.tableDataTest("tickets", [
                {ticket: 1, proyecto: 'PROYECTO1-autotest'},
                {ticket: 2, proyecto: 'PROYECTO1-autotest'},
                {ticket: 3, proyecto: 'PROYECTO1-autotest'},
                {ticket: 4, proyecto: 'PROYECTO1-autotest'},
            ],'all',{fixedFields:{tema:'prueba visibilidad'}});
        })
        it("no puede cargar tickets si su equipo no es requirente ni asignado", async function(){
            await expectBackendError(
                () => session.saveRecord(ctts.tickets, {proyecto: 'INTERNO-autotest', asunto:'no debería poder'}, 'new'),
                /pol[ií]tica de seguridad|row-level security/
            );
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

    async function nuevaSesion(username: string){
        const session = serverContext.createSession();
        await session.login({username, password: 'clave1234'});
        return session;
    }

    describe("equipo de solo lectura (auditores)", function(){
        var auditor: EmulatedGestikSession;        // eslint-disable-line no-var
        var auditorDesa: EmulatedGestikSession;    // eslint-disable-line no-var
        before(async function(){
            auditor = await nuevaSesion('autotest-auditor');
            auditorDesa = await nuevaSesion('autotest-auditor-desa');
        })
        it("ve todos los tickets del proyecto", async function(){
            await auditor.tableDataTest("tickets", [
                {ticket: 1},
                {ticket: 2},
                {ticket: 3},
                {ticket: 4},
            ],'all',{fixedFields:{proyecto: 'PROYECTO1-autotest', tema:'prueba visibilidad'}});
        })
        it("no puede cargar tickets", async function(){
            await expectBackendError(
                () => auditor.saveRecord(ctts.tickets, {proyecto: 'PROYECTO1-autotest', asunto:'no debería poder (autotest)'}, 'new'),
                /pol[ií]tica de seguridad|row-level security/
            );
        })
        it("no puede modificar tickets", async function(){
            await expectBackendError(
                () => auditor.saveRecord(ctts.tickets, {asunto:'modificado por auditor'}, 'update', ['PROYECTO1-autotest', 1]),
                /.+/
            );
            await auditor.tableDataTest("tickets", [
                {ticket: 1, asunto: 'ticket nuevo'},
            ],'all',{fixedFields:{proyecto: 'PROYECTO1-autotest', ticket: 1}});
        })
        it("no puede anotar", async function(){
            await expectBackendError(
                () => auditor.saveRecord(ctts.anotaciones, {proyecto: 'PROYECTO1-autotest', ticket: 1, detalle: 'no debería poder'}, 'new'),
                /pol[ií]tica de seguridad|row-level security/
            );
        })
        it("puede anotar si además pertenece a un equipo con permiso de escritura", async function(){
            const row = await auditorDesa.saveRecord(ctts.anotaciones, {proyecto: 'PROYECTO1-autotest', ticket: 1, detalle: 'anotación de auditor que es desarrollador'}, 'new');
            discrepances.showAndThrow(pick(row, ['usuario']), {usuario: 'autotest-auditor-desa'});
        })
        it("puede cargar tickets si además pertenece a un equipo con permiso de escritura", async function(){
            const row = await auditorDesa.saveRecord(ctts.tickets, {proyecto: 'PROYECTO1-autotest', asunto:'ticket de auditor que es desarrollador (autotest)'}, 'new');
            discrepances.showAndThrow(pick(row, ['proyecto', 'requirente']), {proyecto: 'PROYECTO1-autotest', requirente: 'autotest-auditor-desa'});
        })
    })

    describe("numeración de tickets", function(){
        var session: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            session = await nuevaSesion('autotest-administrador');
        })
        it("numera correlativamente dentro de cada proyecto", async function(){
            const primero = await session.saveRecord(ctts.tickets, {proyecto: 'GENERAL-autotest', asunto:'primero de GENERAL (autotest)'}, 'new');
            const segundo = await session.saveRecord(ctts.tickets, {proyecto: 'GENERAL-autotest', asunto:'segundo de GENERAL (autotest)'}, 'new');
            discrepances.showAndThrow([primero.ticket, segundo.ticket], [1, 2], {autoTypeCast: true});
        })
        it("toma tipo y estado de parametros cuando no se informan", async function(){
            const row = await session.saveRecord(ctts.tickets, {proyecto: 'GENERAL-autotest', asunto:'con valores por defecto (autotest)'}, 'new');
            discrepances.showAndThrow(pick(row, ['tipo_ticket', 'estado', 'requirente']), {
                tipo_ticket: 'tarea',
                estado: 'nuevo',
                requirente: 'autotest-administrador',
            });
        })
    })

    describe("proyectos cerrados", function(){
        var session: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            session = await nuevaSesion('autotest-administrador');
        })
        it("no permite cargar tickets", async function(){
            await expectBackendError(
                () => session.saveRecord(ctts.tickets, {proyecto: 'CERRADO-autotest', asunto:'no debería poder (autotest)'}, 'new'),
                /No se pueden insertar tickets en proyectos cerrados/
            );
        })
        it("no permite modificar tickets", async function(){
            await expectBackendError(
                () => session.saveRecord(ctts.tickets, {asunto:'modificado'}, 'update', ['CERRADO-autotest', 1]),
                /No se pueden actualizar tickets de proyectos cerrados/
            );
        })
        it("no permite mover un ticket hacia un proyecto cerrado", async function(){
            await expectBackendError(
                () => session.callProcedure(ctts.cambiar_proyecto, {del_proyecto: 'PROYECTO1-autotest', el_ticket: 1, al_proyecto: 'CERRADO-autotest'}),
                /No se pueden actualizar tickets de proyectos cerrados/
            );
        })
        it("no permite borrar tickets", async function(){
            await expectBackendError(
                () => server.inDbClient(AUTOTEST_ADMIN_REQ, (client) =>
                    client.query("DELETE FROM tickets WHERE proyecto = 'CERRADO-autotest' AND ticket = 1").execute()
                ),
                /No se pueden eliminar tickets de proyectos cerrados/
            );
        })
    })

    describe("registro automático de fechas al cambiar de estado", function(){
        var session: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            session = await nuevaSesion('autotest-administrador');
        })
        it("registra f_inicio al pasar a en_proceso y f_realizacion al pasar a a_verificar", async function(){
            const {ticket} = await session.saveRecord(ctts.tickets_fechas, {proyecto: 'INTERNO-autotest', asunto:'fechas automáticas (autotest)'}, 'new');
            const enProceso = await session.saveRecord(ctts.tickets_fechas, {estado: 'en_proceso'}, 'update', ['INTERNO-autotest', ticket]);
            discrepances.showAndThrow(pick(enProceso, ['f_inicio', 'f_realizacion']), {f_inicio: today, f_realizacion: null}, {autoTypeCast: true});
            const aVerificar = await session.saveRecord(ctts.tickets_fechas, {estado: 'a_verificar'}, 'update', ['INTERNO-autotest', ticket]);
            discrepances.showAndThrow(pick(aVerificar, ['f_inicio', 'f_realizacion']), {f_inicio: today, f_realizacion: today}, {autoTypeCast: true});
        })
        it("no pisa una fecha ya cargada", async function(){
            const fechaCargada = date.iso('2026-01-15');
            const {ticket} = await session.saveRecord(ctts.tickets_fechas, {proyecto: 'INTERNO-autotest', asunto:'fecha previa (autotest)', f_inicio: fechaCargada}, 'new');
            const row = await session.saveRecord(ctts.tickets_fechas, {estado: 'en_proceso'}, 'update', ['INTERNO-autotest', ticket]);
            discrepances.showAndThrow(pick(row, ['f_inicio']), {f_inicio: fechaCargada}, {autoTypeCast: true});
        })
        it("no registra fechas si el estado no cambia", async function(){
            const {ticket} = await session.saveRecord(ctts.tickets_fechas, {proyecto: 'INTERNO-autotest', asunto:'sin cambio de estado (autotest)'}, 'new');
            const row = await session.saveRecord(ctts.tickets_fechas, {descripcion: 'solo cambia la descripción'}, 'update', ['INTERNO-autotest', ticket]);
            discrepances.showAndThrow(pick(row, ['f_inicio', 'f_realizacion']), {f_inicio: null, f_realizacion: null}, {autoTypeCast: true});
        })
    })

    describe("cambiar de proyecto", function(){
        var admin: EmulatedGestikSession;          // eslint-disable-line no-var
        var usuario: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            admin = await nuevaSesion('autotest-administrador');
            usuario = await nuevaSesion('autotest-usuario');
        })
        it("el administrador mueve un ticket y recibe el siguiente número del proyecto destino", async function(){
            const asunto = 'para mover de proyecto (autotest)';
            const {ticket} = await admin.saveRecord(ctts.tickets, {proyecto: 'INTERNO-autotest', asunto}, 'new');
            const mensaje = await admin.callProcedure(ctts.cambiar_proyecto, {del_proyecto: 'INTERNO-autotest', el_ticket: ticket!, al_proyecto: 'PROYECTO2-autotest'});
            const nuevoNumero = Number(mensaje.match(/se cambió a "PROYECTO2-autotest-(\d+)"/)?.[1]);
            await admin.tableDataTest('tickets', [{asunto}], 'all', {fixedFields:{proyecto: 'PROYECTO2-autotest', ticket: nuevoNumero}});
            await admin.tableDataTest('tickets', [], 'all', {fixedFields:{proyecto: 'INTERNO-autotest', ticket: ticket!}});
        })
        it("rechaza mover al mismo proyecto", async function(){
            await expectBackendError(
                () => admin.callProcedure(ctts.cambiar_proyecto, {del_proyecto: 'PROYECTO1-autotest', el_ticket: 1, al_proyecto: 'PROYECTO1-autotest'}),
                /Tiene que espeficar dos proyectos distintos/
            );
        })
        it("rechaza un ticket inexistente", async function(){
            await expectBackendError(
                () => admin.callProcedure(ctts.cambiar_proyecto, {del_proyecto: 'PROYECTO1-autotest', el_ticket: 9999, al_proyecto: 'PROYECTO2-autotest'}),
                /No se encuentra el ticket "PROYECTO1-autotest-9999"/
            );
        })
        it("un usuario no puede mover a un proyecto donde su equipo no es requirente", async function(){
            await expectBackendError(
                () => usuario.callProcedure(ctts.cambiar_proyecto, {del_proyecto: 'PROYECTO1-autotest', el_ticket: 1, al_proyecto: 'PROYECTO2-autotest'}),
                /El usuario no esta en un equipo que pueda hacer requerimientos en el proyecto "PROYECTO2-autotest"/
            );
        })
    })

    describe("anotaciones", function(){
        var admin: EmulatedGestikSession;          // eslint-disable-line no-var
        var usuario: EmulatedGestikSession;        // eslint-disable-line no-var
        before(async function(){
            admin = await nuevaSesion('autotest-administrador');
            usuario = await nuevaSesion('autotest-usuario');
        })
        it("numera las anotaciones dentro de cada ticket y registra el usuario", async function(){
            const primera = await admin.saveRecord(ctts.anotaciones, {proyecto: 'PROYECTO1-autotest', ticket: 2, detalle: 'primera anotación'}, 'new');
            const segunda = await admin.saveRecord(ctts.anotaciones, {proyecto: 'PROYECTO1-autotest', ticket: 2, detalle: 'segunda anotación'}, 'new');
            discrepances.showAndThrow(
                [pick(primera, ['anotacion', 'usuario']), pick(segunda, ['anotacion', 'usuario'])],
                [{anotacion: 1, usuario: 'autotest-administrador'}, {anotacion: 2, usuario: 'autotest-administrador'}],
                {autoTypeCast: true}
            );
        })
        it("exige informar juntos el proyecto y el ticket relacionados", async function(){
            await expectBackendError(
                () => admin.saveRecord(ctts.anotaciones, {proyecto: 'PROYECTO1-autotest', ticket: 2, detalle: 'link incompleto', proyecto_relacionado: 'PROYECTO2-autotest'}, 'new'),
                /ticket_relacionado/
            );
        })
        it("un usuario puede anotar en un proyecto donde su equipo es requirente", async function(){
            const row = await usuario.saveRecord(ctts.anotaciones, {proyecto: 'PROYECTO1-autotest', ticket: 1, detalle: 'anotación del usuario'}, 'new');
            discrepances.showAndThrow(pick(row, ['usuario']), {usuario: 'autotest-usuario'});
        })
        it("un usuario no puede anotar en un proyecto donde su equipo no es requirente ni asignado", async function(){
            // PROYECTO2-autotest ticket 1 tiene a autotest-usuario como requirente, pero su equipo no está en el proyecto
            await expectBackendError(
                () => usuario.saveRecord(ctts.anotaciones, {proyecto: 'PROYECTO2-autotest', ticket: 1, detalle: 'no debería poder'}, 'new'),
                /pol[ií]tica de seguridad|row-level security/
            );
        })
        it("un usuario no ve anotaciones de proyectos donde su equipo no está", async function(){
            const procesador = await nuevaSesion('autotest-procesador');
            await procesador.tableDataTest('anotaciones', [], 'all', {fixedFields:{proyecto: 'PROYECTO1-autotest', ticket: 2}});
        })
        it("al borrar una anotación con adjunto encola el archivo en archivos_borrar", async function(){
            const archivo = 'adjunto-autotest-para-borrar.txt';
            await server.inDbClient(AUTOTEST_ADMIN_REQ, async (client) => {
                const {value: anotacion} = await client.query(
                    `INSERT INTO anotaciones (proyecto, ticket, usuario, detalle, archivo) VALUES ($1, $2, $3, $4, $5) RETURNING anotacion`,
                    ['PROYECTO1-autotest', 2, 'autotest-administrador', 'con adjunto (autotest)', archivo]
                ).fetchUniqueValue();
                await client.query(
                    `DELETE FROM anotaciones WHERE proyecto = $1 AND ticket = $2 AND anotacion = $3`,
                    ['PROYECTO1-autotest', 2, anotacion]
                ).execute();
                const {rows} = await client.query(`SELECT ruta_archivo FROM archivos_borrar WHERE ruta_archivo = $1`, [archivo]).fetchAll();
                discrepances.showAndThrow(rows, [{ruta_archivo: archivo}]);
            });
        })
        it("el mantenimiento borra del disco los archivos encolados y vacía la cola", async function(){
            const archivo = 'adjunto-autotest-cron.txt';
            const path = rutaAdjunto(archivo);
            await fs.outputFile(path, 'para borrar (autotest)');
            await server.inDbClient(AUTOTEST_ADMIN_REQ, (client) =>
                client.query(`INSERT INTO archivos_borrar (ruta_archivo) VALUES ($1)`, [archivo]).execute()
            );
            await borrarArchivosPendientes(server);
            discrepances.showAndThrow(await fs.pathExists(path), false);
            await server.inDbClient(AUTOTEST_ADMIN_REQ, async (client) => {
                const {rows} = await client.query(`SELECT ruta_archivo FROM archivos_borrar`).fetchAll();
                discrepances.showAndThrow(rows, []);
            });
        })
        it("el mantenimiento no borra archivos fuera de la carpeta de adjuntos", async function(){
            const archivo = '../autotest-fuera-de-adjuntos.txt';
            const path = 'autotest-fuera-de-adjuntos.txt';
            await fs.outputFile(path, 'no se tiene que borrar (autotest)');
            try {
                await server.inDbClient(AUTOTEST_ADMIN_REQ, (client) =>
                    client.query(`INSERT INTO archivos_borrar (ruta_archivo) VALUES ($1)`, [archivo]).execute()
                );
                await borrarArchivosPendientes(server);
                discrepances.showAndThrow(await fs.pathExists(path), true);
                await server.inDbClient(AUTOTEST_ADMIN_REQ, async (client) => {
                    const {rows} = await client.query(`SELECT ruta_archivo FROM archivos_borrar`).fetchAll();
                    discrepances.showAndThrow(rows, []);
                });
            } finally {
                await fs.remove(path);
            }
        })
    })
}));

describe("nombres de adjuntos", function(){
    it("se queda solo con el nombre del archivo que manda el cliente", function(){
        discrepances.showAndThrow(
            ['informe.pdf', '../../dist/server/app-gestik.js', 'C:\\temp\\..\\informe.pdf', '/etc/passwd'].map(nombreAdjuntoSeguro),
            ['informe.pdf', 'app-gestik.js', 'informe.pdf', 'passwd']
        );
    })
    it("rechaza nombres vacíos o que son solo carpetas", function(){
        for (const nombre of ['', '..', 'a/..', 'a/', '.']) {
            let error: Error|null = null;
            try { nombreAdjuntoSeguro(nombre) } catch (err) { error = expected(err) }
            if (!error?.message.match(/Nombre de archivo inválido/)) throw new Error(`debería rechazar ${JSON.stringify(nombre)}`);
        }
    })
    it("rechaza rutas que salen de la carpeta de adjuntos", function(){
        rutaAdjunto('adjunto-gestik-1-informe.pdf');
        for (const archivo of ['adjunto-gestik-5-/../../dist/server/app-gestik.js', '../local-config.yaml', '..', '']) {
            let error: Error|null = null;
            try { rutaAdjunto(archivo) } catch (err) { error = expected(err) }
            if (!error?.message.match(/Ruta de adjunto fuera de/)) throw new Error(`debería rechazar ${JSON.stringify(archivo)}`);
        }
    })
})
