import express from "express";
import Group from "../models/Group";
import auth from "../middleware/auth";
import permit from "../middleware/permit";
import Course from "../models/Course";
import clients from "./clients";
import User from "../models/User";
import mongoose from "mongoose";

export const groupsRouter = express.Router();

groupsRouter.get("/:id", async (req, res, next) => {
  try {
    const groups = await Group.find({ course: req.params.id }).populate(
      "user",
      "firstName lastName",
    );
    return res.send(groups);
  } catch (error) {
    return next(error);
  }
});

groupsRouter.post("/", auth, permit("trainer"), async (req, res, next) => {
  try {
    const coursesExists = await Course.findById(req.body.course);
    if (!coursesExists) {
      return res.status(400).send({ error: "Course does not exist" });
    }

    const existingClients = await User.find({ _id: { $in: req.body.clients } });
    if (existingClients.length !== req.body.clients.length) {
      return res.status(400).send({ error: "Not all clients found" });
    }

    const newGroup = new Group({
      title: req.body.title,
      course: req.body.course,
      clients: req.body.clients,
      clientsLimit: coursesExists.maxClients,
      scheduled: req.body.scheduled,
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

export default groupsRouter;
