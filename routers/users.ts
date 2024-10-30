import express from "express";
import config from "../config";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";
import Client from "../models/Client";

const usersRouter = express.Router();
const googleClient = new OAuth2Client(config.google.clientId);

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

    const id = payload.sub;
    let user = await User.findOne({ googleId: id });
    if (!user) {
      const role = req.query.role as string;
      if (!role || (role !== "client" && role !== "trainer")) {
        return res.status(401).send({ error: "Role not found or uncorrected" });
      }

      user = new User({
        googleId: id,
        role: role,
      });

      if (role === "client") {
        const trainer = await Client.create({
          user,
          firstName: "someName",
          lastName: "someName",
          subscribes: ["dwdawdwa", "dawdawdawd"],
        });

        trainer.populate("user", "_id token");

        return res.status(200).send(trainer);
      }
    }

    user.getToken();
    await user.save();
    return res.send({ message: `${user.role} created`, token: user.token });
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
