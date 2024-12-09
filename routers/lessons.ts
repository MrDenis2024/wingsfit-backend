import express from "express";
import Lesson from "../models/Lesson";
import auth, { RequestWithUser } from "../middleware/auth";
import mongoose from "mongoose";
import permit from "../middleware/permit";
import User from "../models/User";

const lessonsRouter = express.Router();

lessonsRouter.get("/", auth, async (req, res, next) => {
  try {
    const allLessons = await Lesson.find()
      .populate([
        {
          path: "course",
          populate: [
            { path: "user", select: "firstName lastName" },
            { path: "courseType", select: "name" },
          ],
        },
      ])
      .populate("presentUser", "firstName lastName");

    return res.status(200).send(allLessons);
  } catch (error) {
    return next(error);
  }
});

lessonsRouter.get("/:id", auth, async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ error: "Invalid ID" });
    }

    const oneLesson = await Lesson.findById(id)
      .populate({
        path: "course",
        populate: [
          { path: "user", select: "firstName lastName" },
          { path: "courseType", select: "name" },
        ],
      })
      .populate("presentUser", "firstName lastName");

    if (oneLesson === null) {
      return res.status(404).send({ error: "Lesson not found" });
    }

    return res.status(200).send(oneLesson);
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
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });

      if (req.body.title.trim() === "" || req.body.quantityClients <= 0) {
        return res
          .status(400)
          .send({ error: "Please enter a title or quantity clients" });
      }

      const lessonMutation = new Lesson({
        course: req.body.course,
        title: req.body.title,
        quantityClients: req.body.quantityClients,
        timeZone: req.body.timeZone ? req.body.timeZone : null,
        groupLevel: req.body.groupLevel ? req.body.groupLevel : null,
        ageLimit: req.body.ageLimit ? req.body.ageLimit : null,
        description: req.body.description ? req.body.description : null,
      });

      await lessonMutation.save();
      return res.status(200).send(lessonMutation);
    } catch (error) {
      next(error);
    }
  },
);

lessonsRouter.patch(
  "/:id/attendance",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    const { id } = req.params;
    const userId = req.body.userId;

    const findUser = await User.findById(userId);

    if (!userId || !mongoose.Types.ObjectId.isValid(userId) || !findUser) {
      return res
        .status(400)
        .send({ error: "Provide a valid array of user IDs" });
    }

    try {
      const findLesson = await Lesson.findById(id);
      if (!findLesson) {
        return res.status(404).send({ error: "Lesson not found" });
      }

      if (!findLesson.participants.includes(userId)) {
        return res
          .status(400)
          .send({ error: "User is not a participant of this lesson" });
      }

      if (findLesson.presentUser.includes(userId)) {
        return res
          .status(400)
          .send({ error: "User is already marked as present" });
      }

      await Lesson.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        { $addToSet: { presentUser: userId } },
      );

      return res.status(200).send({ message: "User marked as present" });
    } catch (e) {
      next(e);
    }
  },
);

export default lessonsRouter;
