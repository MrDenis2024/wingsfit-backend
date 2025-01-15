import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Group from "../models/Group";
import GroupChat from "../models/GroupChat";
import Course from "../models/Course";
import PrivateChat from "../models/PrivateChat";
import User from "../models/User";
import permit from "../middleware/permit";

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
          { clients: { $elemMatch: { client: user._id } } },
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

      let frozenGroupIds: string[] = [];

      if (user.role === "client") {
        frozenGroupIds = userGroups
          .filter((group) =>
            group.clients.some(
              (client) =>
                client.client.toString() === user._id.toString() &&
                client.status === "frozen",
            ),
          )
          .map((group) => group._id.toString());
      }

      const groupChats = await GroupChat.find({ group: { $in: groupIds } });

      const result = groupChats.map((chat) => ({
        ...chat.toObject(),
        disabled: frozenGroupIds.includes(chat.group.toString()),
      }));

      return res.status(200).send(result);
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

chatsRouter.post(
  "/start-chat",
  auth,
  async (req: RequestWithUser, res, next) => {
    const { firstPersonId, secondPersonId } = req.body;

    try {
      const user = req.user;

      if (!user) return res.status(400).send({ error: "User not found" });

      const firstPerson = await User.findById(firstPersonId);
      const secondPerson = await User.findById(secondPersonId);

      if (!firstPerson || !secondPerson) {
        return res.status(400).send({ error: "One or both users not found" });
      }

      if (firstPerson._id.toString() === secondPerson._id.toString()) {
        return res
          .status(400)
          .send({ error: "First and second persons cannot be the same" });
      }

      if (!["trainer", "admin", "superAdmin"].includes(firstPerson.role)) {
        return res.status(400).send({
          error:
            "First person must have a valid role (trainer, admin, or superAdmin)",
        });
      }

      const existingChat = await PrivateChat.findOne({
        $or: [
          { firstPerson: firstPerson._id, secondPerson: secondPerson._id },
          { firstPerson: secondPerson._id, secondPerson: firstPerson._id },
        ],
      });

      if (existingChat) {
        return res.status(200).send(existingChat);
      }

      const newPrivateChat = new PrivateChat({
        firstPerson: firstPerson._id,
        secondPerson: secondPerson._id,
        availableTo: [firstPerson._id, secondPerson._id],
      });

      await newPrivateChat.save();

      return res.send(newPrivateChat);
    } catch (error) {
      return next(error);
    }
  },
);

chatsRouter.post(
  "/start-groupChat",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    const { group } = req.body;
    try {
      const user = req.user;

      if (!user) return res.status(400).send({ error: "User not found" });

      if (!group) {
        return res.status(400).send({ error: "Group ID is required." });
      }

      const existingGroup = await Group.findById(group);

      if (!existingGroup) {
        return res.status(404).send({ error: "Group not found." });
      }

      const existingChat = await GroupChat.findOne({ group });

      if (existingChat) {
        return res.status(200).send({
          message: "Group chat already exists.",
          chat: existingChat,
        });
      }

      const newGroupChat = new GroupChat({
        group: existingGroup._id,
        title: existingGroup.title,
        isUrl: false,
      });

      await newGroupChat.save();

      return res.send(newGroupChat);
    } catch (error) {
      return next(error);
    }
  },
);

export default chatsRouter;
