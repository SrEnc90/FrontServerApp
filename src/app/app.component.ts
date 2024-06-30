import { Component, OnInit } from '@angular/core';
import { ServerService } from './service/server.service';
import { BehaviorSubject, Observable, catchError, map, of, startWith } from 'rxjs';
import { AppState } from './interface/app-state';
import { CustomResponse } from './interface/custom-response';
import { DataState } from './enum/data-state.enum';
import { Status } from './enum/status.enum';
import { NgForm } from '@angular/forms';
import { Server } from './interface/server';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  appState$: Observable<AppState<CustomResponse>>;
  readonly DataState = DataState;
  readonly Status = Status;
  /*
  ! BehaviorSubject es útil en Angular cuando se necesita un flujo de datos en tiempo real que pueda compartirse y al que los componentes y servicios puedan suscribirse para recibir actualizaciones de manera eficiente.
  ! <string>: Indica el tipo de datos que se emitirá a través del sujeto. En este caso, es un BehaviorSubject que emitirá valores de tipo string. (''): Es el valor inicial que se asigna al BehaviorSubject.
  */
  private filterSubject = new BehaviorSubject<string>('');
  filterStatus$ = this.filterSubject.asObservable();

  private dataSubject = new BehaviorSubject<CustomResponse>(null); //! Va a servir para modificar el estado al hacer ping

  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor(private serverService : ServerService) {  }

  ngOnInit(): void {
    this.appState$ = this.serverService.servers$
    .pipe(
      map(response => {
        this.dataSubject.next(response);
        return {dataState: DataState.LOADED_STATE, appData: { ...response, data: {servers: response.data.servers.reverse()} }}
      }),
      startWith({ dataState: DataState.LOADING_STATE }), //Toma un tiempo el que traiga la data por lo que mientras tanto el estado empieza con LOADING_STATE, y appData = null(como es opcional se puede omitir)
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  pingServer(ipAddress: string): void {
    this.filterSubject.next(ipAddress);
    this.appState$ = this.serverService.ping$(ipAddress)
    .pipe(
      map(response => {
        
        //! this.dataSubject.value.data.servers[2] Si te das cuenta es un array dónde voy a modificar solo el servidor que hacemos ping(x eso la condición)
        /*
        this.dataSubject.value.data.servers[
          this.dataSubject.value.data.servers.findIndex(server => 
            { server.id === response.data.server.id }) //El findIndex solo me va a retornar el index 
        ] = response.data.server;
        */
        //! OTRA FORMA DE HACER LO DE ARRIBA
        const index = this.dataSubject.value.data.servers.findIndex(server => server.id === response.data.server.id);
        this.dataSubject.value.data.servers[index] = response.data.server;

        this.filterSubject.next(''); //! Una vez que actualizamos el estado del servidor, al filterSubject le asignamos su valor por defecto para que deje de mostrar el spinner
        return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }), //Toma un tiempo el que traiga la data por lo que mientras tanto el estado empieza con LOADING_STATE, y appData = null(como es opcional se puede omitir)
      catchError((error: string) => {
        this.filterSubject.next('');
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  saveServer(serverForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.serverService.save$(serverForm.value as Server) //! Representa los valores que pasamos en el formulario pero en formato json
    .pipe(
      map(response => {
        this.dataSubject.next(
          { ...response, data: { servers: [response.data.server, ...this.dataSubject.value.data.servers] } } //! Estamos sobreescribiendo la variable data de dataSubject. Ponemos en el índice 0 del array el nuevo registro creado para que aparezca primero en la ui
        );
        document.getElementById('closeModal').click();
        this.isLoading.next(false);
        serverForm.resetForm({ status: this.Status.SERVER_DOWN }) //! vamos a resetear el modal pero que se muestre por defecto el estado server down
        return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }), //Toma un tiempo el que traiga la data por lo que mientras tanto el estado empieza con LOADING_STATE, y appData = null(como es opcional se puede omitir)
      catchError((error: string) => {
        this.isLoading.next(false);
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  deleteServer(server: Server): void {
    this.appState$ = this.serverService.delete$(server.id)
    .pipe(
      map(response => {
        this.dataSubject.next(
          {...response, data: 
            { servers: this.dataSubject.value.data.servers.filter(srv => srv.id !== server.id) }}
        )
        return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }), //Toma un tiempo el que traiga la data por lo que mientras tanto el estado empieza con LOADING_STATE, y appData = null(como es opcional se puede omitir)
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }

  printReport(): void {
    //window.print(); //! función por defecto que trae los buscadores para que te muestre la ventana de imprimir y lo guardemos como pdf
    let dataType = 'application/vnd.ms-excel.sheet.macroEnabled.12';
    let tableSelect = document.getElementById('servers');
    let tableHtml = tableSelect.outerHTML.replace(/ /g, '%20%'); //!  La propiedad outerHTML devuelve el contenido HTML del elemento junto con la etiqueta que lo rodea. reemplazar todos los espacios "/ /g" en blanco por "%20%"
    let downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = 'data:' + dataType + ', ' + tableHtml;
    downloadLink.download = 'server-report.xls';
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  filterServers(status: string): void {
    this.appState$ = this.serverService.filter$(<Status>status, this.dataSubject.value)
    .pipe(
      map(response => {
        return { dataState: DataState.LOADED_STATE, appData: response }
      }),
      startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
      catchError((error: string) => {
        return of({ dataState: DataState.ERROR_STATE, error });
      })
    );
  }
}
