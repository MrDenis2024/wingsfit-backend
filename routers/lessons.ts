import express from "express";
import Lesson from "../models/Lesson";
import auth, { RequestWithUser } from "../middleware/auth";
import mongoose from "mongoose";

const lessonsRouter = express.Router();

lessonsRouter.get("/", async (req, res) => {
  const allLessons = await Lesson.find();
  return res.status(200).send(allLessons);
});

lessonsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(401).send({ error: "Id wrong" });
    }

    const oneLesson = await Lesson.findById(id);

    if (oneLesson === null) {
      return res.status(404).send({ error: "Lesson not found" });
    }

    return res.status(200).send(oneLesson);
  } catch (e) {
    next(e);
  }
});

lessonsRouter.post("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });

    if (user.role !== "trainer") {
      return res.status(400).send({
        error: "Bad Request! Lesson create only for users with role trainer!",
      });
    }

    if (req.body.title.trim() === "" || req.body.quantityClients <= 0) {
      return res
        .status(400)
        .send({ error: "Please enter a title or quantity clients" });
    }

    const lessonMutation = {
      course: req.body.course,
      title: req.body.title,
      quantityClients: req.body.quantityClients,
      timeZone: req.body.timeZone ? req.body.timeZone : null,
      groupLevel: req.body.groupLevel ? req.body.groupLevel : null,
      ageLimit: req.body.ageLimit ? req.body.ageLimit : null,
      description: req.body.description ? req.body.description : null,
    };

    const lesson = await Lesson.create(lessonMutation);
    return res.status(200).send(lesson);
  } catch (error) {
    next(error);
  }
});

export default lessonsRouter;
