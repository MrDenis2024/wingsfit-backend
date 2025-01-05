import mongoose from "mongoose";
import config from "./config";
import User from "./models/User";
import Trainer from "./models/Trainer";
import Client from "./models/Client";
import Course from "./models/Course";
import Lesson from "./models/Lesson";
import CourseType from "./models/CourseType";
import TrainerReview from "./models/TrainerReview";
import Group from "./models/Group";
import GroupChat from "./models/GroupChat";
import GroupChatMessage from "./models/GroupChatMessages";
import PrivateChat from "./models/PrivateChat";
import PrivateMessage from "./models/PrivateMessage";

const run = async () => {
  if (config.database) {
    await mongoose.connect(config.database);
  }
  const db = mongoose.connection;
  try {
    await db.dropCollection("trainers");
    await db.dropCollection("clients");
    await db.dropCollection("users");
    await db.dropCollection("courses");
    await db.dropCollection("lessons");
    await db.dropCollection("trainerreviews");
    await db.dropCollection("coursetypes");
    await db.dropCollection("groups");
    await db.dropCollection("groupchats");
    await db.dropCollection("groupchatmessages");
    await db.dropCollection("courserequests");
    await db.dropCollection("privatechats");
    await db.dropCollection("privatemessages");
  } catch (err) {
    console.log("skipping drop");
  }

  const superAdmin = new User({
    userName: "superAdmin",
    password: "superAdmin",
    confirmPassword: "superAdmin",
    role: "superAdmin",
  });
  superAdmin.getToken();
  await superAdmin.save();

  const admin = new User({
    userName: "admin",
    password: "admin",
    confirmPassword: "admin",
    role: "admin",
  });
  admin.getToken();
  await admin.save();

  const trainerUser = new User({
    email: "trainer@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    firstName: "Николай",
    lastName: "Александров",
    avatar: "fixtures/trainer.jpg",
    timeZone: { value: "America/Juneau", label: "(GMT-8:00) Alaska" },
    gender: "male",
    phoneNumber: "+996552022212",
    dateOfBirth: new Date("1990-08-10"),
    lastActivity: new Date("2024-11-10"),
  });
  trainerUser.getToken();
  await trainerUser.save();

  const clientUser = new User({
    email: "client@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Мария",
    lastName: "Федотова",
    avatar: "fixtures/client.jpg",
    timeZone: { value: "America/Juneau", label: "(GMT-8:00) Alaska" },
    gender: "female",
    dateOfBirth: new Date("2000-08-10"),
    phoneNumber: "+996222120542",
    lastActivity: new Date("2024-12-05"),
    createdAt: new Date("2024-12-02"),
  });
  clientUser.getToken();
  await clientUser.save();

  const trainerUser2 = new User({
    email: "trainer2@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    firstName: "Андрей",
    lastName: "Смирнов",
    avatar: "fixtures/trainer2.jpg",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "male",
    phoneNumber: "+996552033312",
    dateOfBirth: new Date("1985-05-15"),
    lastActivity: new Date("2024-11-11"),
    createdAt: new Date("2024-12-09"),
  });
  trainerUser2.getToken();
  await trainerUser2.save();

  const clientUser2 = new User({
    email: "client2@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Илона",
    lastName: "Маскова",
    avatar: "fixtures/client2.jpg",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "female",
    dateOfBirth: new Date("1995-02-20"),
    phoneNumber: "+996222129999",
    lastActivity: new Date("2024-12-10"),
    createdAt: new Date("2024-12-09"),
  });
  clientUser2.getToken();
  await clientUser2.save();

  const courseType1 = await CourseType.create({
    name: "Yoga",
    isPublished: true,
  });

  const courseType2 = await CourseType.create({
    name: "Cardio",
    isPublished: true,
  });

  const trainer1 = await Trainer.create({
    user: trainerUser._id,
    courseTypes: [courseType1._id],
    specialization: "Fitness",
    experience: "5 years",
    certificates: [
      {
        title: "Certified Personal Trainer",
        image: "fixtures/certificate1.jpg",
      },
    ],
    description: "Professional trainer with 5 years of experience.",
    availableDays: ["пн", "ср", "чт", "пт", "сб"],
  });

  const trainer2 = await Trainer.create({
    user: trainerUser2._id,
    courseTypes: [courseType2._id],
    specialization: "Cardio Training",
    experience: "8 years",
    certificates: [
      {
        title: "Cardio Specialist",
        image: "fixtures/certificate2.jpg",
      },
    ],
    description: "Experienced cardio trainer.",
    availableDays: ["пн", "ср", "чт", "сб", "вс"],
  });

  const course1 = await Course.create({
    user: trainerUser._id,
    courseType: courseType1._id,
    title: "Yoga for Beginners",
    description: "A beginner's guide to yoga.",
    format: "group",
    schedule: ["ср", "чт", "пт", "сб", "вс"],
    price: 100,
    image: "fixtures/yoga.jpg",
    waitList: [],
  });

  const course2 = await Course.create({
    user: trainerUser2._id,
    courseType: courseType2._id,
    title: "Intensive Cardio",
    description: "High-intensity cardio training for all levels.",
    format: "group",
    schedule: ["пн", "вт", "пт", "сб", "вс"],
    price: 150,
    image: "fixtures/cardio.jpg",
    waitList: [],
  });

  const group1 = await Group.create({
    title: "Evening Yoga Group",
    course: course1._id,
    clients: [
      {
        client: clientUser._id,
        subscribeEnd: new Date("2025-01-01"),
        addedAt: Date.now(),
      },
    ],
    maxClients: 10,
    scheduleLength: 1,
    startTime: "19:00",
    trainingLevel: "junior",
  });

  const group2 = await Group.create({
    title: "Cardio Training",
    course: course2._id,
    clients: [
      {
        client: clientUser2._id,
        subscribeEnd: new Date("2025-01-01"),
        addedAt: Date.now(),
      },
    ],
    maxClients: 10,
    scheduleLength: 2,
    startTime: "18:00",
    trainingLevel: "junior",
  });

  await Client.create({
    user: clientUser._id,
    preferredWorkoutType: [courseType1._id, courseType2._id],
    trainingLevel: "junior",
    physicalData: "Healthy",
  });

  await Client.create({
    user: clientUser2._id,
    preferredWorkoutType: [courseType1._id, courseType2._id],
    trainingLevel: "junior",
    physicalData: "Moderate",
  });

  await Lesson.create({
    group: group1._id,
    notPresent: [clientUser._id],
    arePresent: [clientUser2._id],
  });

  await Lesson.create({
    group: group2._id,
    notPresent: [clientUser2._id],
    arePresent: [clientUser._id],
  });

  await TrainerReview.create({
    clientId: clientUser._id,
    trainerId: trainerUser._id,
    rating: 5,
    comment: "Amazing trainer!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser._id,
    trainerId: trainerUser2._id,
    rating: 5,
    comment: "Good job!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser2._id,
    trainerId: trainerUser2._id,
    rating: 4,
    comment: "Good cardio session!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser2._id,
    trainerId: trainerUser._id,
    rating: 5,
    comment: "Great workout!",
    createdAt: new Date().toISOString(),
  });

  await trainer1.getRating();
  await trainer1.save();

  await trainer2.getRating();
  await trainer2.save();

  const groupChat1 = await GroupChat.create({
    group: group1._id,
    title: "Morning Yoga group",
  });

  await GroupChat.create({
    group: group2._id,
    title: "Evening Pilates group",
  });

  await GroupChatMessage.create({
    groupChat: groupChat1._id,
    author: trainerUser._id,
    message: "Good morning, everyone! Ready for yoga?",
    createdAt: new Date().toISOString(),
    isRead: [
      {
        user: clientUser._id,
        read: true,
      },
      {
        user: trainerUser._id,
        read: true,
      },
    ],
  });

  await GroupChatMessage.create({
    groupChat: groupChat1._id,
    author: clientUser._id,
    message: "Yes",
    createdAt: new Date().toISOString(),
    isRead: [
      {
        user: trainerUser._id,
        read: false,
      },
      {
        user: clientUser._id,
        read: true,
      },
    ],
  });

  const privateChat1 = await PrivateChat.create({
    firstPerson: trainerUser._id,
    secondPerson: clientUser._id,
    availableTo: [clientUser._id, trainerUser._id],
  });

  await PrivateChat.create({
    firstPerson: trainerUser2._id,
    secondPerson: clientUser._id,
    availableTo: [clientUser._id, trainerUser2._id],
  });

  await PrivateMessage.create({
    privateChat: privateChat1._id,
    author: clientUser._id,
    message: "Good morning!",
    createdAt: new Date().toISOString(),
    isRead: {
      user: trainerUser._id,
      read: true,
    },
  });

  await PrivateMessage.create({
    privateChat: privateChat1._id,
    author: trainerUser._id,
    message: "Hello!",
    createdAt: new Date().toISOString(),
    isRead: {
      user: clientUser._id,
      read: true,
    },
  });

  await db.close();
};

run().catch(console.error);
