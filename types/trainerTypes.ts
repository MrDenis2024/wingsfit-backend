import { Types } from "mongoose";

export interface TrainerTypes {
  user: Types.ObjectId | string;
  courseTypes: Types.ObjectId[];
  specialization: string;
  experience: string;
  certificates: string;
  description: string;
  availableDays: string;
  rating: number;
}
