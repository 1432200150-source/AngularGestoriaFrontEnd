import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage {
  autService = inject(Auth);
  usuario = signal<string>('');

  constructor(){
    const userData = this.autService.obtenerUsuario();
    this.usuario.set(userData?.nombre || 'Invitado');
  }
}
