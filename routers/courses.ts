import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Course from "../models/Course";
import { imagesUpload } from "../multer";
import User from "../models/User";
import mongoose, { FilterQuery } from "mongoose";
import Trainer from "../models/Trainer";
import { UpdatedCourse } from "../types/courseTypes";
import permit from "../middleware/permit";
import Group from "../models/Group";
import Lesson from "../models/Lesson";
import { sortScheduleDays } from "../utils/helperFunctions";

const coursesRouter = express.Router();

coursesRouter.get("/", auth, async (req, res) => {
  const { trainerId } = req.query;

  if (!trainerId) {
    const allCourses = await Course.find()
      .populate("user", "firstName lastName")
      .populate("courseType", "name");
    return res.status(200).send(allCourses);
  }

  const findTrainer = await User.findById(trainerId);

  if (!findTrainer || findTrainer.role !== "trainer") {
    return res
      .status(404)
      .send({ error: "The user is not a trainer or not found" });
  }

  const courses = await Course.find({ user: trainerId })
    .populate("user", "firstName lastName")
    .populate("courseType", "name")
    .populate({ path: "waitList.user", select: "firstName lastName" });
  return res.status(200).send(courses);
});

coursesRouter.get("/search", auth, async (req, res, next) => {
  try {
    const courseTypes = (req.query.courseTypes as string).split(",");
    const format = (req.query.format as string).split(",");
    const trainers = (req.query.trainers as string).split(",");
    const schedule = (req.query.schedule as string).split(",");
    const filter: FilterQuery<typeof Course> = {};

    if (
      courseTypes &&
      courseTypes.every((id) => mongoose.isValidObjectId(id))
    ) {
      filter.courseType = { $in: courseTypes };
    }

    if (format && format.every((item) => item.trim() !== "")) {
      filter.format = { $in: format };
    }

    if (trainers && trainers.every((id) => mongoose.isValidObjectId(id))) {
      filter.user = { $in: trainers };
    }

    if (schedule && schedule.every((item) => item.trim() !== "")) {
      filter.schedule = { $in: schedule };
    }

    const courses = await Course.find(filter)
      .populate("user", "firstName lastName")
      .populate("courseType", "name");

    return res.status(200).send(courses);
  } catch (error) {
    return next(error);
  }
});

coursesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const course = await Course.findById(id)
      .populate("user", "firstName lastName avatar")
      .populate("courseType", "name")
      .populate({ path: "waitList.user", select: "firstName lastName" })
      .lean();

    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }

    const user = course.user;
    let description: string | null = null;

    if (user && typeof user === "object" && "_id" in user) {
      const trainer = await Trainer.findOne({ user: user._id }).lean();
      if (trainer) {
        description = trainer.description;
      }
    }

    return res.status(200).send({
      ...course,
      user: user && typeof user === "object" ? { ...user, description } : user,
    });
  } catch (error) {
    return next(error);
  }
});

coursesRouter.post(
  "/",
  auth,
  permit("trainer"),
  imagesUpload.single("image"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).send({ error: "User not found" });
      if (user.role !== "trainer") {
        return res.status(400).send({
          error: "Bad Request! Only trainer can create course!",
        });
      }

      const sortedSchedule = sortScheduleDays(req.body.schedule);

      const courseMutation = {
        user: user._id,
        title: req.body.title,
        courseType: req.body.courseType,
        description: req.body.description,
        format: req.body.format,
        schedule: sortedSchedule,
        price: req.body.price,
        image: req.file ? req.file.filename : null,
      };
      const newCourse = await Course.create(courseMutation);
      return res.status(200).send(newCourse);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }
      return next(error);
    }
  },
);

coursesRouter.put(
  "/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const id = req.params.id;
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });

      if (!mongoose.isValidObjectId(id))
        return res.status(400).send({ error: "Invalid ID" });

      const course = await Course.findById(id);

      if (!course) {
        return res.status(404).send({ error: "Course not found" });
      }

      const sortedSchedule = sortScheduleDays(req.body.schedule);

      const updatedFields: UpdatedCourse = {
        title: req.body.title,
        courseType: req.body.courseType,
        description: req.body.description,
        format: req.body.format,
        schedule: sortedSchedule,
        price: req.body.price,
      };

      const updatedCourse = await Course.findOneAndUpdate(
        { _id: id },
        updatedFields,
        { new: true, runValidators: true },
      );

      return res.status(200).send(updatedCourse);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }
      return next(error);
    }
  },
);

coursesRouter.patch(
  "/new/:id",
  auth,
  permit("client"),
  async (req: RequestWithUser, res, next) => {
    try {
      const courseId = req.params.id;
      const { groupId } = req.body;
      const userId = req.user?._id;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).send({ error: "Курс не найден." });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).send({ error: "Группа не найдена." });
      }
      if (!group.course.equals(course._id)) {
        return res
          .status(400)
          .send({ error: "Группа не привязана к данному курсу." });
      }

      const alreadyInGroup = group.clients.some(
        (client) => String(client.client) === String(userId),
      );

      if (alreadyInGroup) {
        return res
          .status(400)
          .send({ error: "Клиент уже находится в данной группе." });
      }

      const alreadyInWaitList = course.waitList.some(
        (waitListItem) => String(waitListItem.user) === String(userId),
      );
      if (alreadyInWaitList) {
        return res
          .status(400)
          .send({ error: "Клиент уже находится в списке ожидания." });
      }

      if (!userId) {
        return res.status(400).send({ error: "ID пользователя отсутствует." });
      }

      course.waitList.push({
        user: userId,
        createdAt: new Date(),
        favoriteGroup: groupId,
        status: "new",
      });

      await course.save();

      return res
        .status(200)
        .send({ message: "Клиент успешно добавлен в список ожидания." });
    } catch (error) {
      return next(error);
    }
  },
);

