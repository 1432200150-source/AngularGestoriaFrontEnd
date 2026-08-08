import { Component, inject, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Login } from '../../models/login.model';
import { mensajeAlerta, mensajeError } from '../../utils/mensajes.utils';
const loginInicial:Login={
    username:'',
    password:''
  };
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormField],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  
  private autService = inject(Auth);
  private router = inject(Router);

  login = signal<Login>({...loginInicial});

  loginForm=form(this.login);

  intentoGuardar = signal(false);

  ingresar (event:Event):void{
    event.preventDefault();
    this.intentoGuardar.set(true);
    const datos = this.login();
    if (datos.username.trim() === '' ||datos.password.trim() === '') {
      mensajeAlerta('Campos requeridos','Ingrese usuario y contraseña.');
      return;
    }

    this.autService.login(datos).subscribe({
      next:(res)=>{
        this.autService.guardarSesion(res);
       
        this.router.navigate(['/home']);
      }, error:(error)=>{
        console.error(error);
        mensajeError("Acceso denegado","usuario o contraseña invalido");
      }
    });
  }


}
