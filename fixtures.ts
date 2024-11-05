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

  const trainerUser = new User({
    email: "trainer@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    firstName: "Vasya",
    lastName: "Pupkin",
    phoneNumber: "1234567890",
    notification: true,
  });
  trainerUser.getToken();
  await trainerUser.save();

  await Trainer.create({
    user: trainerUser._id,
    courseTypes: ["rumba", "tango", "lambada"],
    timeZone: "UTC+6",
    specialization: "Dance",
    experience: "5 years",
    certificates: "Certified Dance Instructor",
    description: "Professional dance trainer with a love for rhythm.",
    availableDays: "Monday, Wednesday, Friday",
  });

  const clientUser = new User({
    email: "client@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Jane",
    lastName: "Doe",
    phoneNumber: "1122334455",
    notification: true,
  });
  clientUser.getToken();
  await clientUser.save();

  await Client.create({
    user: clientUser._id,
    timeZone: "UTC+6",
    gender: "another",
    dateOfBirth: new Date("1995-05-15"),
    subscribes: [],
    preferredWorkoutType: "yoga",
    trainingLevel: "beginner",
    physicalData: "Injury in left leg",
  });

  await db.close();
};

run().catch(console.error);
