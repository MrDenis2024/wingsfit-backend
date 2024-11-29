import express from "express";
import Group from "../models/Group";
import auth from "../middleware/auth";
import permit from "../middleware/permit";
import Course from "../models/Course";
import User from "../models/User";
import mongoose from "mongoose";

export const groupsRouter = express.Router();

groupsRouter.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid ID" });

    const groups = await Group.find({ course: req.params.id }).populate(
      "clients",
      "firstName lastName",
    );
    return res.send(groups);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post("/", auth, permit("trainer"), async (req, res, next) => {
  try {
    const coursesExists = await Course.findById(req.query.course);
    if (!coursesExists) {
      return res.status(400).send({ error: "Course does not exist" });
    }

    const newGroup = new Group({
      title: req.body.title,
      course: coursesExists._id,
      clientsLimit: coursesExists.maxClients,
      startTime: req.body.startTime,
      trainingLevel: req.body.trainingLevel,
    });

    await newGroup.save();
    return res.send(newGroup);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});

groupsRouter.patch("/:id", auth, permit("trainer"), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid ID" });

    if (!req.body.clientId) {
      return res.status(400).send({ error: "Client ID is required" });
    }

    const client = await User.findById(req.body.clientId);
    if (!client) {
      return res.status(400).send({ error: "Client does not exist" });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(400).send({ error: "Group does not exist" });
    }

    if (client.role !== "client") {
      return res.status(400).send({ error: "You can only add a client" });
    }

    if (group.clients.includes(client._id)) {
      return res.status(400).send({ error: "Client is already in the group" });
    }

    if (group.clients.length >= group.clientsLimit) {
      return res.status(400).send({ error: "Client limit reached" });
    }

    group.clients.push(client._id);
    await group.save();

    return res.send(group);
  } catch (error) {
    return next(error);
  }
});

export default groupsRouter;
