import express from "express";
import auth, { RequestWithUser } from "../middleware/auth";
import permit from "../middleware/permit";
import Course from "../models/Course";
import mongoose from "mongoose";
import CourseRequest from "../models/CourseRequest";

const coursesRequestRouter = express.Router();

coursesRequestRouter.get(
  "/",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const courses = await Course.find({ user: req.user?._id });
      const courseIds = courses.map((course) => course._id);

      const requests = await CourseRequest.find({ course: { $in: courseIds } })
        .populate({ path: "client", select: "firstName lastName" })
        .populate({ path: "course", select: "title" });

      return res.send(requests);
    } catch (error) {
      return next(error);
    }
  },
);

coursesRequestRouter.post(
  "/",
  auth,
  permit("client"),
  async (req: RequestWithUser, res, next) => {
    try {
      const courseId = req.body.course;

      if (!mongoose.isValidObjectId(courseId))
        return res.status(400).send({ error: "Invalid ID" });

      const course = await Course.findById(courseId);

      if (!course) {
        return res.status(400).send({ error: "Course not found" });
      }

      const existingRequest = await CourseRequest.findOne({
        client: req.user?._id,
        course: courseId,
        status: { $ne: "unsubscribed" },
      });

      if (existingRequest) {
        return res.status(400).send({
          error: "You have already submitted a request for this course.",
        });
      }

      const requestMutation = {
        client: req.user?._id,
        course: courseId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newRequest = await CourseRequest.create(requestMutation);

      await newRequest.populate([
        { path: "client", select: "firstName lastName" },
        { path: "course", select: "title" },
      ]);

      return res.send(newRequest);
    } catch (error) {
      return next(error);
    }
  },
);

coursesRequestRouter.patch(
  "/:id",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const requestId = req.params.id;

      if (!mongoose.isValidObjectId(requestId))
        return res.status(400).send({ error: "Invalid ID" });

      const courseRequest = await CourseRequest.findById(requestId);

      if (!courseRequest) {
        return res.status(400).send({ error: "Request not found" });
      }

      const course = await Course.findById(courseRequest.course);

      if (!course || course.user.toString() !== req.user?._id.toString()) {
        return res.status(400).send({
          error: "You can only manage requests for your own courses.",
        });
      }

      if (!["accepted", "declined"].includes(req.body.status)) {
        return res.status(400).send({
          error: "Invalid status. Allowed values are accepted or declined.",
        });
      }

      courseRequest.status = req.body.status;
      courseRequest.updatedAt = new Date();
      await courseRequest.save();

      const updateRequest = await CourseRequest.findById(
        courseRequest._id,
      ).populate([
        { path: "client", select: "firstName lastName" },
        { path: "course", select: "title" },
      ]);

      return res.send(updateRequest);
    } catch (error) {
      return next(error);
    }
  },
);

coursesRequestRouter.delete(
  "/:id",
  auth,
  permit("client"),
  async (req: RequestWithUser, res, next) => {
    try {
      const requestId = req.params.id;

      if (!mongoose.isValidObjectId(requestId))
        return res.status(400).send({ error: "Invalid ID" });

      const request = await CourseRequest.findById(requestId);

      if (!request) {
        return res.status(400).send({ error: "Request not found" });
      }

      if (request.client.toString() !== req.user?._id.toString()) {
        return res.status(400).send({
          error: "You do not have permission to unsubscribe this request",
        });
      }

      if (request.status === "unsubscribed") {
        return res.status(400).send({ error: "Cannot unsubscribe request" });
      }

      request.status = "unsubscribed";
      await request.save();

      return res.send({
        message: "You have successfully unsubscribed from the course",
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default coursesRequestRouter;
