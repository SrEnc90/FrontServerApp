import { Server } from "./server";

export interface CustomResponse {
    timeStamp: Date;
    statusCode: number;
    status: string;
    reason: string;
    message: string;
    developerMessage: string;
    data: {servers?: Server[], server?: Server} //Con ? Estamos diciendo que van a ser opcionales(O bien puede devolver una lista o sino un solo registro)
}