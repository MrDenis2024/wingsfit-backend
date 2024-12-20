import express from "express";
import Trainer from "../models/Trainer";
import auth, { RequestWithUser } from "../middleware/auth";
import User from "../models/User";
import mongoose, { Types } from "mongoose";
import Client from "../models/Client";
import permit from "../middleware/permit";
import { imagesUpload } from "../multer";

const trainersRouter = express.Router();

trainersRouter.get("/", async (req: RequestWithUser, res, next) => {
  try {
    const clientId = req.query.clientId as string;
    const findClient = await Client.findOne({ user: clientId });

    if (!findClient) {
      const allTrainers = await Trainer.find()
        .sort({ rating: -1 })
        .populate("user", "firstName lastName avatar");
      return res.status(200).send(allTrainers);
    }

    if (!findClient) {
      return res.status(404).send({ error: "Client not found" });
    }

    const preferredWorkoutTypes = findClient.preferredWorkoutType;

    if (!preferredWorkoutTypes || !preferredWorkoutTypes.length) {
      return res
        .status(404)
        .send({ error: "Client has no preferred workout types" });
    }

    const matchingTrainers = await Trainer.find({
      courseTypes: { $in: preferredWorkoutTypes },
    })
      .sort({ rating: -1 })
      .populate("user", "firstName lastName avatar");

    if (!matchingTrainers.length) {
      return res.status(404).send({
        error: "No trainers found matching the preferred workout types",
      });
    }

    return res.status(200).send(matchingTrainers);
  } catch (error) {
    return next(error);
  }
});

trainersRouter.get("/search", auth, async (req: RequestWithUser, res, next) => {
  try {
    const { courseTypes, availableDays, rating } = req.body;
    const filter: Record<string, any> = {};

    if (courseTypes && (courseTypes as string[]).length > 0)
      filter.courseTypes = { $in: courseTypes };

    if (availableDays && (availableDays as string).length > 0)
      filter.availableDays = { $in: availableDays };

    const trainers = await Trainer.find(filter)
      .sort(rating ? { rating: -1 } : {})
      .populate("user", "firstName lastName avatar");

    return res.send(trainers);
  } catch (e) {
    return next(e);
  }
});

trainersRouter.get("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).send({ error: "Invalid trainer ID" });

    const trainer = await Trainer.findOne({
      user: req.params.id,
    });

    if (!trainer) {
      return res.status(404).send({ error: "Trainer not found" });
    }

    if (user._id.equals(trainer.user)) {
      await trainer.populate(
        "user",
        "email firstName lastName role phoneNumber gender timeZone dateOfBirth notification avatar createdAt updatedAt lastActivity",
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

trainersRouter.post("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });
    if (user.role !== "trainer") {
      return res.status(400).send({
        error: "Bad Request! Trainer create only for users with role trainer!",
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

    const trainerMutation = {
      user,
      courseTypes: req.body.courseTypes,
      specialization: req.body.specialization,
      experience: req.body.experience,
      description: req.body.description,
      availableDays: req.body.availableDays,
    };

    const trainer = await Trainer.create(trainerMutation);
    await trainer.populate(
      "user",
      "_id email firstName lastName role phoneNumber gender timeZone dateOfBirth notification avatar",
    );

    return res.status(200).send(trainer);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }

    return next(error);
  }
});

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
      "_id email firstName lastName role phoneNumber gender timeZone dateOfBirth notification avatar",
    );

    return res.status(200).send(trainer);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }

    return next(error);
  }
});

trainersRouter.patch(
  "/certificates",
  auth,
  permit("trainer"),
  imagesUpload.single("certificate"),
  async (req: RequestWithUser, res, next) => {
    try {
      const user = req.user;

      if (!user) return res.status(400).send({ error: "User not found" });

      if (!req.file || !req.body.title) {
        return res
          .status(400)
          .send({ error: "Both certificate file and title are required" });
      }

      const trainer = await Trainer.findOne({ user: user._id });

      if (!trainer) {
        return res.status(404).send({ error: "Trainer not found" });
      }

      const newCertificate = {
        _id: new Types.ObjectId(),
        title: req.body.title,
        image: req.file.filename,
      };

      trainer.certificates.push(newCertificate);
      await trainer.save();

      await trainer.populate(
        "user",
        "_id email firstName lastName role phoneNumber gender timeZone dateOfBirth notification avatar",
      );

      return res.send(trainer);
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }

      return next(error);
    }
  },
);

trainersRouter.delete(
  "/certificates/:id",
  auth,
  permit("trainer", "admin", "superAdmin"),
  async (req: RequestWithUser, res, next) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send({ error: "Invalid ID" });
      }

      const user = req.user;

      if (!user) {
        return res.status(400).send({ error: "User not found" });
      }

      const condition =
        user.role === "trainer"
          ? { user: user._id, "certificates._id": req.params.id }
          : { "certificates._id": req.params.id };

      const trainer = await Trainer.findOne(condition);

      if (!trainer) {
        return res.status(404).send({ error: "Certificate not found" });
      }

      await Trainer.updateOne(
        { "certificates._id": req.params.id },
        { $pull: { certificates: { _id: req.params.id } } },
      );

      return res
        .status(200)
        .send({ message: "Certificate deleted successfully" });
    } catch (error) {
      return next(error);
    }
  },
);

export default trainersRouter;
