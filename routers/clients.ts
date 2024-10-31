import express from "express";
import Client from "../models/Client";
import auth, { RequestWithUser } from "../middleware/auth";

const clientsRouter = express.Router();

clientsRouter.get("/", async (req, res, next) => {
  try {
    const clients = await Client.find();
    return res.send(clients);
  } catch (e) {
    next(e);
  }
});

clientsRouter.get("/:id", async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    return res.send(client);
  } catch (e) {
    next(e);
  }
});

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

    res.send(updatedClient);
  } catch (e) {
    next(e);
  }
});

export default clientsRouter;
