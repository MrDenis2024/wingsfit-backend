import express from "express";
import User from "../models/User";
import config from "../config";
import { OAuth2Client } from "google-auth-library";
import mongoose from "mongoose";
import auth, { RequestWithUser } from "../middleware/auth";

const usersRouter = express.Router();
const googleClient = new OAuth2Client(config.google.clientId);

usersRouter.get("/", async (_req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).send(users);
  } catch (error) {
    return next(error);
  }
});

usersRouter.post("/", async (req, res, next) => {
  try {
    const role = req.query.role as string;
    if (!role || (role !== "client" && role !== "trainer")) {
      return res.status(400).send({ error: "Role not found or uncorrected" });
    }
    const user = new User({
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      role: role,
    });
    user.getToken();
    await user.save();
    return res.status(200).send(user);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});
usersRouter.post("/sessions", async (req, res, next) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).send({ error: "Email and password are required" });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({ error: "User not found!" });
    }
    const isMatch = await user.checkPassword(req.body.password);
    if (!isMatch) {
      return res.status(400).send({ error: "Password is wrong!" });
    }
    user.getToken();
    await user.save();
    return res.status(200).send(user);
  } catch (error) {
    return next(error);
  }
});

usersRouter.post("/google", async (req, res, next) => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: config.google.clientId,
    });
    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).send({ error: "Google Login Error!" });
    }
    const email = payload.email;
    const id = payload.sub;
    const user = await User.findOne({ googleId: id });
    if (user) {
      return res.status(200).send(user);
    }
    if (!user) {
      const role = req.query.role as string;
      if (!role || (role !== "client" && role !== "trainer")) {
        return res.status(400).send({ error: "Role not found or uncorrected" });
      }
      const newPassword = crypto.randomUUID();
      const newUser = new User({
        email: email,
        password: newPassword,
        confirmPassword: newPassword,
        googleId: req.body.googleId,
        role: role,
      });
      newUser.getToken();
      await newUser.save();

      return res.status(200).send(newUser);
    }
  } catch (error) {
    return next(error);
  }
});

usersRouter.put("/", auth, async (req: RequestWithUser, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).send({ error: "User not found!" });
    }

    user.lastActivity = new Date();
    await user.save();

    return res
      .status(200)
      .send({ message: "Last activity updated successfully!" });
  } catch (error) {
    return next(error);
  }
});

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
