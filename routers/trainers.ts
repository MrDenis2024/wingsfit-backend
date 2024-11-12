import express from "express";
import Trainer from "../models/Trainer";
import auth, { RequestWithUser } from "../middleware/auth";
import { imagesUpload } from "../multer";
import User from "../models/User";
import mongoose from "mongoose";

const trainersRouter = express.Router();

trainersRouter.get("/", async (_req, res, next) => {
  try {
    const allTrainers = await Trainer.find();
    return res.status(200).send(allTrainers);
  } catch (error) {
    return next(error);
  }
});

trainersRouter.get("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid trainer ID" });

    const trainer = await Trainer.findOne({
      _id: req.params.id,
      user,
    });

    if (!trainer) {
      return res.status(400).send({ error: "Trainer not found" });
    }

    if (user._id.equals(trainer.user)) {
      await trainer.populate(
        "user",
        "email firstName lastName role token phoneNumber gender timeZone dateOfBirth notification avatar createdAt updatedAt lastActivity",
      );
    } else {
      await trainer.populate(
        "user",
        "email firstName lastName role phoneNumber gender timeZone dateOfBirth avatar createdAt updatedAt lastActivity",
      );
    }

    return res.status(200).send(trainer);
  } catch (error) {
    return next(error);
  }
});

trainersRouter.post(
  "/",
  auth,
  imagesUpload.single("avatar"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) return res.status(401).send({ error: "User not found" });
      if (user.role !== "trainer") {
        return res.status(400).send({
          error:
            "Bad Request! Trainer create only for users with role trainer!",
        });
      }

      if (
        !req.body.firstName ||
        !req.body.lastName ||
        !req.body.timeZone ||
        !req.body.courseTypes ||
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
          timeZone: req.body.timeZone,
          gender: req.body.gender,
          dateOfBirth: req.body.dateOfBirth
            ? new Date(req.body.dateOfBirth)
            : null,
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

      const trainerMutation = {
        user,
        courseTypes: req.body.courseTypes,
        specialization: req.body.specialization,
        experience: req.body.experience,
        certificates: req.body.certificates,
        description: req.body.description,
        availableDays: req.body.availableDays,
      };

      const trainer = await Trainer.create(trainerMutation);
      await trainer.populate(
        "user",
        "_id email firstName lastName role token phoneNumber gender timeZone dateOfBirth notification avatar createdAt updatedAt lastActivity",
      );

      return res.status(200).send(trainer);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }

      return next(error);
    }
  },
);

trainersRouter.put("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });

    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.timeZone ||
      !req.body.courseTypes ||
      !req.body.gender
    ) {
      return res
        .status(400)
        .send({ error: "The required fields must be filled in!" });
    }

    const trainer = await Trainer.findOneAndUpdate(
      { user },
      {
        courseTypes: req.body.courseTypes,
        specialization: req.body.specialization,
        experience: req.body.experience,
        certificates: req.body.certificates,
        description: req.body.description,
        availableDays: req.body.availableDays,
      },
      { new: true },
    );

    if (!trainer) {
      return res.status(404).send({ error: "Trainer not found" });
    }

    await User.findOneAndUpdate(
      { _id: user },
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
        timeZone: req.body.timeZone,
        gender: req.body.gender,
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

    await trainer.populate(
      "user",
      "_id email firstName lastName role token phoneNumber gender timeZone dateOfBirth notification avatar createdAt updatedAt lastActivity",
    );

    return res.status(200).send(trainer);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }

    return next(error);
  }
});

export default trainersRouter;
