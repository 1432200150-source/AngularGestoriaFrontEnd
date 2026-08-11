export interface Aduana{
    id:number;
    numAduana:string;
    aduana:string;
}

export interface datosEmpresa{
    id:number|null;
    razonSocial:string;
    rfc:string;
    pdf:string;
    claveVucem:string;
    operacionesAño:string;
    aduanas:number|string;
}

export interface domicilioFiscal{
    id:number|null;
    calle:string;
    noExt:string;
    noInt:string;
    colonia:string;
    municipio:string;
    estado:string;
    cp:string;
    sede:string;
}
export interface domicilioUsuarios{
    id:number|null;
    calle:string;
    noExt:string;
    noInt:string;
    colonia:string;
    municipio:string;
    estado:string;
    cp:string;
    sede:string;
}