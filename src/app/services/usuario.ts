import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {  Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private http = inject(HttpClient);
  
  // 🔗 Coloca la URL exacta que te dio Visual Studio 2026
  private apiUrl = 'https://localhost:7193/api/usuarios';

  // Método para enviar el usuario a la API de .NET
  crearUsuario(usuario: Usuario): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuario);
  }

  obtenerUsuario(): Observable<Usuario[]>{
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  actualizarUsuario(id: number,usuario:Usuario):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/${id}`, usuario);
  }

  eliminarUsuario(id: number):Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
