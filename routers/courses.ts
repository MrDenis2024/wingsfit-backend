import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Course from "../models/Course";
import { imagesUpload } from "../multer";
import User from "../models/User";
import mongoose, { FilterQuery } from "mongoose";
import Trainer from "../models/Trainer";
import { UpdatedCourse } from "../types/courseTypes";
import permit from "../middleware/permit";

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
    const { courseTypes, format, trainers, schedule } = req.body;

    const filter: FilterQuery<typeof Course> = {};

    if (courseTypes && (courseTypes as string[]).length > 0)
      filter.courseType = { $in: courseTypes };

    if (format && (format as string[]).length > 0) {
      filter.format = { $in: format };
    }

    if (trainers && (trainers as string[]).length > 0) {
      filter.user = { $in: trainers };
    }

    if (schedule && (schedule as string[]).length > 0) {
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

      // const courseType = req.body.courseType;
      //
      // if (!courseType) {
      //   return res.status(400).send({ error: "courseType not provided" });
      // }

      const courseMutation = {
        user: user._id,
        title: req.body.title,
        courseType: req.body.courseType,
        description: req.body.description,
        format: req.body.format,
        schedule: req.body.schedule,
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

      const updatedFields: UpdatedCourse = {
        title: req.body.title,
        courseType: req.body.courseType,
        description: req.body.description,
        format: req.body.format,
        schedule: req.body.schedule,
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

export default coursesRouter;
