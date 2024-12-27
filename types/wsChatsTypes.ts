import { WebSocket } from "ws";

export interface ConnectedClients {
  [userId: string]: {
    userName: string;
    clients: WebSocket[];
    groups: string[];
    privateChats: string[];
  };
}

export type IncomingMessage =
  | {
  type: "LOGIN";
  payload: string;
} | {
  type: "LOGIN_SUCCESS";
  payload: { userName: string; userId: string };
} | {
  type: "CHAT_MESSAGES";
  payload: {
    chatId: string;
    chatType: "group" | "private";
    chatName?: string;
    latestMessages: unknown[];
  };
}
  | {
  type: "JOIN_CHAT";
  payload: { chatId: string; chatType: "group" | "private" };
}
  | {
  type: "SEND_MESSAGE";
  payload: {
    chatId: string;
    chatType: "group" | "private";
    message: string;
  };
} | {
  type: "NEW_MESSAGE";
  payload: string;
}
  | {
  type: "MARK_READ";
  payload: {
    messageId: string;
    chatId: string;
    chatType: "group" | "private";
  };
} | {
  type: "ERROR";
  payload: string;
};