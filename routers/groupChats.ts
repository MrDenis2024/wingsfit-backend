import express from "express";
import GroupChatMessage from "../models/GroupChatMessages";
import {ConnectedClients, IncomingMessage} from "../types/groupChatMessagesTypes";
import User from "../models/User";
import GroupChat from "../models/GroupChat";

const createGroupChatRouter = () => {

  const groupChatsRouter = express.Router();

  const connectedClients: ConnectedClients = {};

  const sendToGroupClients = (groupChatId: string, message: unknown) => {
    const groupClients = Object.values(connectedClients)
      .filter(client => client.groups.includes(groupChatId))
      .flatMap(client => client.clients);

    groupClients.forEach(client => {
      client.send(JSON.stringify(message));
    });
  };

  groupChatsRouter.ws('/:groupChatId', async (ws, req) => {

    const groupChatId = req.params.groupChatId;

    const groupChat = await GroupChat.findById(groupChatId);
    if (!groupChat) {
      ws.send(JSON.stringify({type: "ERROR", payload: "Group Chat not found"}));
      return ws.close();
    }

    let userId: string;
    let userName: string;

    ws.on("message", async (message) => {
      try {
        const decodedMessage = JSON.parse(message.toString()) as IncomingMessage;

        switch (decodedMessage.type) {
          case "LOGIN":
            const token = decodedMessage.payload;
            const user = await User.findOne({token});
            if (!user) {
              ws.send(JSON.stringify({type: "ERROR", payload: "Invalid Token"}));
              return ws.close();
            }
            userId = user._id.toString();
            userName = user.firstName;

            if (!connectedClients[userId]) {
              connectedClients[userId] = {
                userName,
                clients: [ws],
                groups: [],
              };
            } else {
              connectedClients[userId].clients.push(ws);
            }

            ws.send(
              JSON.stringify({
                type: "LOGIN_SUCCESS",
                payload: {userName, userId},
              })
            );
            console.log("User logged in:", userName);
            break;

          case "JOIN_GROUP":
            if (
              typeof decodedMessage.payload === "object" &&
              "groupChatId" in decodedMessage.payload
            ) {
              const {groupChatId} = decodedMessage.payload;

              const groupChat = await GroupChat.findById(groupChatId);
              if (!groupChat) {
                ws.send(
                  JSON.stringify({type: "ERROR", payload: "Group Chat not found"})
                );
                return;
              }

              connectedClients[userId].groups.push(groupChatId);

              const unreadMessages = await GroupChatMessage.find({
                groupChat: groupChatId,
                "isRead.user": { $ne: userId },
                author: { $ne: userId },
              });

              for (const message of unreadMessages) {
                message.isRead.push({ user: userId, read: true });
                await message.save();
              }

              const latestMessages = await GroupChatMessage.find({groupChat: groupChatId})
                .populate("author", "firstName")
                .sort({createdAt: 1})
                .limit(20);

              ws.send(
                JSON.stringify({
                  type: "GROUP_MESSAGES",
                  payload: {groupChatId, groupName: groupChat.title, latestMessages},
                })
              );

              console.log(`${userName} joined group: ${groupChat.title}`);

            } else {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  payload: "Invalid JOIN_GROUP payload",
                })
              );
            }
            break;

          case "SEND_MESSAGE":
            if (
              typeof decodedMessage.payload === "object" &&
              "groupChatId" in decodedMessage.payload &&
              "message" in decodedMessage.payload
            ) {
              const {groupChatId: targetGroupChatId, message: chatMessage} =
                decodedMessage.payload;

              if (!connectedClients[userId].groups.includes(targetGroupChatId)) {
                ws.send(
                  JSON.stringify({
                    type: "ERROR",
                    payload: "You are not part of this group",
                  })
                );
                return;
              }

              const newMessage = await GroupChatMessage.create({
                groupChat: targetGroupChatId,
                author: userId,
                message: chatMessage,
                createdAt: new Date(),
                read: false,
              });

              const populatedMessage = await newMessage.populate(
                "author",
                "firstName"
              );

              sendToGroupClients(targetGroupChatId, {
                type: "NEW_MESSAGE",
                payload: populatedMessage,
              });

              console.log(`Message sent to group ${targetGroupChatId}:`, chatMessage);
            } else {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  payload: "Invalid SEND_MESSAGE payload",
                })
              );
            }
            break;
          case "MARK_READ":
            if (
              typeof decodedMessage.payload === "object" &&
              "messageId" in decodedMessage.payload
            ) {
              const { messageId } = decodedMessage.payload;

              const message = await GroupChatMessage.findById(messageId);
              if (!message) {
                ws.send(
                  JSON.stringify({ type: "ERROR", payload: "Message not found" })
                );
                return;
              }

              const existingReadEntry = message.isRead.find(
                (entry) => entry.user.toString() === userId
              );

              if (existingReadEntry) {
                existingReadEntry.read = true;
              } else {
                message.isRead.push({ user: userId, read: true });
              }

              await message.save();

              ws.send(
                JSON.stringify({ type: "MARK_READ_SUCCESS", payload: messageId })
              );

              console.log(`User ${userName} marked message ${messageId} as read.`);
            } else {
              ws.send(
                JSON.stringify({
                  type: "ERROR",
                  payload: "Invalid MARK_READ payload",
                })
              );
            }
            break;


          default:
            console.log("This type of message is not supported");
            ws.send(JSON.stringify({type: "ERROR", payload: "Unsupported message type",}));
        }
      } catch (error) {
        ws.send(JSON.stringify({type: "ERROR", payload: "Invalid message"}));
      }
    });
    ws.on("close", () => {
      console.log("client disconnected");
      const user = connectedClients[userId];
      const currentConnectionIndex = user.clients.indexOf(ws);
      user.clients.splice(currentConnectionIndex, 1);
      if (user.clients.length === 0) {
        delete connectedClients[userId];
        console.log("Removed user from connected clients:", userName);
      }
    })
  });
  return groupChatsRouter;
};

export default createGroupChatRouter;