import express from "express";
import Trainer from "../models/Trainer";
import auth, { RequestWithUser } from "../middleware/auth";
import { imagesUpload } from "../multer";

const trainersRouter = express.Router();

trainersRouter.get("/", async (req, res) => {
  const allTrainers = await Trainer.find();
  return res.status(200).send(allTrainers);
});

trainersRouter.get("/:id", async (req, res) => {
  const id = req.params.id;
  const allTrainers = await Trainer.findById(id);
  return res.status(200).send(allTrainers);
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

      const trainerMutation = {
        user: user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        courseTypes: JSON.parse(req.body.courseTypes) as string[],
        timeZone: req.body.timeZone,
        avatar: req.file ? req.file.filename : null,
      };
      const trainer = await Trainer.create(trainerMutation);

      return res.status(200).send(trainer);
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

    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).send({ error: "Trainer not found" });
    }

    if (trainer.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .send({ error: "You do not have the rights to change this profile" });
    }
    const updatedTrainer = await Trainer.findByIdAndUpdate(
      trainerId,
      req.body,
      { new: true },
    );

    return res.status(200).send(updatedTrainer);
  } catch (error) {
    return next(error);
  }
});

export default trainersRouter;
