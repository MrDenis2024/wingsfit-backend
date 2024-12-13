import express from "express";
import {ConnectedClientsToPrivateChat} from "../types/privateChatTypes";
import PrivateChat from "../models/PrivateChat";
import User from "../models/User";
import PrivateMessage from "../models/PrivateMessage";
import {PrivateChatIncomingMessage} from "../types/privateMessagesTypes";

const createPrivateChatRouter = () => {
  const privateChatsRouter = express.Router();
  const connectedClients: ConnectedClientsToPrivateChat = {};

  const sendToPrivateClients = (message: unknown) => {
    const chatClients = Object
      .values(connectedClients)
      .flatMap((client) => client.clients);

    chatClients.forEach((client) => {
      client.send(JSON.stringify(message));
    });
  };

  privateChatsRouter.ws("/:idSender/:idReceiver", async (ws, req, res) => {
      const senderId = req.params.idSender;

      const receiverId = req.params.idReceiver;

      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);

      if (!receiver || !sender) {
        ws.send(
          JSON.stringify({type: "ERROR", payload: "Receiver or sender not found"}),
        );
        return ws.close();
      }

      let chat = await PrivateChat.findOne({availableTo: {$all: [senderId, receiverId]}});
      console.log(`Chat: ${JSON.stringify(chat)}`);

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

          console.log(`decodedMessage: ${JSON.stringify(decodedMessage)}`);

          switch (decodedMessage.type) {
            case "LOGIN":
              const userName = sender.firstName;

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
                  payload: {userName, senderId},
                }),
              );

              const latestMessages = await PrivateMessage.find({"privateChat": chat._id})
                .populate("author", "firstName")
                .sort({createdAt: 1})
                .limit(20);

              console.log(`latestMessages ${JSON.stringify(latestMessages)}`);

              ws.send(
                JSON.stringify({
                  type: "SEND_MESSAGE",
                  payload: {
                    latestMessages,
                  },
                }),
              );

              break;

            case "SEND_MESSAGE":
              const chatMessage = decodedMessage.payload;
              console.log(`chatMessage: ${JSON.stringify(chatMessage)}`);

              const newMessage = await PrivateMessage.create({
                privateChat: chat._id,
                author: senderId,
                message: chatMessage,
                createdAt: new Date(),
                isRead: [],
              });

              const populatedMessage = await newMessage.populate(
                "author",
                "firstName",
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
          ws.send(JSON.stringify({type: "ERROR", payload: "Invalid message"}));
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
    }
  );

  return privateChatsRouter;
};

export default createPrivateChatRouter;