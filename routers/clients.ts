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
    return next(error);
  }
});

clientsRouter.get("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid client ID" });

    const client = await Client.findOne({
      user: req.params.id,
    });

    if (!client) {
      return res.status(400).send({ error: "Client not found" });
    }

    if (user._id.equals(client.user)) {
      await client.populate(
        "user",
        "email firstName lastName role phoneNumber gender timeZone dateOfBirth notification avatar",
      );
    } else {
      await client.populate(
        "user",
        "email firstName lastName role phoneNumber gender timeZone dateOfBirth avatar",
      );
    }

    return res.status(200).send(client);
  } catch (error) {
    return next(error);
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

      await User.findOneAndUpdate(
        { _id: user },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          gender: req.body.gender,
          timeZone: req.body.timeZone,
          dateOfBirth: req.body.dateOfBirth
            ? new Date(req.body.dateOfBirth)
            : null,
          avatar: req.file ? req.file.filename : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActivity: new Date(),
        },
        { new: true, runValidators: true },
      );

      if (req.body.notification === "true") {
        await User.findOneAndUpdate({ _id: user }, { notification: true });
      } else if (req.body.notification === "false") {
        await User.findOneAndUpdate({ _id: user }, { notification: false });
      }

      const clientMutation = {
        user,
        physicalData: req.body.physicalData,
        preferredWorkoutType: req.body.preferredWorkoutType,
        trainingLevel: req.body.trainingLevel,
      };

      const client = await Client.create(clientMutation);
      await client.populate(
        "user",
        "_id email firstName lastName role token phoneNumber gender timeZone dateOfBirth notification avatar",
      );

      return res.status(200).send(client);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }

      return next(error);
    }
  },
);

clientsRouter.put(
  "/",
  auth,
  imagesUpload.single("avatar"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });

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
        { user },
        {
          preferredWorkoutType: req.body.preferredWorkoutType,
          trainingLevel: req.body.trainingLevel,
          physicalData: req.body.physicalData,
        },
        { new: true },
      );

      if (!client) {
        return res.status(404).send({ error: "Client not found" });
      }

      await User.findOneAndUpdate(
        { _id: user },
        {
          gender: req.body.gender,
          timeZone: req.body.timeZone,
          dateOfBirth: req.body.dateOfBirth
            ? new Date(req.body.dateOfBirth)
            : null,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          avatar: req.file ? req.file.filename : null,
          updatedAt: new Date(),
          lastActivity: new Date(),
        },
        { new: true, runValidators: true },
      );

      if (req.body.notification === "true") {
        await User.findOneAndUpdate({ _id: user }, { notification: true });
      } else if (req.body.notification === "false") {
        await User.findOneAndUpdate({ _id: user }, { notification: false });
      }

      await client.populate(
        "user",
        "_id email firstName lastName role token gender timeZone dateOfBirth phoneNumber notification avatar",
      );

      return res.status(200).send(client);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }

      return next(error);
    }
  },
);

export default clientsRouter;
