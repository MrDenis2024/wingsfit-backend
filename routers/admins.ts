import express from "express";
import auth from "../middleware/auth";
import permit from "../middleware/permit";
import User from "../models/User";
import mongoose from "mongoose";
import Client from "../models/Client";

const adminsRouter = express.Router();

adminsRouter.get("/", auth, permit("superAdmin"), async (req, res, next) => {
  try {
    const admins = await User.find({ role: "admin" });
    return res.send(admins);
  } catch (error) {
    return next(error);
  }
});

adminsRouter.get(
  "/clients-stats",
  auth,
  permit("superAdmin", "admin"),
  async (req, res, next) => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      const activeClientsCount = await User.countDocuments({
        role: "client",
        lastActivity: { $gte: oneMonthAgo },
      });

      const clients = await Client.find().populate(
        "user",
        "firstName lastName role createdAt updatedAt lastActivity",
      );
      if (clients.length === 0) {
        return res.send({
          totalClients: 0,
          activeClients: 0,
          clients: [],
        });
      }

      return res.send({
        totalClients: clients.length,
        activeClients: activeClientsCount,
        clients,
      });
    } catch (error) {
      return next(error);
    }
  },
);

adminsRouter.post("/", auth, permit("superAdmin"), async (req, res, next) => {
  try {
    if (!req.body.userName || !req.body.password) {
      return res.status(400).send({ error: "Username and password are required" });
    }

    const newAdmin = new User({
      userName: req.body.userName,
      password: req.body.password,
      confirmPassword: req.body.password,
      role: "admin",
    });
    newAdmin.getToken();
    await newAdmin.save();
    return res.status(200).send(newAdmin);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).send(error);
    }
    return next(error);
  }
});

adminsRouter.post("/sessionsAdmin", async (req, res, next) => {
  try {
    if (!req.body.userName || !req.body.password) {
      return res
        .status(400)
        .send({ error: "Username and password are required" });
    }
    const admin = await User.findOne({ userName: req.body.userName });
    if (!admin) {
      return res
        .status(400)
        .send({ error: "Admin not found or password is incorrect!" });
    }
    const isMatch = await admin.checkPassword(req.body.password);
    if (!isMatch) {
      return res
        .status(400)
        .send({ error: "Admin not found or password is incorrect!" });
    }
    admin.getToken();
    await admin.save();
    return res.status(200).send(admin);
  } catch (error) {
    return next(error);
  }
});

adminsRouter.patch(
  "/:id/changePassword",
  auth,
  permit("superAdmin"),
  async (req, res, next) => {
    try {
      if (!req.body.newPassword) {
        return res.status(400).send({ error: "New password is required" });
      }

      const admin = await User.findById(req.params.id);
      if (!admin || admin.role !== "admin") {
        return res.status(400).send({ error: "Admin not found " });
      }

      admin.password = req.body.newPassword;
      admin.confirmPassword = req.body.newPassword;
      await admin.save();

      return res.send({ message: "Password updated successfully!" });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        return res.status(400).send(error);
      }
      return next(error);
    }
  },
);

adminsRouter.delete(
  "/:id",
  auth,
  permit("superAdmin"),
  async (req, res, next) => {
    try {
      const admin = await User.findById(req.params.id);
      if (admin === null || admin.role !== "admin") {
        return res.status(404).send({ error: "Admin not found" });
      }

      await User.deleteOne({ _id: req.params.id });

      return res.send({ message: "Admin deleted successfully." });
    } catch (error) {
      return next(error);
    }
  },
);

export default adminsRouter;
