import { Types } from "mongoose";

export interface GroupsTypes {
  title: string;
  course: Types.ObjectId | string;
  clients: Types.ObjectId[];
  startTime: string;
  trainingLevel: string;
  scheduleLength: number;
  maxClients: number;
}
