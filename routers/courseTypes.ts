import express from "express";
import CourseType from "../models/CourseType";
import auth, { RequestWithUser } from "../middleware/auth";
import mongoose from "mongoose";
import permit from "../middleware/permit";
import { CourseTypeFields } from "../types/courseTypes";

export const courseTypesRouter = express.Router();

courseTypesRouter.get("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const allCourseTypes = await CourseType.find(
      req.user?.role === "admin" || req.user?.role === "superAdmin"
        ? {}
        : { isPublished: true },
    );
    return res.send(allCourseTypes);
  } catch (error) {
    return next(error);
  }
});

courseTypesRouter.post(
  "/",
  auth,
  permit("trainer", "admin", "superAdmin"),
  async (req, res, next) => {
    try {
      const existingType = await CourseType.findOne({
        name: req.body.name.toLowerCase().trim(),
      });

      if (existingType) {
        if (existingType.isPublished)
          return res
            .status(400)
            .send({ error: "Тип курса с таким названием уже существует" });
        if (!existingType.isPublished && !existingType.isBlocked)
          return res.status(400).send({
            error:
              "Данный тип курса был создан и находится на рассмотрении администрации",
          });
        if (existingType.isBlocked)
          return res.status(400).send({
            error: "Данный тип курса недопустим по политике приложения",
          });
      }

      const courseTypeMutation: CourseTypeFields = {
        name: req.body.name,
      };

      const courseType = new CourseType(courseTypeMutation);
      await courseType.save();

      return res.send(courseType);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }
      return next(error);
    }
  },
);

courseTypesRouter.patch(
  "/block/:id",
  auth,
  permit("admin", "superAdmin"),
  async (req, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({ error: "ID is not valid" });
      }

      const courseType = await CourseType.findById(req.params.id);
      if (!courseType)
        return res.status(400).send({ error: "Тип курса не найден" });
      if (courseType.isPublished)
        return res
          .status(400)
          .send({ error: "Нельзя заблокировать опубликованный тип" });
      if (courseType.isBlocked)
        return res.status(400).send({ error: "Тип курса уже заблокирован" });

      courseType.isBlocked = true;
      await courseType.save();

      return res.send(courseType);
    } catch (error) {
      return next(error);
    }
  },
);

courseTypesRouter.patch(
  "/publish/:id",
  auth,
  permit("admin", "superAdmin"),
  async (req: RequestWithUser, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({ error: "ID is not valid" });
      }

      const courseType = await CourseType.findById(req.params.id);

      if (!courseType) {
        return res.status(404).send({ error: "Тип курса не найден" });
      }
      if (courseType.isBlocked)
        return res
          .status(400)
          .send({ error: "Нельзя опубликовать заблокированный тип курса" });
      if (courseType.isPublished)
        return res.status(400).send({ error: "Тип курса уже опубликован" });

      courseType.isPublished = true;
      await courseType.save();

      return res.status(200).send(courseType);
    } catch (error) {
      return next(error);
    }
  },
);
