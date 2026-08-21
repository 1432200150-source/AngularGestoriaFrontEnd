import { Component, inject } from '@angular/core';
import { AdminForm, Aduana, Contacto, datosEmpresa, domicilioFiscal, DomicilioGeneral, domicilioUsuarios } from '../../models/instalacion.model';
import { InstalacionesService } from '../../services/instalaciones/instalaciones';
import { CommonModule } from '@angular/common';
import { concatMapTo, Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TablaGenerica } from '../../components/shared/tabla-generica/tabla-generica';
import { ColumnaTabla, EventoAccionTabla } from '../../models/tabla.model';
import { mensajeAlerta } from '../../utils/mensajes.utils';
import { Collapse, Modal } from 'bootstrap';
import { FormField } from '@angular/forms/signals';
import ca from '@angular/common/locales/ca';
import id from '@angular/common/locales/id';

@Component({
  selector: 'app-instalaciones-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TablaGenerica],
  templateUrl: './instalaciones-view.html',
  styleUrl: './instalaciones-view.css',
})
export class InstalacionesView {

  datosEmpresaForm={
    razonSocial: '',
    rfc: '',
    claveVucem: '',
    operacionesAno: ''
  };

  intentoSiguiente1 = false;
  seccion1Completa = false;
  empresaCompleta:any = null;
  //
  intentoSiguiente2 =false;
  seccion2Completa = false;

  private instalacionService = inject(InstalacionesService);
  private sanitizer = inject(DomSanitizer);
  // Guardas el Observable directamente
  aduanas$: Observable<Aduana[]> = this.instalacionService.obtenerAduanas();

  pdfCSF:File | null = null;
  pdfCSFUrl: SafeResourceUrl | null = null;
  mostrarModalPdf = false;

