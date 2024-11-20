import {Types} from "mongoose";

export interface PrivateChatMessagesTypes {
    privateChat: Types.ObjectId | string;
    author: Types.ObjectId | string;
    message: string;
    createdAt: Date;
    isRead: Array<{ user: string; read: boolean }>;
}