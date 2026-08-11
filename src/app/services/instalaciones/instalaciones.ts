import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Aduana } from '../../models/instalacion.model';

@Injectable({ providedIn:'root'})
export class InstalacionesService {

    private http = inject(HttpClient);
    private apiUrl = 'https://localhost:7193/api/Instalacion';

    obtenerAduanas():Observable<Aduana[]>{
        return this.http.get<Aduana[]>(`${this.apiUrl}/aduanas`);
    }


}
