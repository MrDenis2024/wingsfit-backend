import express from "express";
import expressWs from "express-ws";
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
import trainerStatisticsRouter from "./routers/trainerStatistics";
import createGroupChatRouter from "./routers/groupChats";
import coursesRequestRouter from "./routers/coursesRequest";
import createPrivateChatRouter from "./routers/privateChats";
import chatsRouter from "./routers/chats";

const app = express();
const port = 8000;

expressWs(app);

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
app.use("/trainerStatistics", trainerStatisticsRouter);
app.use("/coursesRequest", coursesRequestRouter);
app.use("/groupChats", createGroupChatRouter());
app.use("/privateChats", createPrivateChatRouter());
app.use("/chats", chatsRouter);

const run = async () => {
  if (!config.database) {
    throw new Error(
      "DATABASE_URL is not defined in the environment variables.",
    );
  }

  await mongoose.connect(config.database);

  app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
  });

  process.on("exit", () => {
    mongoose.disconnect();
  });
};

run().catch(console.error);
