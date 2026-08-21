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

export interface DomicilioGeneral extends domicilioFiscal, domicilioUsuarios{
    tipo: 'FISCAL'|'USUARIO';
}

export interface Contacto{
    id: number | null;
    tipo: 'Sistemas' | 'Comercio' | '';
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    confirmarCorreo?: string;
    telefono1: string;
    telefono2: string;
}

export interface AdminForm {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nickname: string;
  puesto: string;
  correo: string;
  confirmarCorreo: string;
  telefono1: string;
  telefono2: string;
  usuario: string;
  sede: string;
  diaCumpleanos: string;
  mesCumpleanos: string;
}