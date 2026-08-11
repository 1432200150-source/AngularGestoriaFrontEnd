import { Component, inject } from '@angular/core';
import { Aduana, datosEmpresa, domicilioFiscal, domicilioUsuarios } from '../../models/instalacion.model';
import { InstalacionesService } from '../../services/instalaciones/instalaciones';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { TablaGenerica } from '../../components/shared/tabla-generica/tabla-generica';
import { ColumnaTabla, EventoAccionTabla } from '../../models/tabla.model';
import { mensajeAlerta } from '../../utils/mensajes.utils';
import { Modal } from 'bootstrap';
import { FormField } from '@angular/forms/signals';

const datosEmpesaInicial:datosEmpresa={
  id:null,
  razonSocial:'',
  rfc:'',
  pdf:'',
  claveVucem:'',
  operacionesAño:'',
  aduanas:''
};
const domicilioFiscalInicial:domicilioFiscal={
  id:null,
  calle:'',
  noExt:'',
  noInt:'',
  colonia:'',
  municipio:'',
  estado:'',
  cp:'',
  sede:''
};

const domicilioUsuariosInicial:domicilioUsuarios={
  id:null,
  calle:'',
  noExt:'',
  noInt:'',
  colonia:'',
  municipio:'',
  estado:'',
  cp:'',
  sede:''
};

@Component({
  selector: 'app-instalaciones-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TablaGenerica],
  templateUrl: './instalaciones-view.html',
  styleUrl: './instalaciones-view.css',
})
export class InstalacionesView {
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
    }
  }

  limpiarDomicilio(){
    this.domicilioFormulario = this.nuevoDomicilio();
    this.modoEdicion = false;
  }

  agregarDomicilioFiscal(){
    if(this.modoEdicion){
      const index = this.listaDomicilioFiscal.findIndex(x => x.id === this.domicilioFormulario.id);
      if(index !== 1){
        this.listaDomicilioFiscal[index] = {
          ...this.domicilioFormulario
        };
        this.listaDomicilioFiscal = [...this.listaDomicilioFiscal];
      }
    }else{
      const nuevo:domicilioFiscal = {
        ...this.domicilioFormulario, id:Date.now(), sede:'FISCAL'
      };
      this.listaDomicilioFiscal = [
        ...this.listaDomicilioFiscal,nuevo
      ];
    }
    this.limpiarDomicilio();
  }
}
