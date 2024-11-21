import { Types } from "mongoose";

export interface PrivateChatTypes {
  firstPerson: Types.ObjectId | string;
  secondPerson: Types.ObjectId | string;
  availableTo: [Types.ObjectId | string, Types.ObjectId | string];
}
