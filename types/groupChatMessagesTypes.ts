import {Types} from "mongoose";


export interface GroupChatMessages {
    groupChat: Types.ObjectId | string;
    author: string;
    message: string;
    createdAt: string;
    isRead: Array<{ user: string; read: boolean }>;
}