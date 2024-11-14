import express from "express";
import Group from "../models/Group";

export const groupsRouter = express.Router();

groupsRouter.get("/:id", async (req, res, next) => {
  try {
    const groups = await Group.find({ course: req.params.id }).populate(
      "user",
      "firstName lastName",
    );
    return res.send(groups);
  } catch (error) {
    return next(error);
  }
});

export default groupsRouter;
