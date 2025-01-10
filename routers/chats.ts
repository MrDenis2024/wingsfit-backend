import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Group from "../models/Group";
import GroupChat from "../models/GroupChat";
import Course from "../models/Course";
import PrivateChat from "../models/PrivateChat";
import User from "../models/User";

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

chatsRouter.post("/start-chat", async (req, res) => {
  const { firstPersonId, secondPersonId } = req.body;

  try {
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

    return res.status(201).send(newPrivateChat);
  } catch (error) {
    return res.status(500).send(error);
  }
});

export default chatsRouter;
