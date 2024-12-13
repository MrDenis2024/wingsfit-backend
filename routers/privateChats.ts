import express from "express";
import {ConnectedClientsToPrivateChat} from "../types/privateChatTypes";
import PrivateChat from "../models/PrivateChat";
import {PrivateIncomingMessage} from "../types/privateMessagesTypes";
import User from "../models/User";
import PrivateMessage from "../models/PrivateMessage";
import mongoose from "mongoose";

const createPrivateChatRouter = () => {
  const privateChatsRouter = express.Router();
  const connectedClients: ConnectedClientsToPrivateChat = {};

  const sendToPrivateClients = (privateChatId: string, message: unknown) => {
    const chatClients = Object.values(connectedClients)
      .filter((client) =>
        client.privateChats.includes(privateChatId)
      )
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

      const chatHistory = await PrivateMessage.find({"privateChat": chat._id})
        .populate("author", "firstName")
        .sort({createdAt: 1})
        .limit(20);

      console.log(`chatHistory ${JSON.stringify(chatHistory)}`);
    }
  );

  return privateChatsRouter;
};

export default createPrivateChatRouter;