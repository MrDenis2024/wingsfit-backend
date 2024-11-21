import {Types} from "mongoose";


export interface GroupChatMessages {
    groupChat: Types.ObjectId | string;
    author: Types.ObjectId | string;
    message: string;
    createdAt: Date;
    isRead: Array<{ user: string; read: boolean }>;
}