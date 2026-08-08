import { Component, computed, input,output, signal, TemplateRef, ViewChild } from '@angular/core';
import { DatatableRowDetailDirective, NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ColumnaTabla,EventoAccionTabla } from '../../../models/tabla.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-tabla-generica',
  standalone: true,
  imports: [NgxDatatableModule,CommonModule],
  templateUrl: './tabla-generica.html',
  styleUrl: './tabla-generica.css',
})
export class TablaGenerica<T> {
  @ViewChild(DatatableRowDetailDirective)
detalleRow!: DatatableRowDetailDirective<any>;
  filas = input.required<T[]>();
  columnas = input.required<ColumnaTabla[]>();
  cargando = input<boolean>(false);
  limitePorPagina = input<number>(10);
  titulo = input<string>('');
  mostrarBuscador = input<boolean>(true);
  onAccion = output<EventoAccionTabla<T>>();
  busqueda = signal<string>('');

  detalleTemplate = input<TemplateRef<any> | null>(null);
  filaExpandida = input<((fila:T)=>boolean) | null>(null);
  // Computed signal que filtra automáticamente las filas recibidas
filasFiltradas = computed(() => {
  const termino = this.busqueda().toLowerCase().trim();
  const datos = this.filas();

  if (!termino) return datos;

  return datos.filter((item: T) => {
    const obj = item as Record<string, any>;
    
    return Object.keys(obj).some((key) => {
      const valor = obj[key];
      if (valor === null || valor === undefined) return false;
      return String(valor).toLowerCase().includes(termino);
    });
  });
});

  alBuscar(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.busqueda.set(valor);
  }
  ejecutarAccion(claveAccion: string, fila: T) {

    this.onAccion.emit({
      accion: claveAccion,
      fila
    });
  }
  toggleExpand(fila: T) {
  
    this.detalleRow.toggleExpandRow(fila);
  }
  alturaDetalle(row:any):number {

    const base = 550;

    const seguimientos =
      (row.seguimientos?.length || 0) * 90;

    const detalles =
      row.detalles 
        ? Math.ceil(row.detalles.length / 100) * 25
        : 0;

    return base + seguimientos + detalles;
  }
}
