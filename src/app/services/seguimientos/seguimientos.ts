import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Seguimiento } from '../../models/tickets.model';
import { Observable } from 'rxjs';

@Injectable({ providedIn:'root'})
export class SeguimientosService {

    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7193/api/Seguimientos';

     obtenerSeguimientos(ticketId: number): Observable<Seguimiento[]> {
        return this.http.get<Seguimiento[]>(`${this.apiUrl}/ticket/${ticketId}`);
    }
     crearSeguimiento(seguimiento: Seguimiento): Observable<any> {
        return this.http.post(this.apiUrl,seguimiento);
    }

    actualizarSeguimiento(seguimiento: Seguimiento): Observable<any> {
         return this.http.put(`${this.apiUrl}/${seguimiento.id}`,seguimiento);
    }

    eliminarSeguimiento(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
