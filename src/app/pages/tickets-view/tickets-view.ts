import { Component, computed, DestroyRef, effect, ElementRef, inject, Injectable, signal, viewChild, viewChildren } from '@angular/core';
import { debounce, disabled, form, FormField } from '@angular/forms/signals';
import { Cliente, GraficaSistema, opcionEscalado, opcionesSoporte, opcionEstatus, opcionPrioridad, opcionSistema, Seguimiento, ticket } from '../../models/tickets.model';
import { mensajeAlerta, mensajeConfirmacion, mensajeExito } from '../../utils/mensajes.utils';
import { Auth } from '../../services/auth';
import { TicketsService } from '../../services/tickets';
import { AutoComplete } from 'primeng/autocomplete';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
import { TablaGenerica } from '../../components/shared/tabla-generica/tabla-generica';
import { ColumnaTabla, EventoAccionTabla } from '../../models/tabla.model';
import { Modal } from 'bootstrap';
import { DatePipe } from '@angular/common';
import { SeguimientosService } from '../../services/seguimientos/seguimientos';
import { Chart, ChartConfiguration, elements } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
const categoriasPorSoporte: Record<string, string[]> = {
    Soporte: [
      'A-Dudas de uso y temas basicos',
      'B-Error Recuperacion Documentos',
      'C-Error carga documentos',
      'D-Error reporteo',
      'E-Error acceso',
      'F-Error funcionamiento'
    ],
    Instalacion: ['Servidor Cliente', 'Servidor Hosting'],
    Migracion: ['Servidor Cliente', 'Servidor Hosting', 'Cliente a Hosting', 'Hosting a Cliente'],
    Actualizacion: ['Actualización Estándar', 'Actualización Crítica'],
    Modulo_Licencia: ['Alta licencia', 'Baja Licencia', 'Cancelacion sitio', 'Activacion Modulo', 'Renovación'],
    Administracion: ['Licencias', 'Tickets', 'Hosting', 'Reportes']
  };
  
  const ticketIncial:ticket={
    id:null,
    sistema:'',
    agente:'',
    tipoSoporte:'',
    categoria:'',
    prioridad:'',
    estatus:'',
    numCliente:'',
    rfc:'',
    escalado:'',
    razonSocial:'',
    reporta:'',
    fechaInicio:'',
    fechaSolucion:null,
    detalles:''
  };
  const seguimientoInicial: Seguimiento = {
    id: null,
    ticketId: 0,
    agente: '',
    fecha: '',
    comentarios: '',
    estatus:'',
    escalado:''
  };
  
@Component({
  selector: 'app-tickets-view',
  standalone: true,
  imports: [FormField,TablaGenerica,DatePipe],
  templateUrl: './tickets-view.html',
  styleUrl: './tickets-view.css',
})
export class TicketsView {
  authService = inject(Auth);
  usuario = this.authService.obtenerUsuario();
  
  tabla = viewChild(TablaGenerica<ticket>);

  private ticketService = inject(TicketsService);
  
  private clientesService = inject(TicketsService);

  private seguimientoService = inject(SeguimientosService);


  private destroyRef = inject(DestroyRef);

  modoFormulario = signal<'nuevo' | 'editar'>('nuevo');

  totalPendientes = computed(()=> this.ticketsLista().filter(x => x.estatus === 'Pendiente').length);
  totalAgendados = computed(()=> this.ticketsLista().filter(x => x.estatus === 'Agendado').length);
  totalFinalizados = computed(()=> this.ticketsLista().filter(x => x.estatus === 'Finalizado').length);


sistemasGraficas = computed<GraficaSistema[]>(() => {
  const lista = this.ticketsLista();
  const mapa = new Map<string, { pendientes: number; agendados: number; finalizados: number }>();

  for (const t of lista) {
    const sistema = t.sistema || 'Sin Sistema';

    if (!mapa.has(sistema)) {
      mapa.set(sistema, { pendientes: 0, agendados: 0, finalizados: 0 });
    }

    const conteos = mapa.get(sistema)!;
    if (t.estatus === 'Pendiente') conteos.pendientes++;
    else if (t.estatus === 'Agendado') conteos.agendados++;
    else if (t.estatus === 'Finalizado') conteos.finalizados++;
  }

  return Array.from(mapa.entries()).map(([nombreSistema, conteos]) => ({
    nombreSistema,
    labels: ['Pendiente', 'Agendado', 'Finalizado'],
    data: [conteos.pendientes, conteos.agendados, conteos.finalizados]
  }));
});

