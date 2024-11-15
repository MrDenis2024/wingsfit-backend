import express from "express";
import cors from "cors";
import config from "./config";
import * as mongoose from "mongoose";
import usersRouter from "./routers/users";
import clientsRouter from "./routers/clients";
import trainersRouter from "./routers/trainers";
import coursesRouter from "./routers/courses";
import lessonsRouter from "./routers/lessons";
import { trainerReviewRouter } from "./routers/TrainerReview";
import { courseTypesRouter } from "./routers/courseTypes";
import adminsRouter from "./routers/admins";
import groupsRouter from "./routers/groups";

const app = express();
const port = 8000;

app.use(cors(config.corsOptions));
app.use(express.json());
app.use(express.static("public"));
app.use("/users", usersRouter);
app.use("/clients", clientsRouter);
app.use("/trainers", trainersRouter);
app.use("/courses", coursesRouter);
app.use("/lessons", lessonsRouter);
app.use("/courseTypes", courseTypesRouter);
app.use("/review", trainerReviewRouter);
app.use("/admins", adminsRouter);
app.use("/groups", groupsRouter);

const run = async () => {
  await mongoose.connect(config.database);

  app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
  });

  process.on("exit", () => {
    mongoose.disconnect();
  });
};

run().catch(console.error);
