import { Types } from "mongoose";

export interface ClientTypes {
  user: Types.ObjectId | string;
  subscribes: Types.ObjectId[];
  preferredWorkoutType: Types.ObjectId[];
  trainingLevel: string;
  physicalData: string;
}