  canvasGraficas = viewChildren<ElementRef<HTMLCanvasElement>>('canvasGrafica');
  private chartsInstancias: Chart[] = [];
  coloresBase = ['#FFCE56', '#36A2EB', '#4BC0C0', '#FF6384', '#9966FF'];


  nuevoTicket(){
    this.modoFormulario.set('nuevo');
    this.limpiarFormulario();
  }

  sugerenciasClientes = signal<Cliente[]>([]);
  mostrarSugerencias = signal(false);
  constructor() {
    const razonSocial$ = toObservable(
      computed(() => this.ticketForm.razonSocial().value())
    );

    razonSocial$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(texto =>
        texto.trim().length >= 2 ? this.clientesService.autocomplete(texto.trim()) : of([])
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(resultados => {
      this.sugerenciasClientes.set(resultados);
      this.mostrarSugerencias.set(resultados.length > 0);
    });

    //graficas 
    effect(() => {
  const datosGraficas = this.sistemasGraficas();
  const elementosCanvas = this.canvasGraficas();

  this.chartsInstancias.forEach(c => c.destroy());
  this.chartsInstancias = [];

  if (elementosCanvas.length === 0 || datosGraficas.length === 0) return;

  elementosCanvas.forEach((canvasRef, index) => {
    const info = datosGraficas[index];
    const ctx = canvasRef.nativeElement.getContext('2d');

    if (ctx && info) {
      const config: ChartConfiguration<'pie'> = {
        type: 'pie',
        data: {
          labels: info.labels,
          datasets: [
            {
              backgroundColor: ['rgb(249, 179, 179)', 'rgb(174, 190, 220)', 'rgb(168, 230, 180)'],
              hoverBackgroundColor: ['#721c24', '#0b5ed7', '#157347'],
              data: info.data
            }
          ]
        },
        plugins: [ChartDataLabels], // <--- Activar el plugin en el gráfico
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: 'bottom' 
            },
            // Configuración de los números sobre la gráfica
            datalabels: {
              color: '#000000', // Color del texto
              font: {
                weight: 'bold',
                size: 13
              },
              // Oculta el número si la rebanada es 0
              formatter: (value) => {
                return value > 0 ? value : '';
              }
            }
          }
        }
      };

      this.chartsInstancias.push(new Chart(ctx, config));
    }
  });
});
  }

  seleccionarCliente(cliente: Cliente): void {
    this.tickets.update(t => ({
      ...t,
      razonSocial: cliente.razonSocial,
      rfc: cliente.rfc,
      numCliente: cliente.numCliente.toString()
    }));
    this.mostrarSugerencias.set(false);
  }

  ocultarSugerenciasConRetraso(): void {
    setTimeout(() => this.mostrarSugerencias.set(false), 150);
  }

  opcionesSistemas = signal<opcionSistema[]>([
    {value:'Ana',label:'Ana'},
    {value:'Control31',label:'Control31'},
    {value:'Mve',label:'Mve'},
    {value:'Administracion',label:'Administracion'},
  ]);

  opcionesSoporte = signal<opcionesSoporte[]>([
    {value:'Soporte',label:'Soporte'},
    {value:'Instalacion',label:'Instalacion'},
    {value:'Migracion',label:'Migracion'},
    {value:'Actualizacion',label:'Actualizacion'},
    {value:'Renovacion',label:'Renovacion'},
    {value:'PrimerConcacto',label:'PrimerConcacto'},
    {value:'Administracion',label:'Administracion'},
  ]);
  
  tipoSoporteSeleccionado = signal<string>('');
  categoriaSeleccionada = signal<string>('');

  categoriaDisponible= computed(()=>{
    const tipo = this.tipoSoporteSeleccionado();
    return categoriasPorSoporte[tipo]||[];

  });

  onTipoSoporteChange(): void {
    const tipo = this.ticketForm.tipoSoporte().value();
    this.tipoSoporteSeleccionado.set(tipo);
    this.tickets.update(t => ({
      ...t,
      categoria: ''
    }));
  }

  onCategoriaChange(event:Event):void{
    const value = (event.target as HTMLSelectElement).value;
    this.categoriaSeleccionada.set(value);
  }

  opcionesPrioridad = signal<opcionPrioridad[]>([
    {value:'Alta',label:'Alta'},
    {value:'Media',label:'Media'},
    {value:'Baja',label:'Baja'},
    {value:'Critica',label:'Critica'},
  ]);

  opcionesEstatus = signal<opcionEstatus[]>([
    
    {value:'Pendiente',label:'Pendiente'},
    {value:'Agendado',label:'Agendado'},
    {value:'Finalizado',label:'Finalizado'},
  ]);

  opcionesEscalado = signal<opcionEscalado[]>([
    {value:'Soporte',label:'Soporte'},
    {value:'Desarrollo',label:'Desarrollo'},
    {value:'Consultoria',label:'Consultoria'},
  ]);
  
  tickets = signal<ticket>({...ticketIncial, agente:this.usuario?.nombre});
  ticketForm = form(this.tickets, (schema) => {
    disabled(schema.fechaInicio, () => this.modoFormulario() === 'editar');
  });

  intentoGuardar = signal(false);
  
  esInvalido(valor:string):boolean{
    return this.intentoGuardar() && !valor.trim();
  }

  limpiarFormulario(){

    this.tipoSoporteSeleccionado.set('');

    this.tickets.update(() => ({
      ...ticketIncial,
      agente:this.usuario?.nombre || ''
    }));

    this.intentoGuardar.set(false);
  }

  guardar(event:Event){
    event.preventDefault();

    if(this.modoFormulario() === 'nuevo'){
      if (this.ticketForm.estatus().value() !== 'Finalizado') {
        this.tickets.update(t => ({ 
          ...t, 
          fechaSolucion:null
        }));
      }

    }
    this.intentoGuardar.set(true);
    const datos = {...this.tickets()};
    let hayVacios = false;
    const camposOpcionales = ['id'];
    if(datos.estatus !== 'Finalizado'){
      camposOpcionales.push('fechaSolucion');
    }
    for(const campo in datos){
      if(camposOpcionales.includes(campo))
        continue;
      const valor = (datos as any)[campo];
      if(typeof valor === 'string' && valor.trim()===''){
        hayVacios=true;
        break;
      }
    }
    if(hayVacios){
      mensajeAlerta("Campos requeridos","Algunos campos están vacíos");
      return;

    }

    if(this.modoFormulario()==='nuevo'){

      this.crearTicket();

    }
    else{

      this.actualizarTicket();

    }

  }
  crearTicket(){
    const datos = {...this.tickets()};
    this.ticketService.crearTicket(datos).subscribe({
      next:(res)=>{
        mensajeExito("Listo",res.mensaje);
        this.cerrarModal();
        this.cargarTickets();
        this.limpiarFormulario();
      },
      error:(err)=>{
        console.log(err.error);
      }
    });

  }

  actualizarTicket(){
    this.ticketService.actualizarTicket(this.tickets()).subscribe({
      next:(res)=>{
        mensajeExito("Listo",res.mensaje);
        this.cerrarModal();
        this.cargarTickets();
        this.limpiarFormulario();
        this.modoFormulario.set('nuevo');
      },
      error:(err)=>{
        console.log(err.error);
      }
    });
  }

  cargarTickets(){
    this.ticketService.obtenerTickets().subscribe({ 
      next:(res)=>{
        this.ticketsLista.set(res);
      }
    });
  }

  ngOnInit(){
    this.cargarTickets();
  }
  ticketsLista = signal<ticket[]>([]);

  columnasTickets: ColumnaTabla[] = [
    {prop:'folio',name:'Folio',width:100},
    //{prop:'sistema',name:'Sistema',width:60},
    {prop:'agente',name:'Agente',width:60},
    {prop:'tipoSoporte',name:'Tipo Soporte',width:80},
    {prop:'categoria',name:'Categoría',autoWidth:true},
    {prop:'estatus',name:'Estatus',width:60},
    //{prop:'prioridad',name:'Prioridad',width:60},
    {prop:'numCliente',name:'N°',width:20},
    {prop:'razonSocial',name:'Cliente',autoWidth:true},
    {prop:'acciones',name:'Acciones',width:80,type:'actions',
      acciones:[
        {
          clave:'expandir',
          icono:'bi bi-plus-lg',
          colorClass:'btn-outline-success',
          titulo:'Expandir'
        },
        {
          clave:'editar',
          icono:'bi bi-pencil-fill',
          colorClass:'btn-outline-primary',
          titulo:'Editar'
        },
        {
          clave:'eliminar',
          icono:'bi bi-trash-fill',
          colorClass:'btn-outline-danger',
          titulo:'Eliminar'
        },
      ]
    }
  ];

  manejarAccionTabla(evento: EventoAccionTabla<ticket>):void{
    switch(evento.accion){
      case 'expandir':
      this.expandirTicket(evento.fila);
      break;
      case 'editar':
        this.editarTicket(evento.fila);
        break;
      case 'eliminar':
        this.eliminarTicket(evento.fila);
        break;
    }
      
  }

  abrirModal(){
    const elemento = document.getElementById('modalTicket');

    if(elemento){
      const modal = new Modal(elemento, {
        backdrop: 'static', // evita cerrar al dar click afuera
        keyboard: false     // evita cerrar con tecla ESC
      });

      modal.show();
    }
  }
  cerrarModal(){
    const elemento=document.getElementById('modalTicket');
    if(elemento){
      const modal=Modal.getInstance(elemento);
      modal?.hide();
    }
  }
  expandirTicket(ticket: ticket) {
    if(ticket.seguimientos){
      this.tabla()?.toggleExpand(ticket);
      return;
    }
    
    this.ticketsLista.update(lista =>lista.map(t =>
        t.id === ticket.id
        ? {...t, cargandoSeguimientos:true}
        : t
      )
    );

    this.seguimientoService.obtenerSeguimientos(ticket.id!).subscribe({
      next:(seguimientos)=>{
        this.ticketsLista.update(lista =>
          lista.map(t =>
            t.id === ticket.id
            ? {
                ...t,
                seguimientos,
                cargandoSeguimientos:false
              }
            : t
          )
        );
        const ticketActualizado =this.ticketsLista().find(t=>t.id===ticket.id);

        if(ticketActualizado){
          this.tabla()?.toggleExpand(ticketActualizado);
        }

      },
      error:()=>{
        this.ticketsLista.update(lista =>
          lista.map(t =>
            t.id === ticket.id
            ? {...t,cargandoSeguimientos:false}
            : t
          )
        );
      }
    });

  }
  colorSistema(sistema:string){

  switch(sistema){

    case 'Ana':
      return 'bg-primary';

    case 'Control31':
      return 'bg-success';

    case 'Mve':
      return 'bg-danger';

    default:
      return 'bg-secondary';
  }

}

  editarTicket(ticket: ticket){

  this.tickets.update(() => ({
    ...ticket,
    agente: ticket.agente ?? ''
  }));

  this.tipoSoporteSeleccionado.set(ticket.tipoSoporte);

  this.modoFormulario.set('editar');

  this.abrirModal();
}

  eliminarTicket(ticket:ticket){
    console.log("eliminar",ticket);
  }
 
  seguimiento = signal<Seguimiento>({...seguimientoInicial});

  seguimientoForm = form(this.seguimiento);

  modoSeguimiento = signal<'nuevo' | 'editar'>('nuevo');
  ticketSeleccionado = signal<ticket | null>(null);

  nuevoSeguimiento(ticket:ticket){
    this.ticketSeleccionado.set(ticket);
    this.modoSeguimiento.set('nuevo');
    this.seguimiento.set({
      id:null,
      ticketId:ticket.id!,
      agente:this.usuario.nombre ?? '',
      fecha:new Date().toISOString().substring(0,10),
      comentarios:'',
      estatus:ticket.estatus,
      escalado:ticket.escalado
    });
    this.abrirModalSeguimiento();
  }
  


  editarSeguimiento(ticket:ticket, seg:Seguimiento){
    this.ticketSeleccionado.set(ticket);
      this.modoSeguimiento.set('editar');
      this.seguimiento.set({
          ...seg,
          ticketId: ticket.id!,
          estatus:ticket.estatus,
          escalado:ticket.escalado
      });
      this.abrirModalSeguimiento();
  }
  
  guardarSeguimiento(){
    if(this.modoSeguimiento()==='nuevo'){
        this.crearSeguimiento();
    }else{
        this.actualizarSeguimiento();
    }
    this.ticketService.actualizarTicket({
        ...this.ticketSeleccionado()!,
        estatus: this.seguimiento().estatus,
        escalado: this.seguimiento().escalado,
        fechaSolucion:this.seguimiento().estatus === 'Finalizado'? new Date().toISOString(): null
    }).subscribe();
  }

  crearSeguimiento(){
    this.seguimientoService.crearSeguimiento(this.seguimiento()).subscribe({
          next: (res) => {
            mensajeExito("Listo",res.mensaje);
              this.cerrarModalSeguimiento();
              this.recargarSeguimientos(
                  this.seguimiento().ticketId
              );
          },
          error: (err) => {
            console.log('STATUS', err.status);
            console.log('ERROR', err.error);
            console.log('JSON', JSON.stringify(err.error, null, 2));
          }
      });

  }

  actualizarSeguimiento(){
    this.seguimientoService.actualizarSeguimiento(this.seguimiento())
        .subscribe({
            next: (res) => {
              mensajeExito("Listo",res.mensaje);
                this.cerrarModalSeguimiento();
                this.recargarSeguimientos(
                    this.seguimiento().ticketId
                );
            }
        });
  }

  eliminarSeguimiento(ticket: ticket, seg: Seguimiento){
      mensajeConfirmacion(
          "¿Eliminar seguimiento?",
          "Esta acción no se puede deshacer"
      ).then(confirmado=>{
          if(!confirmado){
              return;
          }
          this.seguimientoService
              .eliminarSeguimiento(seg.id!)
              .subscribe({
                  next:()=>{
                      mensajeExito(
                          "Correcto",
                          "Seguimiento eliminado"
                      );
                      this.recargarSeguimientos(ticket.id!);
                  }
              });
      });

  }

  recargarSeguimientos(ticketId: number){
      this.seguimientoService
          .obtenerSeguimientos(ticketId)
          .subscribe(seguimientos => {
              this.ticketsLista.update(lista =>
                  lista.map(t =>
                      t.id === ticketId
                          ? {
                              ...t,
                              seguimientos
                          }
                          : t
                  )
              );

          });
  }

  abrirModalSeguimiento(){
      const elemento = document.getElementById('modalSeguimiento');
      if(elemento){
          new Modal(elemento,{
              backdrop:'static',
              keyboard:false
          }).show();
      }
  }

  cerrarModalSeguimiento(){
      const elemento = document.getElementById('modalSeguimiento');
      if(elemento){
          Modal.getInstance(elemento)?.hide();
      }
  }
}
