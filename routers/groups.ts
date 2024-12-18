import express from "express";
import Group from "../models/Group";
import auth, { RequestWithUser } from "../middleware/auth";
import permit from "../middleware/permit";
import Course from "../models/Course";
import User from "../models/User";
import mongoose from "mongoose";
import Client from "../models/Client";
import courseType from "../models/CourseType";
import { populate } from "dotenv";

export const groupsRouter = express.Router();

groupsRouter.get(
  "/",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).send({ error: "Trainer not found" });
      }

      const groups = await Group.find()
        .populate({
          path: "course",
          match: { user },
          select: "title",
        })
        .exec();

      const filteredGroups = groups.filter((group) => group.course);

      return res.send(filteredGroups);
    } catch (error) {
      return next(error);
    }
  },
);

groupsRouter.get("/matching", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    const client = await Client.findOne({ user });

    if (!client) {
      return res.status(404).send({ error: "Client not found" });
    }

    const courses = await Course.find(
      client.preferredWorkoutType.length !== 0
        ? {
            courseType: { $in: client.preferredWorkoutType },
          }
        : {},
    );

    const groups = await Group.find({
      course: { $in: courses },
      trainingLevel: client.trainingLevel,
    })
      .populate({
        path: "course",
        populate: [
          {
            path: "courseType",
            select: "name",
          },
          {
            path: "user",
            select: "firstName lastName",
          },
        ],
      })
      .limit(10);

    return res.send(groups);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid course ID" });

    const groups = await Group.find({ course: req.params.id }).populate(
      "clients",
      "firstName lastName",
    );
    return res.send(groups);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post(
  "/",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) return res.status(400).send({ error: "User not found" });

      const existingCourse = await Course.findOne({
        _id: req.query.course,
        user: user._id,
      });

      if (!existingCourse) {
        return res.status(400).send({ error: "Course does not exist" });
      }

      if (
        !req.body.title ||
        req.body.clientsLimit < 1 ||
        !req.body.startTime ||
        !req.body.trainingLevel
      ) {
        return res.status(400).send({ error: "Fill required fields!" });
      }

      const newGroup = await Group.create({
        title: req.body.title,
        course: existingCourse._id,
        clientsLimit: existingCourse.maxClients,
        startTime: req.body.startTime,
        trainingLevel: req.body.trainingLevel,
      });

      return res.send(newGroup);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }
      return next(error);
    }
  },
);

groupsRouter.patch(
  "/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(400).send({ error: "User not found" });

      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send({ error: "Invalid group ID" });
      if (!mongoose.isValidObjectId(req.body.clientId))
        return res.status(400).send({ error: "Client ID is required" });

      const client = await User.findById(req.body.clientId);
      if (!client)
        return res.status(400).send({ error: "Client does not exist" });

      if (client.role !== "client")
        return res.status(400).send({ error: "You can only add a client" });

      const group = await Group.findById(req.params.id);
      if (!group)
        return res.status(400).send({ error: "Group does not exist" });

      const existingCourse = await Course.findOne({
        _id: group.course,
        user,
      });
      if (!existingCourse)
        return res.status(400).send({ error: "Course does not exist" });

      if (group.clients.includes(client._id))
        return res
          .status(400)
          .send({ error: "Client is already in the group" });

      if (group.clients.length >= group.clientsLimit)
        return res.status(400).send({ error: "Client limit reached" });

      group.clients.push(client._id);
      await group.save();

      return res.send(group);
    } catch (error) {
      return next(error);
    }
  },
);

export default groupsRouter;
