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
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid client ID" });

    const client = await Client.findOne({
      _id: req.params.id,
    });

    if (!client) {
      return res.status(400).send({ error: "Client not found" });
    }

    if (user._id.equals(client.user)) {
      await client.populate(
        "user",
        "email firstName lastName role phoneNumber notification avatar createdAt updatedAt lastActivity",
      );
    } else {
      await client.populate(
        "user",
        "email firstName lastName role phoneNumber avatar createdAt updatedAt lastActivity",
      );
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

      await User.findOneAndUpdate(
        { _id: user },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          avatar: req.file ? req.file.filename : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActivity: new Date(),
        },
        { new: true },
      );

      if (req.body.notification === "true") {
        await User.findOneAndUpdate({ _id: user }, { notification: true });
      } else if (req.body.notification === "false") {
        await User.findOneAndUpdate({ _id: user }, { notification: false });
      }

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
      await client.populate(
        "user",
        "_id email firstName lastName role token phoneNumber notification avatar createdAt updatedAt lastActivity",
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
          gender: req.body.gender,
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

      const dateOfBirth = new Date(req.body.dateOfBirth);

      if (dateOfBirth.toDateString() !== "Invalid Date") {
        const updatedDateOfBirth = await Client.findOneAndUpdate(
          { user },
          { dateOfBirth },
          { new: true },
        );

        if (updatedDateOfBirth) {
          client.dateOfBirth = updatedDateOfBirth.dateOfBirth;
        }
      }

      await User.findOneAndUpdate(
        { _id: user },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          avatar: req.file ? req.file.filename : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastActivity: new Date(),
        },
        { new: true },
      );

      if (req.body.notification === "true") {
        await User.findOneAndUpdate({ _id: user }, { notification: true });
      } else if (req.body.notification === "false") {
        await User.findOneAndUpdate({ _id: user }, { notification: false });
      }

      await client.populate(
        "user",
        "_id email firstName lastName role token phoneNumber notification avatar createdAt updatedAt lastActivity",
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
