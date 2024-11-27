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

const run = async () => {
  await mongoose.connect(config.database);
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

  const yogaCourseType = new CourseType({
    name: "Yoga",
    description: "Yoga for all levels",
  });
  await yogaCourseType.save();

  const pilatesCourseType = new CourseType({
    name: "Pilates",
    description: "Pilates for core strength",
  });
  await pilatesCourseType.save();

  const aerobicsCourseType = new CourseType({
    name: "Aerobics",
    description: "Aerobics for cardiovascular fitness",
  });
  await aerobicsCourseType.save();

  const stretchingCourseType = new CourseType({
    name: "Stretching",
    description: "Stretching exercises for flexibility",
  });
  await stretchingCourseType.save();

  const trainerUser1 = new User({
    email: "trainer1@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    timeZone: { value: "America/Juneau", label: "(GMT-8:00) Alaska" },
    gender: "male",
    dateOfBirth: new Date("1990-11-15"),
    firstName: "Vasya",
    lastName: "Pupkin",
    phoneNumber: "1234567890",
    notification: true,
  });
  trainerUser1.getToken();
  await trainerUser1.save();

  const trainerUser2 = new User({
    email: "trainer2@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    timeZone: { value: "America/Juneau", label: "(GMT-8:00) Alaska" },
    gender: "female",
    dateOfBirth: new Date("1985-04-20"),
    firstName: "Anna",
    lastName: "Ivanova",
    phoneNumber: "0987654321",
    notification: false,
  });
  trainerUser2.getToken();
  await trainerUser2.save();

  const trainer1 = new Trainer({
    user: trainerUser1._id,
    courseTypes: [yogaCourseType._id, pilatesCourseType._id],
    specialization: "Yoga and Pilates",
    experience: "5 years",
    certificates: [{ title: "Первое место по боксу", image: "asd" }],
    description: "Expert in yoga with 5 years of experience.",
    availableDays: "Monday, Wednesday, Friday",
  });
  await trainer1.save();

  const trainer2 = new Trainer({
    user: trainerUser2._id,
    courseTypes: [aerobicsCourseType._id, stretchingCourseType._id],
    specialization: "Aerobics",
    experience: "8 years",
    certificates: [{ title: "Первое место по боксу", image: "asd" }],
    description: "Passionate about fitness and flexibility.",
    availableDays: "Tuesday, Thursday, Saturday",
  });
  await trainer2.save();

  const trainerUser3 = new User({
    email: "trainer3@fit.local",
    password: "test3",
    confirmPassword: "test3",
    role: "trainer",
    timeZone: { value: "America/Juneau", label: "(GMT-8:00) Alaska" },
    gender: "female",
    dateOfBirth: new Date("1992-03-10"),
    firstName: "Olga",
    lastName: "Kovaleva",
    phoneNumber: "1234567893",
    notification: true,
    lastActivity: new Date("2024-11-10"),
  });
  trainerUser3.getToken();
  await trainerUser3.save();

  const trainer3 = new Trainer({
    user: trainerUser3._id,
    courseTypes: [yogaCourseType._id, pilatesCourseType._id],
    specialization: "Fitness",
    experience: "6 years",
    certificates: [{ title: "Первое место по боксу", image: "asd" }],
    description:
      "Experienced fitness coach with a focus on holistic well-being.",
    availableDays: "Tuesday, Thursday, Saturday",
  });
  await trainer3.save();

  const clientUser = new User({
    email: "client@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    timeZone: { value: "America/Juneau", label: "(GMT-8:00) Alaska" },
    gender: "female",
    dateOfBirth: new Date("2000-08-10"),
    firstName: "Maria",
    lastName: "Petrova",
    phoneNumber: "1122334455",
    notification: true,
    lastActivity: new Date("2024-11-10"),
  });
  clientUser.getToken();
  await clientUser.save();

  const clientUser2 = new User({
    email: "client2@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    timeZone: { value: "America/Juneau", label: "(GMT-8:00) Alaska" },
    gender: "male",
    dateOfBirth: new Date("1995-05-15"),
    firstName: "Alex",
    lastName: "Smirnov",
    phoneNumber: "9988776655",
    notification: true,
    lastActivity: new Date("2024-08-13"),
  });
  clientUser2.getToken();
  await clientUser2.save();

  const client = new Client({
    user: clientUser._id,
    physicalData: "Injury in left leg",
    preferredWorkoutType: [aerobicsCourseType._id, stretchingCourseType._id],
    trainingLevel: "junior",
    subscribes: [],
  });
  await client.save();

  const client2 = new Client({
    user: clientUser2._id,
    physicalData: "No injuries",
    preferredWorkoutType: [aerobicsCourseType._id, stretchingCourseType._id],
    trainingLevel: "middle",
    subscribes: [],
  });
  await client2.save();

  const course1 = new Course({
    title: "Morning Yoga",
    description: "Start your day with yoga",
    trainer: trainer1._id,
    courseType: yogaCourseType._id,
    duration: 60,
    schedule: "Monday, Wednesday, Friday",
    maxClients: 10,
    scheduleLength: 5,
    user: trainerUser1._id,
  });
  await course1.save();

  const course2 = new Course({
    title: "Evening Pilates",
    description: "Relax with evening pilates",
    trainer: trainer1._id,
    courseType: pilatesCourseType._id,
    duration: 60,
    schedule: "Tuesday, Thursday",
    maxClients: 10,
    scheduleLength: 5,
    user: trainerUser2._id,
  });
  await course2.save();

  const course3 = new Course({
    title: "Cardio Aerobics",
    description: "A high-energy cardio aerobics class",
    trainer: trainer2._id,
    courseType: aerobicsCourseType._id,
    duration: 60,
    schedule: "Monday, Wednesday, Friday",
    maxClients: 15,
    scheduleLength: 5,
    user: trainerUser2._id,
  });
  await course3.save();

  const course4 = new Course({
    title: "Stretching and Flexibility",
    description: "Increase your flexibility with stretching",
    trainer: trainer2._id,
    courseType: stretchingCourseType._id,
    duration: 60,
    schedule: "Tuesday, Thursday, Saturday",
    maxClients: 12,
    scheduleLength: 5,
    user: trainerUser2._id,
  });
  await course4.save();

  const lesson1 = new Lesson({
    course: course1._id,
    date: new Date("2024-11-15T07:00:00Z"),
    duration: 60,
    trainer: trainer1._id,
    quantityClients: 10,
    groupLevel: 2,
    timeZone: "GMT+1",
    title: "Morning Yoga Session",
  });
  await lesson1.save();

  const lesson2 = new Lesson({
    course: course2._id,
    date: new Date("2024-11-16T18:00:00Z"),
    duration: 60,
    trainer: trainer1._id,
    quantityClients: 10,
    groupLevel: 2,
    timeZone: "GMT+1",
    title: "Evening Pilates Session",
  });
  await lesson2.save();

  const lesson3 = new Lesson({
    course: course3._id,
    date: new Date("2024-11-18T07:00:00Z"),
    duration: 60,
    trainer: trainer2._id,
    quantityClients: 12,
    groupLevel: 3,
    timeZone: "GMT+2",
    title: "Cardio Aerobics Session",
  });
  await lesson3.save();

  const lesson4 = new Lesson({
    course: course4._id,
    date: new Date("2024-11-19T18:00:00Z"),
    duration: 60,
    trainer: trainer2._id,
    quantityClients: 10,
    groupLevel: 2,
    timeZone: "GMT+2",
    title: "Stretching and Flexibility Session",
  });
  await lesson4.save();

  const review1 = new TrainerReview({
    trainerId: trainerUser1._id,
    clientId: clientUser._id,
    rating: 5,
    comment: "Excellent yoga class!",
  });
  await review1.save();

  const review2 = new TrainerReview({
    trainerId: trainerUser1._id,
    clientId: clientUser._id,
    rating: 4,
    comment: "Great aerobics session!",
  });
  await review2.save();

  const review3 = new TrainerReview({
    trainerId: trainerUser2._id,
    clientId: clientUser2._id,
    rating: 4,
    comment: "Great aerobics session, really enjoyed it!",
  });
  await review3.save();

  const review4 = new TrainerReview({
    trainerId: trainerUser2._id,
    clientId: clientUser2._id,
    rating: 5,
    comment: "Loved the stretching session, feeling more flexible!",
  });
  await review4.save();

  await Group.create([
    {
      title: "Group 1",
      course: course1._id,
      clients: [clientUser._id , clientUser2._id],
      clientsLimit: course1.maxClients,
      schedule: course1.schedule,
      trainingLevel: "junior",
    },
    {
      title: "Group 1/1",
      course: course1._id,
      clients: [clientUser2._id],
      clientsLimit: course1.maxClients,
      schedule: course1.schedule,
      trainingLevel: "middle",
    },
    {
      title: "Group 2",
      course: course2._id,
      clients: [clientUser._id , clientUser2._id],
      clientsLimit: course2.maxClients,
      schedule: course2.schedule,
      trainingLevel: "junior",
    },
  ]);

  await db.close();
};

run().catch(console.error);
