import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { ActualizarEscalado, Escalados, Seguimiento } from '../../models/tickets.model';

@Injectable({providedIn:'root'})
export class EscladosService {

    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7193/api/Escalados';

    obtemerEscalados():Observable<Escalados[]>{
        return this.http.get<Escalados[]>(`${this.apiUrl}/obtenerEscalados`);
    }
    obtenerEscaladoPorId(id: number): Observable<Escalados> {
        return this.http.get<Escalados>(`${this.apiUrl}/${id}`);
    }
    guardarSolucion(solucion: ActualizarEscalado):Observable<any> {
        return this.http.put(`${this.apiUrl}/${solucion.id}`,solucion);
    }
    
}
