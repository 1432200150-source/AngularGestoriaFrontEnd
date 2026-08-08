import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { NgbCollapseModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { Auth } from '../../services/auth';
@Component({
  selector: 'app-navbar',
  imports: [RouterLink,RouterLinkActive,NgbCollapseModule,NgbDropdownModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isCollapsed = true;

  private authService = inject(Auth);
  private router = inject(Router);

  usuario = this.authService.obtenerUsuario();

  cerrarSesion():void{
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
