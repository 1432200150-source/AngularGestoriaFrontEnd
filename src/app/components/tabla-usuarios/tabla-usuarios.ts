import { Component } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
  selector: 'app-tabla-usuarios',
  standalone: true,
  imports: [NgxDatatableModule],
  templateUrl: './tabla-usuarios.html',
  styleUrl: './tabla-usuarios.css',
})
export class TablaUsuarios  {}
