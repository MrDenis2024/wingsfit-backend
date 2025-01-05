import { Types } from "mongoose";

export interface ClientTypes {
  user: Types.ObjectId | string;
  preferredWorkoutType: Types.ObjectId[];
  trainingLevel: string;
  physicalData: string;
}
