import express from "express";
import Group from "../models/Group";
import auth, { RequestWithUser } from "../middleware/auth";
import Course from "../models/Course";
import permit from "../middleware/permit";

export const trainerStatisticsRouter = express.Router();

trainerStatisticsRouter.get(
  "/groups",
  auth,
  permit("trainer"),
  async (req: RequestWithUser, res, next) => {
    try {
      const userId = req.user?._id;

      const courses = await Course.find({ user: userId });

      const coursesWithGroups = await Promise.all(
        courses.map(async (course) => {
          const groups = await Group.find({ course: course._id }).populate(
            "clients",
            "firstName lastName phoneNumber",
          );
          return { course, groups };
        }),
      );

      const response = coursesWithGroups.map(({ course, groups }) => ({
        course: {
          _id: course._id,
          title: course.title,
          schedule: course.schedule,
          scheduleLength: course.scheduleLength,
          maxClients: course.maxClients,
        },
        groups: groups.map((group) => ({
          _id: group._id,
          title: group.title,
          clientsLimit: group.clientsLimit,
          clients: group.clients,
          trainingLevel: group.trainingLevel,
        })),
      }));

      return res.status(200).send(response);
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

export default trainerStatisticsRouter;
