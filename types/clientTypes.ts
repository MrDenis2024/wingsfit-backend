import { Types } from "mongoose";

export interface ClientTypes {
  user: Types.ObjectId | string;
  gender: string;
  dateOfBirth: Date;
  subscribes: Types.ObjectId[];
  timeZone: string;
  preferredWorkoutType: string;
  trainingLevel: string;
  physicalData: string;
}
