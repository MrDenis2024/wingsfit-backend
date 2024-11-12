import { Types } from "mongoose";

export interface ClientTypes {
  user: Types.ObjectId | string;
  subscribes: Types.ObjectId[];
  preferredWorkoutType: string;
  trainingLevel: string;
  physicalData: string;
}
