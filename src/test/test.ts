"use strict";

import { AppGestik } from '../server/app-gestik';
// import * as MiniTools from 'mini-tools';
import * as discrepances from 'discrepances';

import { is } from "guarantee-type";

import { date } from "best-globals";

import { startServer, Session } from "backend-tester";

import { expected } from "cast-error";
// import { unexpected } from 'cast-error';

describe("gestik tests", function(){
    // se necesitan *var* porque se inicializa en la función before
    var server: AppGestik;    // eslint-disable-line no-var
    before(async function(){
        this.timeout(4000);
        server = await startServer(new AppGestik());
    });

    after(async function(){
        this.timeout(10000);
        await server.shutdownBackend()
        console.log('server down!');
        server = null as unknown as AppGestik;
        const pepe = setTimeout(function(){
            console.log(100)
        },100);
        console.log(pepe);
    })

    describe("not connected", function(){
        var session: Session<AppGestik>;        // eslint-disable-line no-var
        before(function(){
            session = new Session(server);
        })
        it("rechaza passowrd invalido", async function(){
            const result = await session.login({
                username: 'autotest-inactivo',
                password: 'clave4321',
            });
            discrepances.showAndThrow(result, {message:"usuario o clave incorrecta"});
        });
        it("rechaza usuario inactivo con passowrd correcto", async function(){
            const result = await session.login({
                username: 'autotest-inactivo',
                password: 'clave1234',
            });
            discrepances.showAndThrow(result, {message:"el usuario está marcado como inactivo"});
        });
        it("acepta usuario", async function(){
            const result = await session.login({
                username: 'autotest-desarrollador',
                password: 'clave1234',
            });
            discrepances.showAndThrow(!!result.ok, true);
        });
    });

    var today = date.today(); // eslint-disable-line no-var

    const dolarFieldsDescription = {
        "$allow.update": is.boolean,
        "$allow.delete": is.boolean
    }

    const dolarFieldsTrue = {
        "$allow.update": true,
        "$allow.delete": true,
    }
    
    const tipoTicket = is.object({
        proyecto: is.string,
        ticket: is.number,
        tipo_ticket: is.string,
        asunto: is.string,
        requirente: is.string,
        estado: is.string,
        f_ticket: is.Date,
        estados__solapa: is.string,
        ...dolarFieldsDescription
    });

    const tipoProyecto = is.object({
        proyecto: is.string,
        es_general: is.boolean,
        solapas_cant: is.optional.object({})
    })

    const tipoEquipo = is.object({
        equipo: is.string
    })

    const tipoArchivosBorrar = is.object({
        ruta_archivo: is.string
    })

    describe("usuario administrador", function(){
        var session: Session<AppGestik>;        // eslint-disable-line no-var
        before(async function(){
            session = new Session(server);
            await session.login({
                username: 'autotest-administrador',
                password: 'clave1234',
            });
        })
        it("determina es_general en el proyecto general agrega un equipo y verifica la asignación", async function(){
            // quita es_general
            await session.saveRecord('proyectos', {proyecto: 'GENERAL-autotest', es_general:false}, tipoProyecto, 'update');
            // agrega un equipo 
            await session.saveRecord('equipos', {equipo: 'autotest-agregado'}, tipoEquipo, 'new');
            // verifica que no se haya generado automáticamente una entrada en GENERAL-autotest para el equipo nuevo.
            await session.tableData("equipos_proyectos", [
            ],'all',{fixedFields:{proyecto: 'GENERAL-autotest', equipo: 'autotest-agregado'}})
            // pone es_general
            await session.saveRecord('proyectos', {proyecto: 'GENERAL-autotest', es_general:true}, tipoProyecto, 'update');
            // agrega un equipo nuevo
            await session.saveRecord('equipos', {equipo: 'autotest-nuevo'}, tipoEquipo, 'new');
            // verifica que se haya generado automáticamente una entrada en GENERAL-autotest para el equipo nuevo.
            await session.tableData("equipos_proyectos", [
                {proyecto: 'GENERAL-autotest', equipo: 'autotest-nuevo'}
            ],'all',{fixedFields:{proyecto: 'GENERAL-autotest', equipo: 'autotest-nuevo'}})
        })
        it("rechaza la edición de la tabla archivos_borrar", async function(){
            try {
                await session.saveRecord('archivos_borrar', {ruta_archivo: 'cualquier_dato'}, tipoArchivosBorrar, 'new');
                throw new Error("debería fallar porque no tendría que tener permisos para agregar")
            } catch (err) {
                const error = expected(err);
                if (!error.message.match(/insert not allowed|inserción no permitida/)) throw error;
            }
        })
    });

    describe("usuario desarrollador", function(){
        var session: Session<AppGestik>;        // eslint-disable-line no-var
        before(async function(){
            session = new Session(server);
            await session.login({
                username: 'autotest-desarrollador',
                password: 'clave1234',
            });
        })
        it("carga el ticket número 1", async function(){
            const row = await session.saveRecord('tickets', {proyecto: 'INTERNO-autotest', asunto:'terminar de escribir los tests'}, tipoTicket);
            // verifica el número de ticket y otros valores por defecto
            discrepances.showAndThrow(row, {
                proyecto: 'INTERNO-autotest', 
                ticket: 1, 
                tipo_ticket: 'tarea',
                asunto: 'terminar de escribir los tests',
                requirente: 'autotest-desarrollador',
                estado: 'nuevo',
                f_ticket: today,
                estados__solapa: 'nuevos',
                ...dolarFieldsTrue
            }, {notMemberAsUndefined: true, autoTypeCast: true});
        })
        it("la visibilidad de tickets depende pertenecer a un equipo asignado", async function(){
            await session.tableData("tickets", [
                {ticket: 1},
                {ticket: 2},
                {ticket: 3},
                {ticket: 4},
            ],'all',{fixedFields:{proyecto: 'PROYECTO1-autotest', tema:'prueba visibilidad'}});
        })
    })
    describe("usuario usuario", function(){
        var session: Session<AppGestik>;        // eslint-disable-line no-var
        before(async function(){
            session = new Session(server);
            await session.login({
                username: 'autotest-usuario',
                password: 'clave1234',
            });
        })
        it("la visibilidad de tickets depende de ser requirente o compartir equipo con él", async function(){
            await session.tableData("tickets", [
                {ticket: 1},
                {ticket: 3},
            ],'all',{fixedFields:{proyecto: 'PROYECTO1-autotest', tema:'prueba visibilidad'}});
        })
        it("no puede cargar tickets si no es_requirente", async function(){
            let error: Error|null = null;
            try {
                await session.saveRecord('tickets', {proyecto: 'INTERNO-autotest', asunto:'no debería poder'}, tipoTicket);
            } catch (err) {
                error = expected(err);
            }
            // verifica que se lance un error
            discrepances.showAndThrow(error, new Error("Backend error: el nuevo registro viola la política de seguridad de registros «debe ser del equipo requirente» para la tabla «tickets»"));
        })
        it("puede cargar tickets si es_requirente", async function(){
            const row = await session.saveRecord('tickets', {proyecto: 'PROYECTO1-autotest', asunto:'ticket nuevo de usuario'}, tipoTicket);
            // verifica el número de ticket y otros valores por defecto
            discrepances.showAndThrow(row, {
                proyecto: 'PROYECTO1-autotest', 
                ticket: 5, 
                tipo_ticket: 'tarea',
                asunto: 'ticket nuevo de usuario',
                requirente: 'autotest-usuario',
                estado: 'nuevo',
                f_ticket: today,
                estados__solapa: 'nuevos',
                ...dolarFieldsTrue
            }, {notMemberAsUndefined: true, autoTypeCast: true});
        })
        it("ve solo los proyectos relacionados", async function(){
            await session.tableData('proyectos', [
                {proyecto: 'PROYECTO1-autotest'}
            ], 'all');
        })
    })
})
