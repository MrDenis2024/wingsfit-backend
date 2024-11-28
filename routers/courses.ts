import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Course from "../models/Course";
import { imagesUpload } from "../multer";
import User from "../models/User";
import mongoose from "mongoose";

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

  const oneTrainer = await Course.find({ user: trainerId })
    .populate("user", "firstName lastName")
    .populate("courseType", "name");
  return res.status(200).send(oneTrainer);
});

coursesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id))
      return res.status(400).send({ error: "Invalid ID" });

    const course = await Course.findById(id)
      .populate("user", "firstName lastName")
      .populate("courseType", "name");

    if (!course) {
      return res.status(404).send({ error: "Course not found" });
    }
    return res.status(200).send(course);
  } catch (error) {
    return next(error);
  }
});

coursesRouter.post(
  "/",
  auth,
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

      const courseType = req.body.courseType;

      if (!courseType) {
        return res.status(401).send({ error: "courseType not provided" });
      }

      const courseMutation = {
        user: user._id,
        title: req.body.title,
        courseType: req.body.courseType,
        description: req.body.description,
        format: req.body.format,
        schedule: req.body.schedule,
        scheduleLength: req.body.scheduleLength,
        price: req.body.price,
        maxClients: req.body.maxClients,
        image: req.file ? req.file.filename : null,
      };
      const newCourse = await Course.create(courseMutation);
      return res.status(200).send(newCourse);
    } catch (error) {
      return next(error);
    }
  },
);

export default coursesRouter;
