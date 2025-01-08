import express from "express";
import GroupChatMessage from "../models/GroupChatMessages";
import User from "../models/User";
import GroupChat from "../models/GroupChat";
import { ConnectedClients, IncomingMessage } from "../types/wsChatsTypes";
import PrivateMessage from "../models/PrivateMessage";
import PrivateChat from "../models/PrivateChat";
import { GroupChatMessages } from "../types/groupChatMessagesTypes";
import { PrivateMessagesTypes } from "../types/privateMessagesTypes";

const createChatRouter = () => {
  const chatRouter = express.Router();

  const connectedClients: ConnectedClients = {};

  const sendToClients = (
    chatId: string,
    chatType: "group" | "private",
    message: unknown,
  ) => {
    console.log("Sending message to clients:", { chatId, chatType, message });
    const chatClients = Object.values(connectedClients)
      .filter((client) =>
        chatType === "group"
          ? client.groups.includes(chatId)
          : client.privateChats.includes(chatId),
      )
      .flatMap((client) => client.clients);

    console.log("Chat clients to send to:", chatClients.length);

    chatClients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  };

  const fetchMessages = async (
    chatId: string,
    chatType: string,
    page = 1,
    limit = 20,
  ) => {
    const skip = (page - 1) * limit;
    let messages;

    if (chatType === "group") {
      messages = await GroupChatMessage.find({ groupChat: chatId })
        .populate("author", "firstName lastName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    } else if (chatType === "private") {
      messages = await PrivateMessage.find({ privateChat: chatId })
        .populate("author", "firstName lastName avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
    }
    return messages;
  };

  chatRouter.ws("/:chatId/:chatType/:userId", async (ws, req) => {
    const { chatId, chatType, userId } = req.params;
    console.log(`New WebSocket connection: chatId=${chatId}, chatType=${chatType}, userId=${userId}`);

    if (!["group", "private"].includes(chatType)) {
      ws.send(JSON.stringify({ type: "ERROR", payload: "Invalid chat type" }));
      return ws.close();
    }

    // let userId: string;
    let userName: string;

    ws.on("message", async (message) => {
      console.log("Received message:", message.toString());

      try {
        const decodedMessage = JSON.parse(
          message.toString(),
        ) as IncomingMessage;

        switch (decodedMessage.type) {
          case "LOGIN":
            const token = decodedMessage.payload;
            const user = await User.findOne({ token });
            if (!user) {
              ws.send(
                JSON.stringify({ type: "ERROR", payload: "Invalid Token" }),
              );
              return ws.close();
            }
            // userId = user._id.toString();
            userName = user.firstName;

            console.log("User logged in:", { userId, userName });

            if (!connectedClients[userId]) {
              connectedClients[userId] = {
                userName,
                clients: [ws],
                groups: [],
                privateChats: [],
              };
              console.log("user was added:", userId);
            } else {
              connectedClients[userId].clients.push(ws);
            }

            console.log("Current connectedClients:", connectedClients);


            ws.send(
              JSON.stringify({
                type: "LOGIN_SUCCESS",
                payload: { userName, userId },
              }),
            );
            break;

          case "JOIN_CHAT":
            console.log("Join chat___ user", userId);

            if (chatType === "group") {
              const groupChat = await GroupChat.findById(chatId);
              if (!groupChat) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    payload: "Group Chat not found",
                  }),
                );
                return;
              }
              connectedClients[userId].groups.push(chatId);

              await GroupChatMessage.updateMany(
                {
                  groupChat: chatId,
                  "isRead.user": { $ne: userId },
                  author: { $ne: userId },
                },
                {
                  $addToSet: {
                    isRead: { user: userId, read: true },
                  },
                },
              );

              const latestMessages = await fetchMessages(
                chatId,
                chatType,
                1,
                20,
              );

              ws.send(
                JSON.stringify({
                  type: "CHAT_MESSAGES",
                  payload: {
                    chatId,
                    chatType: "group",
                    chatName: groupChat.title,
                    latestMessages,
                  },
                }),
              );
            } else if (chatType === "private") {
              const privateChat = await PrivateChat.findById(chatId);
              if (!privateChat) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    payload: "Private Chat not found",
                  }),
                );
                return;
              }
              console.log(userId);
              console.log(typeof userId);

              connectedClients[userId].privateChats.push(chatId);

              await PrivateMessage.updateMany(
                {
                  privateChat: chatId,
                  "isRead.user": userId,
                  "isRead.read": false,
                },
                {
                  $set: {
                    "isRead.read": true,
                  },
                },
              );

              const latestMessages = await fetchMessages(
                chatId,
                chatType,
                1,
                20,
              );

              ws.send(
                JSON.stringify({
                  type: "CHAT_MESSAGES",
                  payload: {
                    chatId,
                    chatType: "private",
                    latestMessages,
                  },
                }),
              );
            }
            break;

          case "SEND_MESSAGE":
            if (
              (chatType === "group" &&
                connectedClients[userId].groups.includes(chatId)) ||
              (chatType === "private" &&
                connectedClients[userId].privateChats.includes(chatId))
            ) {
              let newMessage: GroupChatMessages | PrivateMessagesTypes;

              if (chatType === "group") {
                newMessage = await GroupChatMessage.create({
                  groupChat: chatId,
                  author: userId,
                  message: decodedMessage.payload.message,
                });
                newMessage = await newMessage.populate(
                  "author",
                  "firstName lastName avatar",
                );
              } else {
                const privateChat = await PrivateChat.findById(chatId);

                if (!privateChat) {
                  ws.send(
                    JSON.stringify({
                      type: "ERROR",
                      payload: "Private Chat not found",
                    }),
                  );
                  return;
                }

                const receiverId = privateChat.availableTo.find(
                  (participantId) => participantId.toString() !== userId,
                );

                newMessage = await PrivateMessage.create({
                  privateChat: chatId,
                  author: userId,
                  message: decodedMessage.payload.message,
                  isRead: { user: receiverId, read: false },
                });
                newMessage = await newMessage.populate(
                  "author",
                  "firstName lastName avatar",
                );
              }

              sendToClients(chatId, chatType as "group" | "private", {
                type: "NEW_MESSAGE",
                payload: newMessage,
              });
            } else {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  payload: "You are not part of this chat",
                }),
              );
            }
            break;
          default:
            ws.send(
              JSON.stringify({
                type: "ERROR",
                payload: "Unsupported message type",
              }),
            );
        }
      } catch (error) {
        console.error(error);
        ws.send(JSON.stringify({ type: "ERROR", payload: `Invalid message: ${error}` }));
      }
    });
    ws.on("close", () => {
      console.log("WebSocket connection closed:", userId);
      const user = connectedClients[userId];
      const currentConnectionIndex = user.clients.indexOf(ws);
      user.clients.splice(currentConnectionIndex, 1);
      if (user.clients.length === 0) {
        delete connectedClients[userId];
        console.log("User removed from connectedClients:", userId);
      }
    });
  });
  return chatRouter;
};

export default createChatRouter;
