import express from "express";
import Client from "../models/Client";
import auth, { RequestWithUser } from "../middleware/auth";
import { imagesUpload } from "../multer";

const clientsRouter = express.Router();

clientsRouter.get("/", async (req, res, next) => {
  try {
    const clients = await Client.find();
    return res.send(clients);
  } catch (error) {
    next(error);
  }
});

clientsRouter.get("/:id", async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
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
        return res
          .status(400)
          .send({
            error:
              "Bad Request! Client create only for users with role client!",
          });
      }
      const clientMutation = {
        user: user._id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        timeZone: req.body.timeZone,
        avatar: req.file ? req.file.filename : null,
        health: req.body.health,
        gender: req.body.gender,
        age: parseFloat(req.body.age),
      };
      const client = await Client.create(clientMutation);

      return res.status(200).send(client);
    } catch (error) {
      next(error);
    }
  },
);

clientsRouter.put("/:id", auth, async (req: RequestWithUser, res, next) => {
  try {
    const clientId = req.params.id;
    const user = req.user;

    if (!user) return res.status(401).send({ error: "User not found" });

    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).send({ error: "Client not found" });
    }

    if (client.user.toString() !== user._id.toString()) {
      return res
        .status(403)
        .send({ error: "You do not have the rights to change this profile" });
    }
    const updatedClient = await Client.findByIdAndUpdate(clientId, req.body, {
      new: true,
    });

    return res.status(200).send(updatedClient);
  } catch (error) {
    next(error);
  }
});

export default clientsRouter;
