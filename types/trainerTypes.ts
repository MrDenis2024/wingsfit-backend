import { Types } from "mongoose";

export interface TrainerTypes {
  user: Types.ObjectId | string;
  timeZone: string;
  courseTypes: string[];
  specialization: string;
  experience: string;
  certificates: string;
  description: string;
  availableDays: string;
  rating: number;
}
