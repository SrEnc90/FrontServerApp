import { DataState } from "../enum/data-state.enum";

export interface AppState<T> {
    dataState: DataState;
    appData?: T;
    error?: string;
    /*
    ! Tanto appData y error, son opcionales porque no va a devolver ambos, ya que si está correcto no me devuelve error, pero si hay no me va a devolver la data  
    */
}