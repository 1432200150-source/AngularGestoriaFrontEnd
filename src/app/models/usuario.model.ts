export interface Usuario{
    id?:number|null;
    nombre:string;
    correo:string;
    userName:string;
    password?:string;
    confirmaPassword?:string;
    rol:string;
    area:string;
    autorizaVacaciones:boolean;
}

export interface OpcionArea{
    value:string |number;
    label:string|'';
}

export interface OpcionRol{
    value:string |number;
    label:string|'';
}