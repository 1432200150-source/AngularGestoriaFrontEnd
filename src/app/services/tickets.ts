import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service, signal } from '@angular/core';
import { Cliente, Seguimiento, ticket } from '../models/tickets.model';
import { Observable } from 'rxjs';

@Injectable({providedIn:'root'})
export class TicketsService {
    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7193/api/Tickets';

    
    crearTicket(nuevoTicket: ticket): Observable<any> {
        return this.http.post<any>(this.apiUrl, nuevoTicket);
    }

    autocomplete(texto:string):Observable<Cliente[]>{
        return this.http.get<Cliente[]>(`${this.apiUrl}/autocomplete`, { params: { texto } });
    }

    obtenerTickets(): Observable<ticket[]>{
        return this.http.get<ticket[]>(`${this.apiUrl}/obtenerTickets`);
    }

    

    actualizarTicket(ticket: ticket){
        
        return this.http.put<any>(`${this.apiUrl}/${ticket.id}`, ticket);
    }
    // seguimientos

    
}
