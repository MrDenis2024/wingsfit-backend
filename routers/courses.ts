import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import Course from "../models/Course";

const coursesRouter = express.Router();

coursesRouter.get("/", async (req, res) => {
  const allCourses = await Course.find();
  return res.status(200).send(allCourses);
});

coursesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id;
    const course = await Course.findById(id);
    return res.status(200).send(course);
  } catch (error) {
    return next(error);
  }
});
coursesRouter.post("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });
    if (user.role !== "trainer") {
      return res.status(400).send({
        error: "Bad Request! Only trainer can create course!",
      });
    }

    const courseMutation = {
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      format: req.body.format,
      schedule: req.body.schedule,
      scheduleLength: req.body.scheduleLength,
      price: req.body.price,
      maxClients: req.body.maxClients,
    };
    const newCourse = await Course.create(courseMutation);

    return res.status(200).send(newCourse);
  } catch (error) {
    return next(error);
  }
});

export default coursesRouter;
