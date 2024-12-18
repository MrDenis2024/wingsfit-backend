import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Group from "../models/Group";
import GroupChat from "../models/GroupChat";
import Course from "../models/Course";
import PrivateChat from "../models/PrivateChat";

const chatsRouter = express.Router();

chatsRouter.get(
  "/groupChats",
  auth,
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });

      const userGroups = await Group.find({
        $or: [
          { clients: user._id }, // Check if user is a client
          {
            course: {
              $in: await Course.find({ user: user._id }).distinct("_id"),
            },
          },
        ],
      });

      if (!userGroups || userGroups.length === 0) {
        return res.status(200).send([]);
      }

      const groupIds = userGroups.map((group) => group._id);

      const groupChats = await GroupChat.find({ group: { $in: groupIds } });

      return res.status(200).send(groupChats);
    } catch (error) {
      return next(error);
    }
  },
);

chatsRouter.get(
  "/privateChats",
  auth,
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });

      const privateChats = await PrivateChat.find({
        availableTo: user._id,
        $or: [{ firstPerson: user._id }, { secondPerson: user._id }],
      }).populate("firstPerson secondPerson", "firstName lastName avatar");

      const privateChat =
        privateChats.length > 0
          ? privateChats.map((chat) => ({
              _id: chat._id,
              firstPerson: chat.firstPerson,
              secondPerson: chat.secondPerson,
            }))
          : [];

      return res.status(200).send(privateChat);
    } catch (error) {
      return next(error);
    }
  },
);

export default chatsRouter;
