import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { HomePage } from './pages/home-page/home-page';
import { AltaUsuario } from './features/alta-usuario/alta-usuario';
import { authGuard } from './guards/auth-guard';
import { TicketsView } from './pages/tickets-view/tickets-view';
import { EscaladosTicket } from './pages/escalados-ticket/escalados-ticket';
import { InstalacionesView } from './pages/instalaciones-view/instalaciones-view';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'home',
    component: HomePage,
    canActivate:[authGuard]
  },
  {
    path: 'alta-usuario',
    component: AltaUsuario,
    canActivate:[authGuard]
  },
  {
    path:'tickets',
    component:TicketsView,
    canActivate:[authGuard]
  },
  {
    path:'escalados',
    component:EscaladosTicket,
    canActivate:[authGuard]
  },
  {
    path:'instalacion',
    component:InstalacionesView,
    canActivate:[authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
