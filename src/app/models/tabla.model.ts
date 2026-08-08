export interface AccionTabla<T =any>{
  clave:string;
  icono:string;
  iconoActivo?:string;
  colorClass?:string;
  titulo?:string;
}
export interface ColumnaTabla {
  prop: string;       // Nombre de la propiedad del objeto (ej: 'nombre', 'email')
  name: string;       // Título visible en el encabezado (ej: 'Nombre Completo')
  width?: number; 
  autoWidth?: boolean;    // Ancho opcional en píxeles
  sortable?: boolean;
  type?:'text'|'actions';
  acciones?:AccionTabla[]; // Si permite ordenar (por defecto true)
}

export interface EventoAccionTabla<T = any>{
  accion:string;
  fila:T;
}