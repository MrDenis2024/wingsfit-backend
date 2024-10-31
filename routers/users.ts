import express from "express";
import User from "../models/User";
import config from "../config";
import { OAuth2Client } from "google-auth-library";

const usersRouter = express.Router();
const googleClient = new OAuth2Client(config.google.clientId);

usersRouter.post(
  "/google",
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
          return res.status(200).send(user);
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

        return res.status(200).send(newUser);

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