coursesRouter.patch(
  "/migrate/:id",
  auth,
  permit("client"),
  async (req: RequestWithUser, res, next) => {
    try {
      const courseId = req.params.id;
      const { groupId } = req.body;
      const userId = req.user?._id;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).send({ error: "Курс не найден." });
      }

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).send({ error: "Группа не найдена." });
      }

      if (!group.course.equals(course._id)) {
        return res
          .status(400)
          .send({ error: "Группа не привязана к данному курсу." });
      }

      const alreadyInGroup = group.clients.some(
        (client) => String(client.client) === String(userId),
      );

      if (alreadyInGroup) {
        return res
          .status(400)
          .send({ error: "Клиент уже находится в данной группе." });
      }

      const alreadyInWaitList = course.waitList.some(
        (waitListItem) => String(waitListItem.user) === String(userId),
      );
      if (alreadyInWaitList) {
        return res
          .status(400)
          .send({ error: "Клиент уже находится в списке ожидания." });
      }

      if (!userId) {
        return res.status(400).send({ error: "ID пользователя отсутствует." });
      }

      course.waitList.push({
        user: userId,
        createdAt: new Date(),
        favoriteGroup: groupId,
        status: "migrate",
      });

      await course.save();

      return res
        .status(200)
        .send({ message: "Клиент успешно добавлен в список мигрирования." });
    } catch (error) {
      return next(error);
    }
  },
);

coursesRouter.patch(
  "/approve/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    const courseId = req.params.id;
    const { waitListId, subscribeEndDate } = req.body;
    const userId = req.user?._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).send({ error: "Курс не найден." });
    }

    if (!(course.user as mongoose.Types.ObjectId).equals(userId)) {
      return res
        .status(400)
        .send({ error: "Вы не являетесь тренером этого курса" });
    }

    try {
      const subscribeEnd = new Date(subscribeEndDate);
      if (isNaN(subscribeEnd.getTime())) {
        return res
          .status(400)
          .send({ error: "Некорректная дата для окончания подписки." });
      }

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).send({ error: "Курс не найден." });
      }

      const waitListItem = course.waitList.find(
        (item) => String(item._id) === String(waitListId),
      );
      if (!waitListItem) {
        return res
          .status(404)
          .send({ error: "Запись в списке ожидания не найдена." });
      }

      const group = await Group.findById(waitListItem.favoriteGroup);
      if (!group) {
        return res
          .status(404)
          .send({ error: "Группа из записи списка ожидания не найдена." });
      }

      if (waitListItem.status === "new") {
        group.clients.push({
          client: waitListItem.user,
          addedAt: new Date(Date.now()),
          subscribeEnd: subscribeEnd,
          status: "active",
        });
        await group.save();
      } else if (waitListItem.status === "migrate") {
        const oldGroup = await Group.findOne({
          course: courseId,
          clients: {
            $elemMatch: {
              client: waitListItem.user,
            },
          },
        });
        if (!oldGroup) {
          return res.status(404).send({
            error: "Действующая подписка пользователя не найдена.",
          });
        }

        await Group.updateOne(
          { _id: oldGroup._id },
          { $pull: { clients: { client: waitListItem.user } } },
        );

        group.clients.push({
          client: waitListItem.user,
          addedAt: new Date(Date.now()),
          subscribeEnd: subscribeEnd,
          status: "active",
        });

        await oldGroup.save();
      } else {
        return res
          .status(400)
          .send({ error: "Неверный статус записи списка ожидания." });
      }

      course.waitList = course.waitList.filter(
        (item) => String(item._id) !== String(waitListId),
      );

      await group.save();
      await course.save();

      return res
        .status(200)
        .send({ message: "Клиент успешно перенаправлен в группу." });
    } catch (error) {
      next(error);
    }
  },
);

coursesRouter.patch(
  "/decline/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const courseId = req.params.id;
      const { waitListId } = req.body;
      const userId = req.user?._id;

      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).send({ error: "Курс не найден." });
      }

      if (!(course.user as mongoose.Types.ObjectId).equals(userId)) {
        return res
          .status(400)
          .send({ error: "Вы не являетесь тренером этого курса" });
      }

      const result = await Course.updateOne(
        { _id: courseId },
        { $pull: { waitList: { _id: waitListId } } },
      );

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .send({ error: "Запись не найдена или уже удалена." });
      }

      return res
        .status(200)
        .send({ message: "Запись успешно удалена из списка ожидания." });
    } catch (e) {
      return next(e);
    }
  },
);

coursesRouter.delete(
  "/:id",
  auth,
  permit("admin", "superAdmin", "trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send({ error: "Invalid course ID" });

      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).send({ error: "Курс не найден" });
      }

      if (
        req.user?.role === "admin" ||
        req.user?.role === "superAdmin" ||
        (req.user?.role === "trainer" && course.user.equals(req.user._id))
      ) {
        await Course.deleteOne({ _id: req.params.id });
        const groups = await Group.find({ course: req.params.id });
        const groupIds = groups.map((group) => group._id);
        await Group.deleteMany({ course: req.params.id });
        await Lesson.deleteMany({ group: { $in: groupIds } });
        return res.send({ message: "Курс и связанные данные успешно удалены" });
      }

      return res
        .status(403)
        .send({ error: "Вы не можете удалить данную группу" });
    } catch (error) {
      return next(error);
    }
  },
);

export default coursesRouter;
