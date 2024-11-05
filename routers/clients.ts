import express from "express";
import Client from "../models/Client";
import auth, { RequestWithUser } from "../middleware/auth";
import { imagesUpload } from "../multer";
import User from "../models/User";
import mongoose from "mongoose";

const clientsRouter = express.Router();

clientsRouter.get("/", async (_req, res, next) => {
  try {
    const clients = await Client.find();
    return res.send(clients);
  } catch (error) {
    next(error);
  }
});

clientsRouter.get("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send({ error: "User not found" });

    const client = await Client.findOne({ _id: req.params.id, user }).populate(
      "user",
      "email firstName lastName role token phoneNumber avatar createdAt updatedAt lastActivity",
    );

    if (!client) {
      return res.status(400).send({ error: "Client not found" });
    }

    return res.status(200).send(client);
  } catch (error) {
    next(error);
  }
});

clientsRouter.post(
  "/",
  auth,
  imagesUpload.single("avatar"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });

      if (user.role !== "client") {
        return res.status(400).send({
          error: "Bad Request! Client create only for users with role client!",
        });
      }

      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.timeZone ||
        !req.body.gender
      ) {
        return res
          .status(400)
          .send({ error: "The required fields must be filled in!" });
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          notification: req.body.notification !== "false",
          avatar: req.file ? req.file.filename : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActivity: new Date(),
        },
        { new: true },
      );

      const clientMutation = {
        user,
        timeZone: req.body.timeZone,
        physicalData: req.body.physicalData,
        gender: req.body.gender,
        dateOfBirth: new Date(req.body.dateOfBirth),
        preferredWorkoutType: req.body.preferredWorkoutType,
        trainingLevel: req.body.trainingLevel,
      };

      const client = await Client.create(clientMutation);

      return res.status(200).send({ user: updatedUser, client });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }

      next(error);
    }
  },
);

clientsRouter.put(
  "/:id",
  auth,
  imagesUpload.single("avatar"),
  async (req: RequestWithUser, res, next) => {
    try {
      const clientId = req.params.id;
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });
      if (!mongoose.isValidObjectId(clientId))
        return res.status(400).send({ error: "Invalid client ID!" });

      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.timeZone ||
        !req.body.gender
      ) {
        return res
          .status(400)
          .send({ error: "The required fields must be filled in!" });
      }

      const client = await Client.findOneAndUpdate(
        { _id: clientId, user },
        {
          gender: req.body.gender,
          dateOfBirth: new Date(req.body.dateOfBirth),
          timeZone: req.body.timeZone,
          preferredWorkoutType: req.body.preferredWorkoutType,
          trainingLevel: req.body.trainingLevel,
          physicalData: req.body.physicalData,
        },
        { new: true },
      );

      if (!client) {
        return res.status(404).send({ error: "Client not found" });
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          notification: req.body.notification !== "false",
          avatar: req.file ? req.file.filename : null,
          updatedAt: new Date(),
          lastActivity: new Date(),
        },
        { new: true },
      );

      return res.status(200).send({ user: updatedUser, client });
    } catch (error) {
      next(error);
    }
  },
);

export default clientsRouter;
