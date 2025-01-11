import express from "express";
import Group from "../models/Group";
import auth, { RequestWithUser } from "../middleware/auth";
import permit from "../middleware/permit";
import Course from "../models/Course";
import User from "../models/User";
import mongoose, { Types } from "mongoose";
import Client from "../models/Client";
import Lesson from "../models/Lesson";

export const groupsRouter = express.Router();

groupsRouter.get("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send({ error: "User not found" });
    }

    let groups;

    if (user.role === "admin" || user.role === "superAdmin") {
      groups = await Group.find()
        .populate({
          path: "course",
          match: { user },
          select: "title schedule user",
        })
        .populate({
          path: "clients.client",
          select: "firstName lastName",
        })
        .exec();
    } else if (user.role === "trainer") {
      groups = await Group.find()
        .populate({
          path: "course",
          match: { user: user._id },
          select: "title schedule user",
        })
        .populate({
          path: "clients.client",
          select: "firstName lastName",
        })
        .exec();

      groups = groups.filter((group) => group.course);
    } else if (user.role === "client") {
      groups = await Group.find({
        "clients.client": user._id,
      })
        .populate({
          path: "course",
          select: "title schedule user",
        })
        .populate({
          path: "clients.client",
          select: "firstName lastName",
        })
        .exec();
    }

    return res.send(groups);
  } catch (error) {
    return next(error);
  }
});

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

groupsRouter.get("/group/:id", auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid group ID" });

    const group = await Group.findById(req.params.id)
      .populate("clients", "firstName lastName")
      .populate("course");

    if (!group) {
      return res.status(404).send({ error: "Group not found" });
    }

    return res.send(group);
  } catch (error) {
    console.error("Error fetching group:", error);
    return next(error);
  }
});

groupsRouter.get("/:id", auth, async (req, res, next) => {
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
        parseFloat(req.body.maxClients) < 1 ||
        !req.body.startTime ||
        parseFloat(req.body.scheduleLength) < 1 ||
        !req.body.trainingLevel
      ) {
        return res.status(400).send({ error: "Fill required fields!" });
      }

      const newGroup = await Group.create({
        title: req.body.title,
        course: existingCourse._id,
        maxClients: parseFloat(req.body.maxClients),
        startTime: req.body.startTime,
        scheduleLength: parseFloat(req.body.scheduleLength),
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
  "/update_subscribe/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    const groupId = req.params.id;
    const { clientId, newSubscribeEnd } = req.body;

    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).send({ error: "Группа не найдена" });
      }

      const course = await Course.findById(group.course).select("user");
      if (!course) {
        return res.status(404).send({ error: "Курс не найден" });
      }

      if (course.user.toString() !== req.user?._id.toString()) {
        return res
          .status(403)
          .send({ error: "Тренер не связан с курсом группы" });
      }

      const subscribedUser = group.clients.find(
        (user) => user.client.toString() === clientId,
      );

      if (!subscribedUser) {
        return res
          .status(400)
          .send({ error: "Клиент не найден в подписках группы" });
      }

      const newDate = new Date(newSubscribeEnd);
      if (isNaN(newDate.getTime())) {
        return res.status(400).send({ error: "Неверный формат новой даты" });
      }

      if (newDate <= new Date()) {
        return res.status(400).send({
          error: "Дата подписки должна быть больше текущей даты",
        });
      }

      subscribedUser.subscribeEnd = newSubscribeEnd;
      await group.save();

      return res.status(200).send({ message: "Подписка успешно продлена" });
    } catch (error) {
      next(error);
    }
  },
);

groupsRouter.patch(
  "/remove/:id",
  auth,
  permit("trainer", "client"),
  async (req: RequestWithUser, res, next) => {
    try {
      const groupId = req.params.id;
      const userId = req.user?._id;
      const { clientId } = req.body;

      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).send({ error: "Группа не найдена" });
      }

      const course = await Course.findById(group.course);
      if (!course) {
        return res.status(404).send({ error: "Курс не найден" });
      }

      if (req.user?.role === "trainer") {
        if (!(course.user as Types.ObjectId).equals(userId)) {
          return res
            .status(403)
            .send({ error: "Тренер не связан с этой группой" });
        }

        const subscriptionIndex = group.clients.findIndex((sub) =>
          new Types.ObjectId(sub.client).equals(clientId),
        );

        if (subscriptionIndex === -1) {
          return res.status(404).send({ error: "Клиент не найден в группе" });
        }

        group.clients.splice(subscriptionIndex, 1);
        await group.save();

        return res.send({ message: "Клиент успешно удален из группы" });
      }

      if (req.user?.role === "client") {
        const clientId = req.user?._id;
        const subscriptionIndex = group.clients.findIndex((sub) =>
          new Types.ObjectId(sub.client).equals(clientId),
        );

        if (subscriptionIndex === -1) {
          return res
            .status(403)
            .send({ error: "Клиент не состоит в этой группе" });
        }

        group.clients.splice(subscriptionIndex, 1);

        await group.save();
        return res.send({ message: "Вы успешно удалены из группы" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send({ error: "Ошибка при удалении клиента" });
    }
  },
);

groupsRouter.patch(
  "/frozen/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      if (!req.body.clientId) {
        return res.status(400).send({ error: "Не указан clientId" });
      }

      const group = await Group.findById(req.params.id);
      if (!group) {
        return res.status(404).send({ error: "Группа не найдена" });
      }

      const course = await Course.findById(group.course);
      if (!course || course.user.toString() !== req.user?._id.toString()) {
        return res
          .status(404)
          .send({ error: "Данный тренер не является создателям группы" });
      }

      const client = group.clients.find(
        (client) => client.client.toString() === req.body.clientId,
      );

      if (!client) {
        return res.status(404).send({ error: "Данного клиента нет в группе" });
      }

      client.status = "frozen";
      client.frozenAt = new Date();

      await group.save();

      return res.send({ message: "Клиент успешно заморожен" });
    } catch (error) {
      return next(error);
    }
  },
);