  seleccionarCSF(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.pdfCSF = input.files[0];
      
      // Crear URL temporal de objeto
      const objectUrl = URL.createObjectURL(this.pdfCSF);
      
      // Sanitizar la URL para que Angular permita cargarla en un iframe
      this.pdfCSFUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);

    }
  }
  verCSF(){
    if(this.pdfCSFUrl){
       this.mostrarModalPdf = true;
    }
  }
  cerrarModalPdf(){
    this.mostrarModalPdf = false;
  }

  listaAduanaCompleta:Aduana[] = [];
  idAduanaSeleccionada :string|number|null=null;
  aduanasSeleccionadas:Aduana[] = [];

  columnasAduana: ColumnaTabla[]=[
    {prop:'numAduana', name:'N°',width:10},
    {prop:'aduana',name:'Aduana',autoWidth:true},
    { prop:'acciones', name:'Accion',type:'actions',width:10,acciones:[
      {
        clave:'eliminar',
        icono:'bi bi-trash',
        colorClass:'btn-outline-danger',
        titulo:'eliminar'
      }
    ]}
  ];

  constructor(){
    this.aduanas$.subscribe((lista) =>{
      this.listaAduanaCompleta=lista;
    });
  }
  agregarAduana(){
    if(!this.idAduanaSeleccionada){
      mensajeAlerta("Advetencia","Por favor seleccione una Aduana");
      return;
    }
    const aduanaEncontrada = this.listaAduanaCompleta.find((a)=> a.id == this.idAduanaSeleccionada);
    if(!aduanaEncontrada) return;
    const yaExiste = this.aduanasSeleccionadas.some((a)=> a.id == aduanaEncontrada.id);
    if(yaExiste){
      mensajeAlerta("Advertencia","Esta aduana ya fue agregada");
      return;
    }
    this.aduanasSeleccionadas=[...this.aduanasSeleccionadas,aduanaEncontrada];
    this.idAduanaSeleccionada = null;
  }

  manejarAccionTabla(evento:EventoAccionTabla<Aduana>){
    if(evento.accion === 'eliminar'){
      this.eliminarAduana(evento.fila);
    }
  }
  eliminarAduana(aduanaEliminar:Aduana){
    this.aduanasSeleccionadas= this.aduanasSeleccionadas.filter((a)=> a.id !== aduanaEliminar.id);
  }

  abrirModalFiscal(){
    const elemento = document.getElementById('modalFiscal');
    if(elemento){
      const modal = new Modal(elemento,{
        backdrop:'static', keyboard:false
      });
      modal.show();
    }
  }

  abrirModalUsuarios(){
    const elemento = document.getElementById('modalUsuarios');
    if(elemento){
      const modal = new Modal(elemento,{
        backdrop:'static', keyboard:false
      });
      modal.show();
    }
  }

  listaDomicilioFiscal: domicilioFiscal[] = [];
  domicilioFormulario:domicilioFiscal = this.nuevoDomicilio();
  modoEdicion = false;
  nuevoDomicilio(): domicilioFiscal{
    return{
      id: null,
      sede: '',
      calle: '',
      noExt: '',
      noInt: '',
      colonia: '',
      municipio: '',
      estado: '',
      cp: ''
    };
  }
  nuevoDomicilioUsuarios():domicilioUsuarios{
     return{
      id: null,
      sede: '',
      calle: '',
      noExt: '',
      noInt: '',
      colonia: '',
      municipio: '',
      estado: '',
      cp: ''
    };
  };

  columnasDomicilioFiscal:ColumnaTabla[]=[
    { prop:'sede', name:'Sede',width:10 },
    { prop:'calle', name:'Calle',width:40 },
    { prop:'noExt', name:'No.Ext',width:10 },
    { prop:'noInt', name:'No.Int',width:10 },
    { prop:'colonia', name:'Colonia',width:40 },
    { prop:'municipio', name:'Municipio',width:40 },
    { prop:'estado', name:'Estado',width:30 },
    { prop:'cp', name:'C.P.',width:10 },
    { prop:'acciones',name:'Acciones',type:'actions', width:20, acciones:[
      {
        clave:'editar',
        icono:'bi bi-pencil-square',
        colorClass:'text-success',
        titulo:'editar'
      },
      {
        clave:'eliminar',
        icono:'bi bi-trash',
        colorClass:'text-danger',
        titulo:'eliminar'
      }
    ]}
  ];

  ejecutarAccionDomicilioFiscal(evento:EventoAccionTabla<domicilioFiscal>){
    if(evento.accion ==='editar'){
      this.modoEdicion = true;
      this.domicilioFormulario = {
        ...evento.fila
      };

    }

    if(evento.accion === 'eliminar'){
      this.listaDomicilioFiscal = this.listaDomicilioFiscal.filter(x => x.id !== evento.fila.id);
      this.ambasListasUsuarios = this.ambasListasUsuarios.filter(x => x.id !== evento.fila.id);
    }
  }

  limpiarDomicilio(){
    this.domicilioFormulario = this.nuevoDomicilio();
    this.modoEdicion = false;
    this.intentoGuardar=false;
  }
  intentoGuardar = false;
  agregarDomicilioFiscal(){
    this.intentoGuardar = true;
    if(this.domicilioInvalido()){
      mensajeAlerta("Advertencia","Existen campos vacios, estan resaltados");
      return;
    }
    if(this.modoEdicion){
      const index = this.listaDomicilioFiscal.findIndex(x => x.id === this.domicilioFormulario.id);
      if(index !== -1){
        const editado = { ...this.domicilioFormulario,tipo:'FISCAL' as const};
        this.listaDomicilioFiscal[index]=editado;
        this.listaDomicilioFiscal = [...this.listaDomicilioFiscal];
        this.actualizarListaGeneral(editado);
      }
    }else{
      const nuevo:domicilioFiscal = {
        ...this.domicilioFormulario, id:Date.now(), sede:'FISCAL'
      };
      this.listaDomicilioFiscal = [
        ...this.listaDomicilioFiscal,nuevo
      ];
      this.ambasListasUsuarios = [
        ...this.ambasListasUsuarios,{ ...nuevo, tipo:'FISCAL'}
      ];
    }
    
    this.limpiarDomicilio();
  }
  domicilioInvalido(): boolean {
    return Object.entries(this.domicilioFormulario)
      .some(([campo, valor]) =>
        campo !== 'id' &&
        campo !== 'sede' &&
        campo !== 'noInt' &&
        !String(valor ?? '').trim()
      );
  }

  campoInvalido(campo: keyof domicilioFiscal): boolean {
    if (!this.intentoGuardar) return false;

    return !String(this.domicilioFormulario[campo] ?? '').trim();
  }
  //lista de domicilios usuario

  listaDomicilioUsuario:domicilioUsuarios[]=[];
  domicilioUsuariosFormulario: domicilioUsuarios = this.nuevoDomicilioUsuarios();

  columnasDomicilioUsuario:ColumnaTabla[]=[
    { prop:'sede', name:'Sede',width:10 },
    { prop:'calle', name:'Calle',width:40 },
    { prop:'noExt', name:'No.Ext',width:10 },
    { prop:'noInt', name:'No.Int',width:10 },
    { prop:'colonia', name:'Colonia',width:40 },
    { prop:'municipio', name:'Municipio',width:40 },
    { prop:'estado', name:'Estado',width:30 },
    { prop:'cp', name:'C.P.',width:10 },
    { prop:'acciones',name:'Acciones',type:'actions', width:20, acciones:[
      {
        clave:'editar',
        icono:'bi bi-pencil-square',
        colorClass:'text-success',
        titulo:'editar'
      },
      {
        clave:'eliminar',
        icono:'bi bi-trash',
        colorClass:'text-danger',
        titulo:'eliminar'
      }
    ]}
  ];

  ejecutarAccionDomicilioUsuarios(evento: EventoAccionTabla<domicilioUsuarios>){
    if(evento.accion === 'editar'){
      this.modoEdicion=true;
      this.domicilioUsuariosFormulario={...evento.fila};

    }
    if(evento.accion==='eliminar'){
      this.listaDomicilioUsuario = this.listaDomicilioUsuario.filter(x => x.id !== evento.fila.id);
      this.ambasListasUsuarios = this.ambasListasUsuarios.filter(x => x.id !== evento.fila.id);
    }
  }

  limpiarDomicilioUsuario(){
    this.domicilioUsuariosFormulario = this.nuevoDomicilioUsuarios();
    this.modoEdicion=false;
    this.intentoGuardar=false;
  }
  domicilioInvalidoUsuario():boolean{
    return Object.entries(this.domicilioUsuariosFormulario).some(([campo,valor]) => campo !== 'id' && campo !== 'sede' && campo !== 'noInt' && !String(valor ?? '').trim());
  }
  campoInvalidoUsuario(campo: keyof domicilioUsuarios):boolean{
    if(!this.intentoGuardar)return false;
    return !String(this.domicilioUsuariosFormulario[campo] ?? '').trim();
  }
  agregarDomicilioUsuario(){
    this.intentoGuardar=true;
    if(this.domicilioInvalidoUsuario()){
      mensajeAlerta("Advertencia", "Existen campos vacíos, están resaltados");
      return;
    }
    if(this.modoEdicion){
      const index = this.listaDomicilioUsuario.findIndex(x=>x.id === this.domicilioUsuariosFormulario.id);
      if(index !==-1){
        const editado = {...this.domicilioUsuariosFormulario, tipo:'USUARIO' as const};
        this.listaDomicilioUsuario[index] = editado;
        this.listaDomicilioUsuario = [...this.listaDomicilioUsuario];
        this.actualizarListaGeneral(editado);
      }
    }else{
      const nuevo:domicilioUsuarios={
        ...this.domicilioUsuariosFormulario,id:Date.now()
      };
      this.listaDomicilioUsuario = [
        ...this.listaDomicilioUsuario,nuevo
      ];
      this.ambasListasUsuarios = [
        ...this.ambasListasUsuarios,{ ...nuevo, tipo:'USUARIO'}
      ];
    }
    this.limpiarDomicilioUsuario();
  }

  //AMBAS LISTAS

  ambasListasUsuarios:DomicilioGeneral[] = [];
  columnasDomicilios: ColumnaTabla[] = [
    { prop: 'tipo', name: 'Tipo', width: 15 },
    { prop: 'sede', name: 'Sede', width: 15 },
    { prop: 'calle', name: 'Calle', width: 30 },
    { prop: 'noExt', name: 'No.Ext', width: 15 },
    { prop: 'noInt', name: 'No.Int', width: 15 },
    { prop: 'colonia', name: 'Colonia', width: 30 },
    { prop: 'municipio', name: 'Municipio', width: 30 },
    { prop: 'estado', name: 'Estado', width: 25 },
    { prop: 'cp', name: 'C.P.', width: 15 },
    {
      prop: 'acciones',
      name: 'Acciones',
      type: 'actions',
      acciones: [
        {
          clave: 'editar',
          icono: 'bi bi-pencil-square',
          colorClass: 'text-success'
        },
        {
          clave: 'eliminar',
          icono: 'bi bi-trash',
          colorClass: 'text-danger'
        }
      ]
    }
  ];

  ejecutarAccionDomicilioGeneral(evento:EventoAccionTabla<DomicilioGeneral>){
    if(evento.accion === 'eliminar'){
      this.ambasListasUsuarios = this.ambasListasUsuarios.filter(x => x.id !== evento.fila.id);

      if(evento.fila.tipo === 'FISCAL'){
        this.listaDomicilioFiscal = this.listaDomicilioFiscal.filter(x => x.id !== evento.fila.id);
      }
      if(evento.fila.tipo === 'USUARIO'){
        this.listaDomicilioUsuario = this.listaDomicilioUsuario.filter(x =>x.id !== evento.fila.id);
      }
    }
  
    if(evento.accion === 'editar'){
      if(evento.fila.tipo === 'FISCAL'){
        this.domicilioFormulario = { ...evento.fila};
        this.modoEdicion = true;
        this.abrirModalFiscal();
      }
      if(evento.fila.tipo === 'USUARIO'){
        this.domicilioUsuariosFormulario={...evento.fila};
        this.modoEdicion = true;
        this.abrirModalUsuarios();
      }

    }
  }
  private actualizarListaGeneral(domicilioEditado:DomicilioGeneral){
    const idxGeneral = this.ambasListasUsuarios.findIndex(x => x.id === domicilioEditado.id);
    if(idxGeneral !== -1){
      this.ambasListasUsuarios[idxGeneral]={ ...domicilioEditado};
      this.ambasListasUsuarios = [...this.ambasListasUsuarios];
    }
  }

  siguienteSeccion1(){
    this.intentoSiguiente1 = true;
    if(!this.datosEmpresaForm.razonSocial.trim() || !this.datosEmpresaForm.rfc.trim() || !this.datosEmpresaForm.claveVucem.trim() || !this.datosEmpresaForm.operacionesAno.trim()){
      mensajeAlerta("Advertencia","por favor llene todos los campos marcados con (*)");
      return;
    }
    if(!this.pdfCSF){
      mensajeAlerta("Advertencia","Es obligatorio adjuntar la constancia de Situacion Fiscal");
      return;
    }
    if(this.listaDomicilioFiscal.length ===0){
      mensajeAlerta("Advertencia","Debe registrar al menos un Domicilio Fiscal");
      return;
    }
    if(this.aduanasSeleccionadas.length ===0){
      mensajeAlerta("Advertencia","Debe agregar al menos una Aduana de operacion");
      return;
    }
    this.seccion1Completa = true;
    this.abrirAcordeon('collapseTwo','collapseOne');
    this.empresaCompleta = {
      ...this.datosEmpresaForm, archivoPdf: this.pdfCSF, domicilios: this.ambasListasUsuarios, aduanas: this.aduanasSeleccionadas
    };
    console.log("Datos de empresa guardados",this.empresaCompleta);
    
  }
  private abrirAcordeon(idAbrir:string, idCerrar:string){
    const elCerrar = document.getElementById(idCerrar);
    const elAbrir = document.getElementById(idAbrir);
    if(elCerrar && elAbrir){
      const colCerrar = Collapse.getInstance(elCerrar) || new Collapse(elCerrar);
      const colAbrir = Collapse.getInstance(elAbrir) || new Collapse(elAbrir);
      colCerrar.hide();
      colAbrir.show();
    }
  }

  //datos del contacto
  contactoFormulario: Contacto = this.nuevoContacto();
  listaContactos:Contacto[] = [];
  intentoGuardarContacto=false;
  modoEdicionContacto = false;

  nuevoContacto():Contacto{
    return {
      id: null,
      tipo: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      correo: '',
      confirmarCorreo: '',
      telefono1: '',
      telefono2: ''
    };
  }
  columnasContacto: ColumnaTabla[] = [
    { prop: 'tipo', name: 'Tipo', width: 20 },
    { prop: 'nombre', name: 'Nombre', width: 30 },
    { prop: 'apellidoPaterno', name: 'A. Paterno', width: 30 },
    { prop: 'apellidoMaterno', name: 'A. Materno', width: 30 },
    { prop: 'correo', name: 'Correo', width: 40 },
    { prop: 'telefono1', name: 'Teléfono 1', width: 25 },
    {
      prop: 'acciones',
      name: 'Acciones',
      type: 'actions',
      width: 20,
      acciones: [
        { clave: 'editar', icono: 'bi bi-pencil-square', colorClass: 'text-success', titulo: 'Editar' },
        { clave: 'eliminar', icono: 'bi bi-trash', colorClass: 'text-danger', titulo: 'Eliminar' }
      ]
    }
  ];

  ejecutarAccionContacto(evento:EventoAccionTabla<Contacto>){
    if(evento.accion === 'editar'){
      this.modoEdicionContacto = true;
      this.contactoFormulario = { ...evento.fila, confirmarCorreo:evento.fila.correo};
    }
    if(evento.accion === 'editar'){
      this.listaContactos = this.listaContactos.filter(x => x.id !== evento.fila.id);
    }
  }

  agregarContacto(){
    this.intentoGuardarContacto = true;
    if(!this.contactoFormulario.tipo || !this.contactoFormulario.nombre.trim() || !this.contactoFormulario.apellidoPaterno.trim() || !this.contactoFormulario.correo.trim() || !this.contactoFormulario.confirmarCorreo?.trim()){
      mensajeAlerta("Advertencia","Por favor completa todos los campos obligatorios");
      return;
    }
    if (this.contactoFormulario.correo.trim().toLowerCase() !== this.contactoFormulario.confirmarCorreo.trim().toLowerCase()) {
      mensajeAlerta("Advertencia", "Los correos electrónicos no coinciden.");
      return;
    }

    if (this.modoEdicionContacto) {
      const index = this.listaContactos.findIndex(x => x.id === this.contactoFormulario.id);
      if (index !== -1) {
        this.listaContactos[index] = { ...this.contactoFormulario };
        this.listaContactos = [...this.listaContactos];
      }
    } else {
      const nuevo: Contacto = { ...this.contactoFormulario, id: Date.now() };
      this.listaContactos = [...this.listaContactos, nuevo];
    }
    this.limpiarContacto();
  }

  limpiarContacto(){
    this.contactoFormulario = this.nuevoContacto();
    this.modoEdicionContacto = false;
    this.intentoGuardarContacto = false;
  }
  siguienteSeccion2(){
    this.intentoSiguiente2 = true;
    const tieneSistemas = this.listaContactos.some(c => c.tipo === 'Sistemas');
    const tieneComercio = this.listaContactos.some(c => c.tipo === 'Comercio');
    if(!tieneSistemas || !tieneComercio){
      mensajeAlerta("Advertencia","Debes registrar almenos un contacto de Sistemas y al menos uno de Comercio");
      return;
    }
    this.seccion2Completa = true;
    this.abrirAcordeon('collapseThree','collapseTwo');
  }
  anteriorSeccion2(){
    this.abrirAcordeon('collapseOne','collapseTwo');
  }

  adminFormulario:AdminForm = this.nuevoAdminForm();
  nuevoAdminForm(){
    return {
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      nickname: '',
      puesto: '',
      correo: '',
      confirmarCorreo: '',
      telefono1: '',
      telefono2: '',
      usuario: '',
      sede: '',
      diaCumpleanos: '',
      mesCumpleanos: ''
    };
  }
  meses = [
    { numero: '01', nombre: 'Enero' },
    { numero: '02', nombre: 'Febrero' },
    { numero: '03', nombre: 'Marzo' },
    { numero: '04', nombre: 'Abril' },
    { numero: '05', nombre: 'Mayo' },
    { numero: '06', nombre: 'Junio' },
    { numero: '07', nombre: 'Julio' },
    { numero: '08', nombre: 'Agosto' },
    { numero: '09', nombre: 'Septiembre' },
    { numero: '10', nombre: 'Octubre' },
    { numero: '11', nombre: 'Noviembre' },
    { numero: '12', nombre: 'Diciembre' }
  ];
  dias: string[] = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  get sedesDisponibles(): string[] {
    const sedes = this.ambasListasUsuarios
      .map(d => d.sede?.trim())
      .filter((sede): sede is string => !!sede);

    // Eliminar duplicados usando Set
    return [...new Set(sedes)];
  }

}
