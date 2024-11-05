import express from "express";
import Trainer from "../models/Trainer";
import auth, { RequestWithUser } from "../middleware/auth";
import { imagesUpload } from "../multer";
import User from "../models/User";

const trainersRouter = express.Router();

trainersRouter.get("/", async (_req, res) => {
  const allTrainers = await Trainer.find();
  return res.status(200).send(allTrainers);
});

trainersRouter.get("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).send({ error: "User not found" });

    const trainer = await Trainer.findOne({
      _id: req.params.id,
      user,
    }).populate(
      "user",
      "email firstName lastName role token phoneNumber avatar createdAt updatedAt lastActivity",
    );

    if (!trainer) {
      return res.status(400).send({ error: "Trainer not found" });
    }

    return res.status(200).send(trainer);
  } catch (e) {
    return next();
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
        !req.body.courseTypes
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

      const trainerMutation = {
        user,
        timeZone: req.body.timeZone,
        courseTypes: req.body.courseTypes,
        specialization: req.body.specialization,
        experience: req.body.experience,
        certificates: req.body.certificates,
        description: req.body.description,
        availableDays: req.body.availableDays,
      };

      const trainer = await Trainer.create(trainerMutation);

      return res.status(200).send({ user: updatedUser, trainer });
    } catch (error) {
      return next(error);
    }
  },
);

trainersRouter.put("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const trainerId = req.params.id;
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });

    if (
      !req.body.firstName ||
      !req.body.lastName ||
      !req.body.timeZone ||
      !req.body.courseTypes
    ) {
      return res
        .status(400)
        .send({ error: "The required fields must be filled in!" });
    }

    const trainer = await Trainer.findOneAndUpdate(
      { _id: trainerId, user },
      {
        timeZone: req.body.timeZone,
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

    return res.status(200).send({ user: updatedUser, trainer });
  } catch (error) {
    return next(error);
  }
});

export default trainersRouter;