groupsRouter.patch(
  "/active/:id",
  auth,
  permit("client", "trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      if (!req.body.clientId) {
        return res.status(404).send({ error: "Не указан clientId" });
      }

      const group = await Group.findById(req.params.id);
      if (!group) {
        return res.status(404).send({ error: "Группа не найдена" });
      }

      const client = group.clients.find(
        (client) => client.client.toString() === req.body.clientId,
      );

      if (!client) {
        return res.status(404).send({ error: "Данного клиента нет в группе" });
      }

      const course = await Course.findById(group.course);

      if (
        (req.user?.role === "client" &&
          req.user._id.toString() !== req.body.clientId) ||
        (req.user?.role === "trainer" &&
          course?.user.toString() !== req.user._id.toString())
      ) {
        return res
          .status(403)
          .send({ error: "Вы не можете активировать статус другого клиента" });
      }

      client.status = "active";

      const now = new Date();
      const frozenAt = client.frozenAt
        ? new Date(client.frozenAt).getTime()
        : null;
      const subscribeEnd = client.subscribeEnd
        ? new Date(client.subscribeEnd).getTime()
        : null;

      if (frozenAt && subscribeEnd) {
        const remainingTime = subscribeEnd - frozenAt;

        if (remainingTime > 0) {
          client.subscribeEnd = new Date(now.getTime() + remainingTime);
        } else {
          client.subscribeEnd = now;
        }
      } else {
        client.subscribeEnd = now;
      }

      await group.save();

      return res.send({ message: "Статус клиента успешно изменен на активен" });
    } catch (error) {
      return next(error);
    }
  },
);

groupsRouter.put(
  "/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const id = req.params.id;
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });

      if (!mongoose.isValidObjectId(id))
        return res.status(400).send({ error: "Invalid group ID" });

      const group = await Group.findById(id);

      if (!group) {
        return res.status(404).send({ error: "Group not found" });
      }

      if (parseFloat(req.body.maxClients) < group.clients.length) {
        return res.status(400).send({
          error:
            "Максимальное количество клиентов не может быть меньше текущего количества клиентов в группе.",
        });
      }

      const updatedGroups = {
        title: req.body.title,
        maxClients: parseFloat(req.body.maxClients),
        startTime: req.body.startTime,
        scheduleLength: parseFloat(req.body.scheduleLength),
        trainingLevel: req.body.trainingLevel,
      };

      const updatedGroup = await Group.findOneAndUpdate(
        { _id: id },
        updatedGroups,
        { new: true, runValidators: true },
      );

      return res.status(200).send(updatedGroup);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }
      return next(error);
    }
  },
);

groupsRouter.delete(
  "/:id",
  auth,
  permit("trainer", "admin", "superAdmin"),
  async (req: RequestWithUser, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id))
        return res.status(400).send({ error: "Invalid group ID" });

      const group = await Group.findById(req.params.id);

      if (!group) {
        return res.status(404).send({ error: "Группа не найдена" });
      }

      const course = await Course.findById(group.course);

      if (!course) {
        return res.status(404).send({ error: "Курс не найден" });
      }

      if (
        req.user?.role === "admin" ||
        req.user?.role === "superAdmin" ||
        (req.user?.role === "trainer" && course.user.equals(req.user._id))
      ) {
        await Group.deleteOne({ _id: req.params.id });
        await Lesson.deleteMany({ group: req.params.id });
        return res.send({
          message: "Группа и связанные данные успешно удалены",
        });
      }

      return res
        .status(403)
        .send({ error: "Вы не можете удалить данную группу" });
    } catch (error) {
      return next(error);
    }
  },
);

export default groupsRouter;
