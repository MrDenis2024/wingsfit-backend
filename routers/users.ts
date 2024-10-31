import express from "express";
import User from "../models/User";
import Trainer from "../models/Trainer";
import Client from "../models/Client";
import { imagesUpload } from "../multer";
import config from "../config";
import {OAuth2Client} from "google-auth-library";

const usersRouter = express.Router();
const googleClient = new OAuth2Client(config.google.clientId);

usersRouter.post(
  "/google",
  imagesUpload.single("avatar"),
  async (req, res, next) => {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: req.body.credential,
        audience: config.google.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).send({ error: "Google Login Error!" });
      }
      const id = payload.sub;
      const user = await User.findOne({ googleId: id });
      if (user) {
        if (user.role === "client") {
          const client = await Client.findOne({ user: user._id });
          return res.send({ user: user, profile: client });
        }

        if (user.role === "trainer") {
          const trainer = await Trainer.findOne({ user: user._id });
          return res.send({ user: user,profile: trainer });
        }
      }

      if (!user) {
        const role = req.query.role as string;
        if (!role || (role !== "client" && role !== "trainer")) {
          return res
            .status(400)
            .send({ error: "Role not found or uncorrected" });
        }
        const newUser = new User({
          googleId: req.body.googleId,
          role: role,
        });
        newUser.getToken();
        await newUser.save();

        if (role === "trainer") {
          const courseTypes = JSON.parse(req.body.courseTypes) as string[];
          const trainer = await Trainer.create({
            user: newUser._id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            courseTypes: courseTypes,
            timeZone: req.body.timeZone,
            avatar: req.file ? req.file.filename : null,
          });
          return res.status(200).send({ user, trainer });
        }

        if (role === "client") {
          const client = await Client.create({
            user: newUser._id,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            timeZone: req.body.timeZone,
            avatar: req.file ? req.file.filename : null,
            health: req.body.health,
            gender: req.body.gender,
            age: parseFloat(req.body.age),
          });
          return res.status(200).send({ newUser, client });
       }
      }
    } catch (error) {
      return next(error);
    }
  },
);
usersRouter.delete("/sessions", async (req, res, next) => {
  try {
    const headerValue = req.get("Authorization");
    if (!headerValue) return res.status(204).send();

    const [_bearer, token] = headerValue.split(" ");
    if (!token) return res.status(204).send();

    const user = await User.findOne({ token });
    if (!user) return res.status(204).send();

    user.getToken();
    await user.save();

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default usersRouter;
