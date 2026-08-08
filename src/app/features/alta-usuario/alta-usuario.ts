import { Component, inject, OnInit, signal,computed } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Usuario,OpcionArea,OpcionRol,  } from '../../models/usuario.model';
import { mensajeAlerta, mensajeError, mensajeExito,mensajeConfirmacion } from '../../utils/mensajes.utils';
import { UsuarioService } from '../../services/usuario';
import { TablaGenerica } from '../../components/shared/tabla-generica/tabla-generica';
import { ColumnaTabla, EventoAccionTabla } from '../../models/tabla.model';


declare var bootstrap:any;
  const usuarioInicial: Usuario={
      id: 0,
      nombre: '',
      correo: '',
      userName: '',
      password: '',
      confirmaPassword: '',
      rol: '',
      area: '',
      autorizaVacaciones: false
    };

@Component({
  selector: 'app-alta-usuario',
  standalone: true,
  imports: [FormField, TablaGenerica],
  templateUrl: './alta-usuario.html',
  styleUrl: './alta-usuario.css',
})
  
  export class AltaUsuario implements OnInit {
    private usuarioService = inject(UsuarioService);
    opcionesAreas = signal<OpcionArea[]>([
      {value:'Soporte',label:'Soporte'},
      { value: 'Desarrollo', label: 'Desarrollo' },
      { value: 'Consultoria', label: 'Consultoría' }
    ]);

    opcionesRoles = signal<OpcionRol[]>([
      {value:'Admin',label:'Administrador'},
      {value:'Usuario',label:'Usuario'},
      {value:'Comercio',label:'Comercio'},
      {value:'RH',label:'Recursos humanos'},
      {value:'Invitado',label:'Invitado'},
    ])

    user = signal<Usuario>({...usuarioInicial});
    
    userForm = form(this.user);
    intentoGuardar = signal(false);

    esEdicion = signal<boolean>(false);
    private modalInstancia:any;

    usuarios = signal<Usuario[]>([]);
    cargando = signal<boolean>(true);
    columnasUsuarios: ColumnaTabla[] = [
      //{ prop: 'id', name: 'ID', width: 70 },
      { prop: 'nombre', name: 'Nombre' },
      { prop: 'correo', name: 'Correo' }, 
      { prop: 'userName', name: 'Usuario' },
      { prop: 'rol', name: 'Rol' },
      { prop: 'area', name: 'Área' },
      { prop:'acciones', name:'Acciones', width:130, type:'actions', acciones:[
        { clave: 'editar', icono: 'bi bi-pencil-fill', colorClass: 'btn-outline-primary', titulo: 'Editar' },
        { clave: 'eliminar', icono: 'bi bi-trash-fill', colorClass: 'btn-outline-danger', titulo: 'Eliminar' }
        ]
      }
    ];

    ngOnInit():void{
      this.cargarTablaUsuarios();
    }

    abrirModalCrear():void{
      this.esEdicion.set(false);
      this.limpiarFormulario();
      this.mostrarModal();
    }

    abrirModalEditar(usuario:Usuario):void{
      this.esEdicion.set(true);
      this.intentoGuardar.set(false);
      this.user.set({ ...usuario, password:'',confirmaPassword:''});
      this.mostrarModal();
    }

    private mostrarModal():void{
      const elModal = document.getElementById('usuarioModal');
      if(elModal){
        this.modalInstancia = new bootstrap.Modal(elModal);
        this.modalInstancia.show();
      }
    }

    cerrarModal():void{
      if(this.modalInstancia){
        this.modalInstancia.hide();
      }
      this.limpiarFormulario();
    }

    
    manejarAccionTabla(evento: EventoAccionTabla<Usuario>):void{
      switch(evento.accion){
        case 'editar':
          this.abrirModalEditar(evento.fila);
          break;
        case 'eliminar':
          this.confirmarEliminacion(evento.fila);
          break;

      }
    }
    // alta-usuario.ts

    async confirmarEliminacion(usuario:Usuario): Promise<void> {
      if (!usuario.id) return;

      // 1. Lanzamos la alerta y esperamos la respuesta del usuario
      const confirmado = await mensajeConfirmacion(
        '¿Eliminar usuario?',
        `¿Estás seguro de eliminar a "${usuario.nombre}"? Esta acción no se puede deshacer.`,
        'Sí, eliminar',
        'Cancelar'
      );

      // 2. Si el usuario presiona 'No' o cancela, no hacemos nada
      if (!confirmado) return;

      // 3. Si presionó 'Sí', ejecutamos el borrado hacia la API
      this.usuarioService.eliminarUsuario(usuario.id).subscribe({
        next: (respuesta) => {
          mensajeExito("Eliminado", respuesta.mensaje || "Usuario eliminado correctamente.");
          this.cargarTablaUsuarios(); // Recarga la tabla
        },
        error: (err) => {
          console.error('Error al eliminar:', err);
          mensajeError("Error", "No se pudo eliminar el usuario.");
        }
      });
    }

    cargarTablaUsuarios(): void{
      this.cargando.set(true);
      this.usuarioService.obtenerUsuario().subscribe({
        next:(respuesta)=>{
          this.usuarios.set(respuesta);
          this.cargando.set(false);
        },
        error:()=> this.cargando.set(false)
      });
    }

    esInvalido(valor: string): boolean {
      return this.intentoGuardar() && !valor.trim();
    }

    passwordsNoCoinciden(): boolean {
      const pass = this.userForm.password?.().value() || '';
      const confirma = this.userForm.confirmaPassword?.().value() || '';
      if (this.esEdicion() && pass.length === 0 && confirma.length === 0) {
        return false;
      }
      return (this.intentoGuardar() || confirma.length > 0) && pass !== confirma;
    }

    limpiarFormulario(){
      this.user.set({...usuarioInicial});
      this.intentoGuardar.set(false);
    }

    async guardar(event: Event): Promise<void>{
      event.preventDefault();
      this.intentoGuardar.set(true);
      const datos = this.user();
      let hayVacios = false;

      for (const campo in datos) {
        const valor = (datos as any)[campo];
        if (this.esEdicion() && (campo === 'password' || campo === 'confirmaPassword')) {
          continue;
        }
        if (typeof valor === 'string' && valor.trim() === '' && campo !== 'id') {
          hayVacios = true;
          break;
        }
      }

      if(hayVacios){
        mensajeAlerta("Campos requeridos","Algunos campos estan vacios,estan resaltados");
        return;
      }
      const pass = datos.password?.trim() || '';
      const confirma = datos.confirmaPassword?.trim() || '';

      if (this.esEdicion()) {
        // Si escribió algo en password, exigir que coincidan
        if (pass.length > 0 && pass !== confirma) {
          mensajeAlerta("Contraseñas no coinciden", "La nueva contraseña y su confirmación deben ser idénticas.");
          return;
        }
      } else {
        if (pass !== confirma) {
          mensajeAlerta("Contraseñas no coinciden", "La contraseña y su confirmación deben ser idénticas.");
          return;
        }
      }

      if(this.esEdicion()){
        if(!datos.id)return;
        const confirmado = await mensajeConfirmacion(
            '¿Actualizar registro?',
            `¿Deseas guardar los cambios para el usuario "${datos.nombre}"?`,
            'Sí, actualizar',
            'Cancelar'
          );

        if (!datos.id) return;
        this.usuarioService.actualizarUsuario(datos.id, datos).subscribe({
        next: (respuesta) => {
          mensajeExito("Actualizado", respuesta.mensaje || "Usuario actualizado correctamente");
          this.cerrarModal();
          this.cargarTablaUsuarios();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          mensajeError("Error", "Ocurrió un problema al actualizar el usuario.");
        }
      });
  
      }else{
        const usuario = this.user();
        console.log("Datos a enviar", usuario);
        const confirmado = await mensajeConfirmacion(
          '¿Registrar usuario?',
          `¿Deseas registrar al usuario "${datos.nombre}" en el sistema?`,
          'Sí, guardar',
          'Cancelar'
        );

        if (!confirmado) return;
        this.usuarioService.crearUsuario(datos).subscribe({
          next:(respuesta)=>{
            console.log("net core", respuesta);
            mensajeExito("listo",respuesta.mensaje);
            this.cerrarModal();
            this.cargarTablaUsuarios();
          },
          error:(error) =>{
            console.error('Error al conectar con la API:', error);
          mensajeError("Error", "Ocurrió un problema al conectar con el servidor.");
          }
        })
      }

    }

  }

  