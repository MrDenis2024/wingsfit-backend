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

coursesRouter.get("/", async (req, res) => {
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
    .populate("courseType", "name");
  return res.status(200).send(courses);
});

coursesRouter.get("/search", auth, async (req, res, next) => {
  try {
    const courseTypes = ( req.query.courseTypes as string ).split(",");
    const format = ( req.query.format as string ).split(",");
    const trainers = ( req.query.trainers as string ).split(",");
    const schedule = ( req.query.schedule as string ).split(",");
    const filter: FilterQuery<typeof Course> = {};

    if (courseTypes && courseTypes.every(id => mongoose.isValidObjectId(id))) {
      filter.courseType = { $in: courseTypes };
    }

    if (format && format.every(item => item.trim() !== "")) {
      filter.format = { $in: format };
    }

    if (trainers && trainers.every(id => mongoose.isValidObjectId(id))) {
      filter.user = { $in: trainers };
    }

    if (schedule && schedule.every(item => item.trim() !== "")) {
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
