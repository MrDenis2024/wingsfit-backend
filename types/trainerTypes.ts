import { Types } from "mongoose";

export interface Certificates {
  _id: Types.ObjectId;
  title: string;
  image: string;
}

export interface TrainerTypes {
  user: Types.ObjectId | string;
  courseTypes: Types.ObjectId[];
  specialization: string;
  experience: string;
  certificates: Certificates[];
  description: string;
  availableDays: string;
  rating: number;
}
