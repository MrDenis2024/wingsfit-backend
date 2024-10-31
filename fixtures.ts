import mongoose from "mongoose";
import config from "./config";
import User from "./models/User";
import Trainer from "./models/Trainer";
import Client from "./models/Client";

const run = async () => {
  await mongoose.connect(config.database);
  const db = mongoose.connection;
  try {
    await db.dropCollection("trainers");
    await db.dropCollection("clients");
    await db.dropCollection("users");
  } catch (err) {
    console.log("skipping drop");
  }

  const firstTrainer = new User({
    email: "trainer@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
  });
  firstTrainer.getToken();
  await firstTrainer.save();
  const secondTrainer = new User({
    email: "trainer2@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
  });
  secondTrainer.getToken();
  await secondTrainer.save();

  const firstClient = new User({
    email: "client@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
  });
  firstClient.getToken();
  await firstClient.save();
  const secondClient = new User({
    email: "client2@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
  });
  secondClient.getToken();
  await secondClient.save();

  await Trainer.create(
    {
      user: firstTrainer,
      firstName: "Vasya",
      lastName: "Pupkin",
      courseTypes: ["rumba", "tango", "lambada"],
      timeZone: "UTC +6",
      avatar: null,
    },
    {
      user: secondTrainer,
      firstName: "Jane",
      lastName: "kuskin",
      courseTypes: ["box", "fitness", "bodybuilding"],
      timeZone: "UTC +6",
      avatar: null,
    },
  );
  await Client.create(
    {
      user: firstClient,
      firstName: "jane",
      lastName: "doe",
      timeZone: "UTC +6",
      avatar: null,
      health: "wrong left leg",
      gender: "another",
      age: 27,
    },
    {
      user: secondClient,
      firstName: "john",
      lastName: "doe",
      timeZone: "UTC +7",
      avatar: null,
      health: "fat",
      gender: "male",
      age: 20,
    },
  );

  await db.close();
};

run().catch(console.error);
