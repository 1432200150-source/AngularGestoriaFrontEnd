export interface opcionSistema{
    value:string |number;
    label:string|'';
}

export interface opcionesSoporte{
    value:string|number;
    label:string|'';
}

export interface opcionPrioridad{
    value:string|number;
    label:string|'';
}

export interface opcionEstatus{
    value:string|number;
    label:string|'';
}

export interface opcionEscalado{
    value:string|number;
    label:string|'';
}

export interface Cliente{
    razonSocial:string;
    numCliente:number;
    rfc:string;
}

export interface ticket{
    id:number|null;
    sistema:string;
    agente:string;
    tipoSoporte:string;
    categoria:string;
    prioridad:string;
    estatus:string;
    numCliente:string;
    rfc:string;
    escalado:string;
    razonSocial:string;
    reporta:string;
    fechaInicio:string;
    fechaSolucion:string|null;
    detalles:string;
    seguimientos?:Seguimiento[];
    cargandoSeguimientos?: boolean;
    expandido?:boolean;
}
export interface Seguimiento {
  id:number|null;
  ticketId:number;
  agente:string;
  fecha:string;
  //usuario:string;
  comentarios:string;

  estatus:string;
  escalado:string;
}

export interface Escalados{
    id:number|null;
    ticketId:number;
    folio?:string;
    numCliente:number|null;
    razonSocial:string;
    fallaReportada:string;
    agenteDesarrollo:string;
    solucionPropuesta:string;
    solucionReal:string;
    lineasModificadas:string;
    estatusSoporte:string;
    estatusDesarrollo:string;
    fechaEscalado:string|'';
    fechaAtencion: string|'';
    fechaTermino:string|'';
    seguimientos?:Seguimiento[];
    cargandoSeguimientos?: boolean;
    expandido?:boolean;
}

export interface ActualizarEscalado{
    id:number|null;
    ticketId:number;
    agenteDesarrollo:string;
    solucionPropuesta:string;
    solucionReal:string;
    lineasModificadas:string;
    estatusDesarrollo:string;
}

export interface GraficaSistema{
    nombreSistema:string;
    labels:string[];
    data:number[];
}