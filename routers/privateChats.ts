import express from "express";
import { ConnectedClientsToPrivateChat } from "../types/privateChatTypes";
import PrivateChat from "../models/PrivateChat";
import User from "../models/User";
import PrivateMessage from "../models/PrivateMessage";
import { PrivateChatIncomingMessage } from "../types/privateMessagesTypes";

const createPrivateChatRouter = () => {
  const privateChatsRouter = express.Router();
  const connectedClients: ConnectedClientsToPrivateChat = {};

  const sendToPrivateClients = (message: unknown) => {
    const chatClients = Object.values(connectedClients).flatMap(
      (client) => client.clients,
    );

    chatClients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  };

  privateChatsRouter.ws("/:idSender/:idReceiver", async (ws, req) => {
    const senderId = req.params.idSender;
    const receiverId = req.params.idReceiver;

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver || !sender) {
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: "Receiver or sender not found",
        }),
      );
      return ws.close();
    }

    let chat = await PrivateChat.findOne({
      availableTo: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      chat = await PrivateChat.create({
        firstPerson: receiver._id,
        secondPerson: sender._id,
        availableTo: [receiver._id, sender._id],
      });
    }

    ws.on("message", async (message) => {
      try {
        const decodedMessage = JSON.parse(
          message.toString(),
        ) as PrivateChatIncomingMessage;

        switch (decodedMessage.type) {
          case "LOGIN":
            const userName = sender.firstName;

            const token = decodedMessage.payload;
            const user = await User.findOne({ token });
            if (!user) {
              ws.send(
                JSON.stringify({ type: "ERROR", payload: "Invalid Token" }),
              );
              return ws.close();
            }

            if (!connectedClients[senderId]) {
              connectedClients[senderId] = {
                userName,
                clients: [ws],
              };
            } else {
              connectedClients[senderId].clients.push(ws);
            }

            ws.send(
              JSON.stringify({
                type: "LOGIN_SUCCESS",
                payload: { userName, senderId },
              }),
            );

            await PrivateMessage.updateMany(
              {
                privateChat: chat._id,
                "isRead.user": { $ne: receiver._id },
                author: { $ne: receiver._id },
              },
              {
                $addToSet: {
                  isRead: {
                    user: receiver._id,
                    read: true,
                  },
                },
              },
            );

            const updatedReadMessages = await PrivateMessage.find({
              privateChat: chat._id,
              "isRead.user": receiver._id,
            }).populate("author", "firstName lastName");

            sendToPrivateClients({
              type: "MESSAGES_READ",
              payload: updatedReadMessages,
            });

            const latestMessages = await PrivateMessage.find({
              privateChat: chat._id,
            })
              .populate("author", "firstName lastName")
              .sort({ createdAt: 1 })
              .limit(20);

            ws.send(
              JSON.stringify({
                type: "GET_LAST",
                payload: {
                  latestMessages,
                },
              }),
            );

            break;

          case "SEND_MESSAGE":
            const chatMessage = decodedMessage.payload;

            const newMessage = await PrivateMessage.create({
              privateChat: chat._id,
              author: senderId,
              message: chatMessage,
              createdAt: new Date(),
              isRead: [],
            });

            const populatedMessage = await newMessage.populate(
              "author",
              "firstName lastName",
            );

            sendToPrivateClients({
              type: "NEW_MESSAGE",
              payload: populatedMessage,
            });
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
        ws.send(JSON.stringify({ type: "ERROR", payload: "Invalid message" }));
      }
    });
    ws.on("close", () => {
      const user = connectedClients[senderId];
      const currentConnectionIndex = user.clients.indexOf(ws);
      user.clients.splice(currentConnectionIndex, 1);
      if (user.clients.length === 0) {
        delete connectedClients[senderId];
      }
    });
  });

  return privateChatsRouter;
};

export default createPrivateChatRouter;
