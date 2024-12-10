import { Types } from "mongoose";
import { WebSocket } from "ws";

export interface GroupChatMessages {
  groupChat: Types.ObjectId | string;
  author: Types.ObjectId | string;
  message: string;
  createdAt: Date;
  isRead: Array<{ user: string; read: boolean }>;
}

export type IncomingMessage =
  | {
      type: "LOGIN";
      payload: string;
    }
  | {
      type: "JOIN_GROUP";
      payload: { groupChatId: string };
    }
  | {
      type: "SEND_MESSAGE";
      payload: { groupChatId: string; message: string };
    }
  | {
      type: "MARK_READ";
      payload: { messageId: string; groupChatId: string };
    };

export interface ConnectedClients {
  [userId: string]: {
    userName: string;
    clients: WebSocket[];
    groups: string[];
  };
}
