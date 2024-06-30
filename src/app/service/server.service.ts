import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subscriber, catchError, tap, throwError } from 'rxjs';
import { CustomResponse } from '../interface/custom-response';
import { Server } from '../interface/server';
import { Status } from '../enum/status.enum';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private readonly apiUrl: string = `http://localhost:8092`;

  constructor(private http : HttpClient) { } //Estamos haciendo inyección de depedencia con httpClient

  // getServers(): Observable<CustomResponse> {
  //   return this.http.get<CustomResponse>(`http://localhost:8080/server/list`);
  // }

  //! Otra forma:(Ojo: cuándo se utiliza observable es buena práctica terminar el método con el signo $)
  servers$ = <Observable<CustomResponse>> this.http.get<CustomResponse>(`${this.apiUrl}/server/list`)
  .pipe(
    tap(console.log), //! Indicamos que la respuesta se va a imprimir en la consola
    catchError(this.handleError) //! Indicamos que el error va hacer atrapado y se le pasará al método handleError
  )

  save$ = (server: Server) => 
  <Observable<CustomResponse>> this.http.post<CustomResponse>(`${this.apiUrl}/server/save`, server)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  )

  ping$ = (ipAddress: string) => 
  <Observable<CustomResponse>> this.http.get<CustomResponse>(`${this.apiUrl}/server/ping/${ipAddress}`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  )

  filter$ = (status: Status, response: CustomResponse) => <Observable<CustomResponse>>
  new Observable<CustomResponse>( //! estoy usando el constructor del observable
    Subscriber => {
      console.log(response);
      Subscriber.next(
        status === Status.ALL ? {...response, message: `Servers filtered by ${status} status`} :
        {
          ...response,
          message: response.data.servers
            .filter(server => server.status === status).length > 0 ? `Servers filtered by
            ${status === Status.SERVER_UP ? 'SERVER UP' : 'SERVER DOWN'}` : `No servers of ${status} found`,
              data: { // Creo que está actualizando la propiedad data.servers con la lista filtrada de servidores para mostrasela al usuario
                servers: response.data.servers
                .filter(server => server.status === status)    
              }
        }
      );

      Subscriber.complete();
      
    }
  )

  delete$ = (serverId: number) => 
  <Observable<CustomResponse>> this.http.delete<CustomResponse>(`${this.apiUrl}/server/delete/${serverId}`)
  .pipe(
    tap(console.log),
    catchError(this.handleError)
  )

  private handleError(error: HttpErrorResponse) : Observable<never> {
    console.log(error);
    return throwError(`An error occured - Error code: ${error.status}`);
  }

}
