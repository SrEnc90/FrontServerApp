import { Status } from "../enum/status.enum";

export interface Server {
    /* 
    ! OJO: Debe respetar la mayúsculas y minúsculas de como llega en formato json para que haga match 
    */
    id: number;
    ipAddress: string;
    name: string;
    memory: string;
    type: string;
    imageURl: string;
    status: Status;
}