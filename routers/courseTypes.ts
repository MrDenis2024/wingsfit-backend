import express from "express";
import CourseType from "../models/CourseType";
import auth, { RequestWithUser } from "../middleware/auth";
import mongoose from "mongoose";
import permit from "../middleware/permit";
import { CourseTypeFields } from "../types/courseTypes";

export const courseTypesRouter = express.Router();

courseTypesRouter.get("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send({ error: "User not found" });

    const allCourseTypes = await CourseType.find();
    return res.send(allCourseTypes);
  } catch (error) {
    return next(error);
  }
});

courseTypesRouter.post("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send({ error: "User not found" });

    const courseTypeMutation: CourseTypeFields = {
      name: req.body.name,
      description: req.body.description,
    };

    const courseType = new CourseType(courseTypeMutation);
    await courseType.save();

    return res.status(200).send(courseType);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});

courseTypesRouter.put(
  "/:id",
  auth,
  permit("admin"),
  async (req: RequestWithUser, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({ error: "ID is not valid" });
      }

      const courseType = await CourseType.findById(req.params.id);

      if (!courseType) {
        return res.status(404).send({ error: "CourseType not found" });
      }

      courseType.isPublished = !courseType.isPublished;

      await courseType.save();
      return res.status(200).send(courseType);
    } catch (error) {
      return next(error);
    }
  },
);
