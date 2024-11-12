import mongoose from "mongoose";
import config from "./config";
import User from "./models/User";
import Trainer from "./models/Trainer";
import Client from "./models/Client";
import Course from "./models/Course";
import Lesson from "./models/Lesson";
import LessonType from "./models/LessonType";

const run = async () => {
  await mongoose.connect(config.database);
  const db = mongoose.connection;
  try {
    await db.dropCollection("trainers");
    await db.dropCollection("clients");
    await db.dropCollection("users");
    await db.dropCollection("courses");
    await db.dropCollection("lessons");
    await db.dropCollection("lessontypes");
  } catch (err) {
    console.log("skipping drop");
  }

  const trainerUser = new User({
    email: "trainer@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    timeZone: {
      value: "asd",
      offset: "+6",
    },
    gender: "male",
    dateOfBirth: new Date("1990-11-15"),
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
    gender: "other",
    timeZone: {
      value: "asd",
      offset: "+6",
    },
    dateOfBirth: new Date("1995-05-15"),
    firstName: "Jane",
    lastName: "Doe",
    phoneNumber: "1122334455",
    notification: true,
  });
  clientUser.getToken();
  await clientUser.save();

  await Client.create({
    user: clientUser._id,
    subscribes: [],
    preferredWorkoutType: "yoga",
    trainingLevel: "beginner",
    physicalData: "Injury in left leg",
  });

  const courses = [
    {
      title: "Yoga Basics",
      description: "An introductory course on yoga.",
      format: "group",
      schedule: "Monday, Wednesday, Friday",
      scheduleLength: "1h",
      price: 150,
      maxClients: 10,
      user: trainerUser._id,
    },
    {
      title: "Advanced Pilates",
      description: "For experienced practitioners.",
      format: "single",
      schedule: "Tuesday, Thursday",
      scheduleLength: "1.5h",
      price: 200,
      maxClients: 5,
      user: trainerUser._id,
    },
  ];
  await Course.create(courses);

  const course = await Course.findOne({ title: "Yoga Basics" });

  if (!course) {
    return console.log("Course not found");
  }

  await Lesson.create({
    course: course._id,
    title: "Advanced Training",
    quantityClients: 10,
    timeZone: "+4 GTM",
    groupLevel: 2,
    participants:[clientUser?._id],
    ageLimit: 21,
    description: "A session for advanced practitioners.",
  });

  await LessonType.create({
    name: "Yoga",
    description: "An introductory course on yoga.",
    isPublished: false,
  }, {
    name: "Fitness",
    description: "An introductory course on fitness.",
    isPublished: false,
  });

  await db.close();
};

run().catch(console.error);
