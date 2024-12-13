import { Types } from "mongoose";
import { WebSocket } from "ws";


export interface PrivateChatTypes {
  firstPerson: Types.ObjectId | string;
  secondPerson: Types.ObjectId | string;
  availableTo: [Types.ObjectId | string, Types.ObjectId | string];
}

export interface ConnectedClientsToPrivateChat {
  [userId: string]: {
    userName: string;
    clients: WebSocket[];
  };
}
