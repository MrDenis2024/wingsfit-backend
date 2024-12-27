import { Types, Document } from "mongoose";

export interface PrivateMessagesTypes extends Document {
  privateChat: Types.ObjectId | string;
  author: Types.ObjectId | string;
  message: string;
  createdAt: Date;
  isRead: Array<{ user: string; read: boolean }>;
}
