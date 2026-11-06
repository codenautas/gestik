import { Description, is } from 'guarantee-type'

/*
type ArrayElement<ArrayType extends readonly unknown[]> = 
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
*/

type CommonEntityDefinition = {
    table: string
    description: Description
}

export const archivos_borrar = {
    table: 'archivos_borrar',
    description: is.object({
        ruta_archivo: is.string
    })
}

export const equipos = {
    table: 'equipos',
    description: is.object({
        equipo: is.string
    })
}

export const proyectos = {
    table: 'proyectos',
    description: is.object({
        proyecto: is.string,
        es_general: is.boolean,
        solapas_cant: is.optional.object({})
    })
}

const dolarFieldsDescription = {
    "$allow.update": is.optional.boolean,
    "$allow.delete": is.optional.boolean,
}

export const tickets = {
    table: 'tickets',
    description: is.object({
        proyecto: is.string,
        ticket: is.optional.number,
        tipo_ticket: is.optional.string,
        asunto: is.string,
        requirente: is.optional.string,
        estado: is.optional.string,
        f_ticket: {optional: is.Date},
        estados__solapa: is.optional.string,
        ...dolarFieldsDescription
    })
} satisfies CommonEntityDefinition

export const tickets_fechas = {
    table: 'tickets',
    description: is.object({
        proyecto: is.string,
        ticket: is.optional.number,
        asunto: is.string,
        descripcion: is.optional.string,
        estado: is.optional.string,
        f_inicio: {optional: is.Date},
        f_realizacion: {optional: is.Date},
    })
} satisfies CommonEntityDefinition

export const anotaciones = {
    table: 'anotaciones',
    description: is.object({
        proyecto: is.string,
        ticket: is.number,
        anotacion: is.optional.number,
        usuario: is.optional.string,
        detalle: is.optional.string,
        proyecto_relacionado: is.optional.string,
        ticket_relacionado: is.optional.number,
    })
} satisfies CommonEntityDefinition

////////////// PROCEDIMEINTOS

export const cambiar_proyecto = {
    procedure: 'cambiar_proyecto',
    parameters: is.object({
        del_proyecto: is.string,
        el_ticket: is.number,
        al_proyecto: is.string,
    }),
    result: is.string
}

export const si_cargara_novedad = {
    procedure: 'si_cargara_novedad',
    parameters: is.object({
        idper: is.nullable.string,
        cod_nov: is.nullable.string,
        desde: is.Date,
        hasta: is.Date,
        cancela: is.nullable.boolean
    }),
    result: is.object({
        mensaje: is.string,
        dias_corridos: is.number,
        dias_habiles: is.number,
        dias_coincidentes: is.number,
        con_detalles: is.nullable.boolean,
        c_dds: is.nullable.boolean,
        saldo: is.nullable.number,
    })
}

//////////// ERRORES POSTGRES PROPIOS:
export const ERROR_REFERENCIA_CIRCULAR_EN_SECTORES = 'P1001';
export const ERROR_NO_SE_PUEDE_CARGAR_EN_EL_PASADO = 'P1002';
export const ERROR_COD_NOVEDAD_INDICA_CON_DETALLES = 'P1003';
export const ERROR_COD_NOVEDAD_INDICA_SIN_DETALLES = 'P1004';
export const ERROR_COD_NOVEDAD_NO_INDICA_TOTAL     = 'P1005';
export const ERROR_COD_NOVEDAD_NO_INDICA_PARCIAL   = 'P1006';
export const ERROR_COD_NOVEDAD_NO_INDICA_CON_HORARIO= 'P1007';
export const ERROR_COD_NOVEDAD_NO_INDICA_CON_NOVEDAD= 'P1008';
export const ERROR_SECTORES_DESNIVELADOS            = 'P1009';
export const ERROR_SECTOR_HUERFANO_NO_TOPE          = 'P1010';

//////////// ERRORES PROPIOS DEL BACKEND:
export const ERROR_EXCEDIDA_CANTIDAD_DE_NOVEDADES   = 'B9001';

//////////// ERRORES POSTGRES: https://www.postgresql.org/docs/current/errcodes-appendix.html
export const insufficient_privilege = '42501';
export const exclusion_violation = '23P01';
export const unique_violation = '23505';
