import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { TablaGenerica } from "../../components/shared/tabla-generica/tabla-generica";
import { Auth } from '../../services/auth';
import { EscladosService } from '../../services/escalados/esclados-tickets';
import { ActualizarEscalado, Escalados, ticket } from '../../models/tickets.model';
import { ColumnaTabla, EventoAccionTabla } from '../../models/tabla.model';
import { DatePipe, NgStyle } from '@angular/common';
import { form, FormField } from '@angular/forms/signals';
import ti from '@angular/common/locales/ti';
import { Modal } from 'bootstrap';
import { mensajeError, mensajeExito } from '../../utils/mensajes.utils';
import tr from '@angular/common/locales/tr';


const solucionInicial:ActualizarEscalado={
  id:null,
  ticketId:0,
  agenteDesarrollo:'',
  solucionPropuesta:'',
  solucionReal:'',
  lineasModificadas:'',
  estatusDesarrollo:''
};

@Component({
  selector: 'app-escalados-ticket',
  imports: [TablaGenerica, DatePipe, FormField],
  templateUrl: './escalados-ticket.html',
  styleUrl: './escalados-ticket.css',
})
export class EscaladosTicket {
  authService = inject(Auth);
  usuario = this.authService.obtenerUsuario();

  private escaladosService = inject(EscladosService);
  cargarEscalados(){
    this.escaladosService.obtemerEscalados().subscribe({
      next:(res)=>{
        this.escaladosLista.set(res);
      }
    });
  }

  ngOnInit(){
    this.cargarEscalados();
  }
  totalPendientes = computed(() => this.escaladosLista().filter(x => x.estatusDesarrollo === 'Pendiente').length);
  totalAgendados = computed(() =>
    this.escaladosLista().filter(x => x.estatusDesarrollo === 'Agendado').length
  );

  totalFinalizados = computed(() =>
    this.escaladosLista().filter(x => x.estatusDesarrollo === 'Finalizado').length
  );
  tabla = viewChild(TablaGenerica<Escalados>);

  escaladosLista = signal<Escalados[]>([]);

  columnasEscalados: ColumnaTabla[]=[
    {prop:'folio',name:'Folio',},
    {prop:'numCliente',name:'N°',width:20},
    {prop:'razonSocial',name:'Cliente',width:150},
    {prop:'estatusSoporte',name:'estatus Soporte',width:80},
    {prop:'estatusDesarrollo',name:'estatus Desarrollo',width:80},
    {prop:'fechaEscalado',name:'fecha', width:80,},
    {prop:'acciones',name:'Acciones',width:40,type:'actions',
      acciones:[
        {
          clave:'expandir',
          icono:'bi bi-plus-lg',
          colorClass:'btn-outline-success',
          titulo:'Expandir'
        },
        
      ]
    }
  ];
  colorEstatus(estatus:string){

    switch(estatus){
      case 'Pendiente':
        return '#721c24';
      case 'Agendado':
        return '#0b5ed7';
      case 'Finalizado':
        return '#157347';
      default:
        return 'bg-secondary';
    }
  }

  manejarAccionTabla(evento:EventoAccionTabla<Escalados>):void{
    switch(evento.accion){
      case 'expandir':
        this.ExpandirEscalado(evento.fila);
        break;
    }
  }


  ExpandirEscalado(escalado: Escalados) {
    if (escalado.solucionPropuesta !== undefined) {
      this.tabla()?.toggleExpand(escalado);
      return;
    }
    this.escaladosLista.update(lista =>
      lista.map(e =>
        e.id === escalado.id
          ? { ...e, cargandoSeguimientos: true }
          : e
      )
    );
    this.escaladosService.obtenerEscaladoPorId(escalado.id!).subscribe({
      next: (detalle) => {
        this.escaladosLista.update(lista =>
          lista.map(e =>
            e.id === escalado.id
              ? {
                  ...e,
                  ...detalle,
                  cargandoSeguimientos: false
                }
              : e
          )
        );
        const actualizado = this.escaladosLista()
          .find(e => e.id === escalado.id);

        if (actualizado) {
          this.tabla()?.toggleExpand(actualizado);
        }
      },
      error: () => {
        this.escaladosLista.update(lista =>
          lista.map(e =>
            e.id === escalado.id
              ? { ...e, cargandoSeguimientos: false }
              : e
          )
        );
      }
    });
  }


  solucion = signal<ActualizarEscalado>({...solucionInicial});
  solucionForm = form(this.solucion);

  
  ticketSeleccionado = signal<Escalados | null>(null);


  editarSolucion(ticket: Escalados) {

    this.ticketSeleccionado.set(ticket);

    this.solucion.set({
      id: ticket.id!,
      ticketId: ticket.ticketId,
      agenteDesarrollo: ticket.agenteDesarrollo ?? this.usuario.nombre,
      solucionPropuesta: ticket.solucionPropuesta ?? '',
      solucionReal: ticket.solucionReal ?? '',
      lineasModificadas: ticket.lineasModificadas ?? '',
      estatusDesarrollo: ticket.estatusDesarrollo ?? 'Pendiente'
    });

    this.abrirModalSolucion();
  }
  abrirModalSolucion(){
      const elemento = document.getElementById('modalSolucion');
      if(elemento){
          new Modal(elemento,{
              backdrop:'static',
              keyboard:false
          }).show();
      }
  }

  cerrarModalSolucion(){
      const elemento = document.getElementById('modalSolucion');
      if(elemento){
          Modal.getInstance(elemento)?.hide();
      }
  }

  guardarSolucion() {

    this.escaladosService
        .guardarSolucion(this.solucion())
        .subscribe({
          next: (res) => {

            mensajeExito("Listo", res.mensaje);

            this.cerrarModalSolucion();

            this.cargarEscalados();

          },
          error: (err) => {
            mensajeError("Error", err.error?.mensaje ?? "Ocurrió un error");
          }
        });

  }


}
