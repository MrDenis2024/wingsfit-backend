import {Types} from "mongoose";

export interface PrivateMessagesTypes {
  privateChat: Types.ObjectId | string;
  author: Types.ObjectId | string;
  message: string;
  createdAt: Date;
  isRead: Array<{ user: string; read: boolean }>;
}

export type PrivateChatIncomingMessage =
  | {
  type: "LOGIN";
  payload: {
    token: string;
  };
}
  | {
  type: "JOIN_PRIVATE_CHAT";
  payload: {
    privateChatId: string;
  };
}
  | {
  type: "SEND_MESSAGE";
  payload: {
    privateChatId: string;
    message: string;
  };
} | {
  type: "MARK_READ";
  payload: { messageId: string; privateChatId: string };
};
