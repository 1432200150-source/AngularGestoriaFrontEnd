import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Login } from '../models/login.model';
import { Observable } from 'rxjs';
import { LoginResponse } from '../models/login-response.model';
import { signal } from '@angular/core';
@Injectable({
    providedIn:'root'
})
export class Auth{
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7193/api/auth';

    sesion = signal<boolean>(
        this.estaAutenticado()
    );

    login(login: Login): Observable<LoginResponse> {

        return this.http.post<LoginResponse>(
            `${this.apiUrl}/login`,
            login
        );
    }
    guardarSesion(respuesta:LoginResponse):void{
        localStorage.setItem('token',respuesta.token);

        localStorage.setItem('usuario',JSON.stringify(respuesta.usuario));

        this.sesion.set(true);
    }

    obtenerToken():string|null{
        return localStorage.getItem('token');
    }

    obtenerUsuario():any{
        const usuario = localStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario):null;
    }

    estaAutenticado():boolean{
        const token = this.obtenerToken();

        if (!token) return false;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiracion = payload.exp * 1000;

        return Date.now() < expiracion;
    }

    cerrarSesion(): void{
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        this.sesion.set(false);
    }
}
