import mongoose from "mongoose";
import config from "./config";
import User from "./models/User";
import Trainer from "./models/Trainer";
import Client from "./models/Client";
import Course from "./models/Course";
import Lesson from "./models/Lesson";
import LessonType from "./models/LessonType";
import TrainerReview from "./models/TrainerReview";

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
    await db.dropCollection("trainerReview");
  } catch (err) {
    console.log("skipping drop");
  }

  const trainerUser1 = new User({
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
  trainerUser1.getToken();
  await trainerUser1.save();

  await Trainer.create({
    user: trainerUser1._id,
    courseTypes: ["rumba", "tango", "lambada"],
    specialization: "Dance",
    experience: "5 years",
    certificates: "Certified Dance Instructor",
    description: "Professional dance trainer with a love for rhythm.",
    availableDays: "Monday, Wednesday, Friday",
  })

  const trainerUser2 = new User({
    email: "trainer2@fit.local",
    password: "test2",
    confirmPassword: "test2",
    role: "trainer",
    timeZone: {
      value: "asd",
      offset: "+5",
    },
    gender: "female",
    dateOfBirth: new Date("1990-08-17"),
    firstName: "Anna",
    lastName: "Smirnova",
    phoneNumber: "1234567892",
    notification: true,
  });
  trainerUser2.getToken();
  await trainerUser2.save();

  await Trainer.create({
    user: trainerUser2._id,
    courseTypes: ["fitness", "yoga", "pilates"],
    specialization: "Fitness",
    experience: "6 years",
    certificates: "Certified Fitness Trainer",
    description: "Experienced fitness coach with a focus on holistic well-being.",
    availableDays: "Tuesday, Thursday, Saturday",
  });

  const trainerUser3 = new User({
    email: "trainer3@fit.local",
    password: "test3",
    confirmPassword: "test3",
    role: "trainer",
    timeZone: {
      value: "asd",
      offset: "+7",
    },
    gender: "female",
    dateOfBirth: new Date("1992-03-10"),
    firstName: "Olga",
    lastName: "Kovaleva",
    phoneNumber: "1234567893",
    notification: true,
  });
  trainerUser3.getToken();
  await trainerUser3.save();

  const trainer3 = await Trainer.create({
    user: trainerUser3._id,
    courseTypes: ["swimming", "water aerobics"],
    specialization: "Swimming",
    experience: "4 years",
    certificates: "Certified Swimming Instructor",
    description: "Skilled swimming coach for all levels of training.",
    availableDays: "Monday, Wednesday, Sunday",
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
      user: trainerUser1._id,
    },
    {
      title: "Advanced Pilates",
      description: "For experienced practitioners.",
      format: "single",
      schedule: "Tuesday, Thursday",
      scheduleLength: "1.5h",
      price: 200,
      maxClients: 5,
      user: trainerUser1._id,
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
    participants: [clientUser?._id],
    ageLimit: 21,
    description: "A session for advanced practitioners.",
  });

  await LessonType.create(
    {
      name: "Yoga",
      description: "An introductory course on yoga.",
      isPublished: false,
    },
    {
      name: "Fitness",
      description: "An introductory course on fitness.",
      isPublished: false,
    },
  );

  await TrainerReview.create(
    {
      clientId: clientUser._id,
      trainerId: trainerUser1._id,
      rating: 4,
      comment:
        "The coach is just wonderful! Classes are always held at a high level, the coach explains the material clearly and accessible. Thanks to his approach, I quickly improved my results. I highly recommend it!",
    },
    {
      clientId: clientUser._id,
      trainerId: trainerUser1._id,
      rating: 5,
      comment:
        "The coach explains the basic exercises well, but I would like to pay more attention to technique and individual characteristics. In general, classes are useful, but there are places for improvement.",
    },
  );

  await TrainerReview.create(
      {
        clientId: clientUser._id,
        trainerId: trainerUser2._id,
        rating: 5,
        comment:
            "The classes are very motivating! The coach pushes me to do my best while maintaining a positive atmosphere. Highly recommend for anyone looking for a fitness challenge!",
      },
      {
        clientId: clientUser._id,
        trainerId: trainerUser2._id,
        rating: 4,
        comment:
            "Great trainer, but sometimes the schedule can be a bit tight. However, the classes are definitely worth it, and I feel stronger after each session.",
      }
  );

  await TrainerReview.create(
      {
        clientId: clientUser._id,
        trainerId: trainerUser3._id,
        rating: 5,
        comment:
            "Fantastic swimming instructor! The lessons are tailored to each individual's skill level, and I feel more confident in the water after every class.",
      },
      {
        clientId: clientUser._id,
        trainerId: trainerUser3._id,
        rating: 4,
        comment:
            "I enjoy the lessons, but sometimes I wish we could have more time in the pool. Overall, the trainer is great, and I'm improving.",
      }
  );


  await db.close();
};

run().catch(console.error);
