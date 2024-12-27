import { Types, Document } from "mongoose";

export interface GroupChatMessages extends Document {
  groupChat: Types.ObjectId | string;
  author: Types.ObjectId | string;
  message: string;
  createdAt: Date;
  isRead: Array<{ user: string; read: boolean }>;
}