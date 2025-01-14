import express from "express";
import Lesson from "../models/Lesson";
import auth, { RequestWithUser } from "../middleware/auth";
import permit from "../middleware/permit";
import Course from "../models/Course";
import Group from "../models/Group";
import mongoose from "mongoose";

const lessonsRouter = express.Router();

lessonsRouter.get("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const courses = await Course.find({ user: req.query?.trainer });

    if (courses.length < 1) {
      return res
        .status(404)
        .send({ error: "Курсы данного тренера не найдены" });
    }

    const groups = await Group.find({
      course: { $in: courses.map((course) => course._id) },
    });

    if (groups.length < 1) {
      return res
        .status(404)
        .send({ error: "Группы данного тренера не найдены" });
    }

    const lessons = await Lesson.find({
      group: { $in: groups.map((group) => group._id) },
    })
      .populate({
        path: "group",
        select: "title course",
        populate: {
          path: "course",
          select: "title",
        },
      })
      .populate("notPresent", "firstName lastName")
      .populate("arePresent", "firstName lastName");

    return res.status(200).send(lessons);
  } catch (error) {
    return next(error);
  }
});

lessonsRouter.get("/:id", auth, permit("trainer"), async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).send("Group not found");
    }

    const lessons = await Lesson.find({ group: group._id })
      .populate({
        path: "group",
        select: "title course",
        populate: {
          path: "course",
          select: "title",
        },
      })
      .populate("notPresent", "firstName lastName")
      .populate("arePresent", "firstName lastName");

    return res.status(200).send(lessons);
  } catch (e) {
    next(e);
  }
});

lessonsRouter.post(
  "/",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const group = await Group.findById(req.body.groupId);

      if (!group) {
        return res.status(400).send({ error: "Группа не найдена" });
      }

      const course = await Course.findById(group.course);

      if (!course) {
        return res.status(400).send({ error: "Крус не найден" });
      }

      if (course.user.toString() !== req.user?._id.toString()) {
        return res.status(400).send({ error: "Группа не принадлежит тренеру" });
      }

      if (group.clients.length === 0) {
        return res.status(400).send({ error: "В группе нет подписчиков" });
      }

      const currentDate = new Date();
      const groupStartTime = new Date(
        currentDate.toDateString() + " " + group.startTime,
      );

      const timeDifference = Math.abs(
        currentDate.getTime() - groupStartTime.getTime(),
      );
      const oneHour = 60 * 60 * 1000;

      if (
        currentDate.toDateString() !== groupStartTime.toDateString() ||
        timeDifference > oneHour
      ) {
        return res
          .status(403)
          .send({ error: "Временные ограничения нарушены" });
      }

      const existingLesson = await Lesson.findOne({
        group: req.body.groupId,
        createdAt: {
          $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
          $lte: new Date(currentDate.setHours(23, 59, 59, 999)),
        },
      });

      if (existingLesson) {
        return res
          .status(403)
          .send({ error: "Занятие уже создано для этого дня" });
      }

      const lesson = new Lesson({
        group: req.body.groupId,
        notPresent: group.clients.map((client) => client.client.toString()),
      });

      await lesson.save();
      res.status(200).send(lesson);
    } catch (error) {
      next(error);
    }
  },
);

lessonsRouter.patch(
  "/:id",
  auth,
  permit("client"),
  async (req: RequestWithUser, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const lesson = await Lesson.findById(id);

      if (!userId) {
        return res.status(400).send({ error: "Пользователь не найден" });
      }

      if (!lesson) {
        return res.status(400).send({ error: "Занятие не найдено" });
      }

      if (!lesson.notPresent.includes(userId)) {
        return res
          .status(400)
          .send({ error: "Пользователь не найден в списке" });
      }

      const group = await Group.findById(lesson.group);
      if (!group) {
        return res.status(404).send({ error: "Группа не найдена" });
      }

      const currentDate = new Date();
      const groupStartTime = new Date(
        currentDate.toDateString() + " " + group.startTime,
      );
      const hours = Math.floor(group.scheduleLength);
      const minutes = (group.scheduleLength % 1) * 60;
      const groupLengthInMs = hours * 60 * 60 * 1000 + minutes * 60 * 1000;

      if (currentDate.getTime() > groupStartTime.getTime() + groupLengthInMs) {
        return res.status(403).send({ error: "Время занятия уже прошло" });
      }

      lesson.notPresent = lesson.notPresent.filter(
        (clientId) => clientId.toString() !== userId.toString(),
      );
      lesson.arePresent.push(userId);

      await lesson.save();

      return res.send(lesson);
    } catch (e) {
      next(e);
    }
  },
);

export default lessonsRouter;
