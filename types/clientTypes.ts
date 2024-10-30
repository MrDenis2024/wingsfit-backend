import { Types } from "mongoose";

export interface ClientTypes {
  user: Types.ObjectId | string;
  firstName: string;
  lastName: string;
  health: string;
  gender: string;
  age: number;
  subscribes: Types.ObjectId[];
  avatar: string;
  timeZone: string;
}
