import express from "express";
import LessonType from "../models/LessonType";
import auth, {RequestWithUser} from "../middleware/auth";
import mongoose from "mongoose";
import {LessonTypeFields} from "../types/lessonTypes";
import permit from "../middleware/permit";

export const lessonTypeRouter = express.Router();

lessonTypeRouter.get("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send({ error: "User not found" });

    const allLessonTypes = await LessonType.find();
    return res.send(allLessonTypes);
  } catch (error) {
    return next(error);
  }
});

lessonTypeRouter.post("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send({ error: "User not found" });

    const lessonTypeMutation: LessonTypeFields = {
      name: req.body.name,
      description: req.body.description,
    };

    const lessonType = new LessonType(lessonTypeMutation);
    await lessonType.save();

    return res.status(200).send(lessonType)

  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});

lessonTypeRouter.put("/:id", auth, permit('admin'), async (req: RequestWithUser, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send({error: 'ID is not valid'});
    }

    const lessonType = await LessonType.findById(req.params.id);

    if (!lessonType) {
      return res.status(404).send({error: 'LessonType not found'});
    }

    lessonType.isPublished = !lessonType.isPublished;

    await lessonType.save();
    return res.status(200).send(lessonType);

  } catch (error) {
    return next(error);
  }
});
