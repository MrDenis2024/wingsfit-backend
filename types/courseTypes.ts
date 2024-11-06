import { Types } from "mongoose";

export interface CourseTypes {
  user: Types.ObjectId | string;
  title: string;
  description: string;
  format: string;
  schedule: string[];
  price: number;
  image: string;
  maxClients: number;
}
