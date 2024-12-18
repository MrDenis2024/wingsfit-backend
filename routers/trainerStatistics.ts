import express from "express";
import Group from "../models/Group";
import auth, { RequestWithUser } from "../middleware/auth";
import Course from "../models/Course";
import permit from "../middleware/permit";
import CourseRequest from "../models/CourseRequest";
import CoursesRequest from "./coursesRequest";
import { ICourseRequest } from "../types/courseTypes";

export const trainerStatisticsRouter = express.Router();

trainerStatisticsRouter.get(
  "/groups",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const userId = req.user?._id;

      const courses = await Course.find({ user: userId }, "_id");

      const courseIds = courses.map((course) => course._id);

      const groups = await Group.find({ course: { $in: courseIds } })
        .populate("clients", "firstName lastName")
        .populate("course", "title schedule scheduleLength");

      return res.status(200).send(groups);
    } catch (error) {
      return next(error);
    }
  },
);

trainerStatisticsRouter.get(
  "/clients",
  auth,
  async (req: RequestWithUser, res, next) => {
    try {
      const userId = req.user?._id;

      const clientStats = await Group.aggregate([
        {
          $lookup: {
            from: "courses",
            localField: "course",
            foreignField: "_id",
            as: "courseData",
          },
        },
        {
          $match: {
            "courseData.user": userId,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "clients",
            foreignField: "_id",
            as: "clientData",
          },
        },
        { $unwind: "$clientData" },
        { $unwind: "$courseData" },
        {
          $group: {
            _id: "$clientData._id",
            name: { $first: "$clientData.firstName" },
            lastName: { $first: "$clientData.lastName" },
            phoneNumber: { $first: "$clientData.phoneNumber" },
            email: { $first: "$clientData.email" },
            groups: { $addToSet: "$title" },
            courses: { $addToSet: "$courseData.title" },
          },
        },
      ]);

      return res.status(200).send(clientStats);
    } catch (error) {
      return next(error);
    }
  },
);

trainerStatisticsRouter.get(
  "/cancellations",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      const validStartDate =
        startDate && typeof startDate === "string" ? new Date(startDate) : null;
      const validEndDate =
        endDate && typeof endDate === "string" ? new Date(endDate) : null;

      if (validStartDate && isNaN(validStartDate.getTime())) {
        return res.status(400).send({ error: "Invalid startDate format" });
      }

      if (validEndDate && isNaN(validEndDate.getTime())) {
        return res.status(400).send({ error: "Invalid endDate format" });
      }

      const courses = await Course.find({ user: req.user?._id });
      const courseIds = courses.map((course) => course._id);

      const cancellations: ICourseRequest[] = await CourseRequest.aggregate([
        {
          $match: {
            course: { $in: courseIds },
            status: "declined",
            ...(validStartDate && { updatedAt: { $gte: validStartDate } }),
            ...(validEndDate && { updatedAt: { $lte: validEndDate } }),
          },
        },
      ]);
      console.log(cancellations.length);

      return res.send({
        canceled: cancellations.length,
      });
    } catch (error) {
      return next(error);
    }
  },
);

trainerStatisticsRouter.get(
  "/unsubscriptions",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      const validStartDate =
        startDate && typeof startDate === "string" ? new Date(startDate) : null;
      const validEndDate =
        endDate && typeof endDate === "string" ? new Date(endDate) : null;

      if (validStartDate && isNaN(validStartDate.getTime())) {
        return res.status(400).send({ error: "Invalid startDate format" });
      }

      if (validEndDate && isNaN(validEndDate.getTime())) {
        return res.status(400).send({ error: "Invalid endDate format" });
      }

      const courses = await Course.find({ user: req.user?._id });
      const courseIds = courses.map((course) => course._id);

      const unsubscriptions: ICourseRequest[] = await CourseRequest.aggregate([
        {
          $match: {
            course: { $in: courseIds },
            status: "unsubscribed",
            ...(validStartDate && { updatedAt: { $gte: validStartDate } }),
            ...(validEndDate && { updatedAt: { $lte: validEndDate } }),
          },
        },
      ]);

      return res.send({
        unsubscribed: unsubscriptions.length,
      });
    } catch (error) {
      return next(error);
    }
  },
);

trainerStatisticsRouter.get(
  "/cancellations-unsubscriptions",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const { startDate, endDate } = req.query;

      const validStartDate =
        startDate && typeof startDate === "string" ? new Date(startDate) : null;
      const validEndDate =
        endDate && typeof endDate === "string" ? new Date(endDate) : null;

      if (validStartDate && isNaN(validStartDate.getTime())) {
        return res.status(400).send({ error: "Invalid startDate format" });
      }

      if (validEndDate && isNaN(validEndDate.getTime())) {
        return res.status(400).send({ error: "Invalid endDate format" });
      }

      const courses = await Course.find({ user: req.user?._id });
      const courseIds = courses.map((course) => course._id);

      const [cancellations, unsubscriptions] = await Promise.all<
        ICourseRequest[]
      >([
        CourseRequest.aggregate([
          {
            $match: {
              course: { $in: courseIds },
              status: "declined",
              ...(validStartDate && { updatedAt: { $gte: validStartDate } }),
              ...(validEndDate && { updatedAt: { $lte: validEndDate } }),
            },
          },
        ]),
        CourseRequest.aggregate([
          {
            $match: {
              course: { $in: courseIds },
              status: "unsubscribed",
              ...(validStartDate && { updatedAt: { $gte: validStartDate } }),
              ...(validEndDate && { updatedAt: { $lte: validEndDate } }),
            },
          },
        ]),
      ]);

      return res.send({
        canceled: cancellations.length,
        unsubscribed: unsubscriptions.length,
      });
    } catch (error) {
      return next(error);
    }
  },
);

export default trainerStatisticsRouter;
