import express from "express";
import cors from "cors";
import config from "./config";
import * as mongoose from "mongoose";
import usersRouter from "./routers/users";
import clientsRouter from "./routers/clients";
import trainersRouter from "./routers/trainers";
import coursesRouter from "./routers/courses";
import lessonsRouter from "./routers/lessons";
import { lessonTypeRouter } from "./routers/lessonTypes";
import adminsRouter from "./routers/admins";

const app = express();
const port = 8000;

app.use(cors(config.corsOptions));
app.use(express.json());
app.use(express.static("public"));
app.use("/users", usersRouter);
app.use("/clients", clientsRouter);
app.use("/trainers", trainersRouter);
app.use("/course", coursesRouter);
app.use("/lessons", lessonsRouter);
app.use("/lessonType", lessonTypeRouter);
app.use("/admins", adminsRouter);

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
