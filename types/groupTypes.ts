import { Types } from "mongoose";

export interface SubscribeTypes {
  client: Types.ObjectId | string;
  addedAt?: Date;
  subscribeEnd: Date;
  status: string;
  frozenAt?: Date;
}

export interface GroupsTypes {
  title: string;
  course: Types.ObjectId;
  clients: SubscribeTypes[];
  startTime: string;
  trainingLevel: string;
  scheduleLength: number;
  maxClients: number;
}
