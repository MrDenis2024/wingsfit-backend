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

  const trainerUser3 = new User({
    email: "trainer3@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    firstName: "Екатерина",
    lastName: "Волкова",
    avatar: "fixtures/trainer3.jpg",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "female",
    phoneNumber: "+996552033313",
    dateOfBirth: new Date("1992-03-18"),
    lastActivity: new Date("2024-11-12"),
    createdAt: new Date("2024-12-10"),
  });
  trainerUser3.getToken();
  await trainerUser3.save();

  const trainerUser4 = new User({
    email: "trainer4@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    firstName: "Ольга",
    lastName: "Кириллова",
    avatar: "fixtures/trainer4.jpg",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "female",
    phoneNumber: "+996552033314",
    dateOfBirth: new Date("1989-01-22"),
    lastActivity: new Date("2024-11-13"),
    createdAt: new Date("2024-12-11"),
  });
  trainerUser4.getToken();
  await trainerUser4.save();

  const trainerUser5 = new User({
    email: "trainer5@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "trainer",
    firstName: "Иван",
    lastName: "Соколов",
    avatar: "fixtures/trainer5.png",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "male",
    phoneNumber: "+996552033315",
    dateOfBirth: new Date("1983-09-14"),
    lastActivity: new Date("2024-11-14"),
    createdAt: new Date("2024-12-12"),
  });
  trainerUser5.getToken();
  await trainerUser5.save();

  const clientUser3 = new User({
    email: "client3@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Сергей",
    lastName: "Иванов",
    avatar: "fixtures/client3.jpeg",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "male",
    dateOfBirth: new Date("1990-05-20"),
    phoneNumber: "+996222121213",
    lastActivity: new Date("2024-12-06"),
    createdAt: new Date("2024-12-03"),
  });
  clientUser3.getToken();
  await clientUser3.save();

  const clientUser4 = new User({
    email: "client4@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Людмила",
    lastName: "Зайцева",
    avatar: "fixtures/client4.jpg",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "female",
    dateOfBirth: new Date("1995-07-15"),
    phoneNumber: "+996222121214",
    lastActivity: new Date("2024-12-07"),
    createdAt: new Date("2024-12-04"),
  });
  clientUser4.getToken();
  await clientUser4.save();

  const clientUser5 = new User({
    email: "client5@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Дмитрий",
    lastName: "Сергеев",
    avatar: "fixtures/client5.avif",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "male",
    dateOfBirth: new Date("1992-02-28"),
    phoneNumber: "+996222121215",
    lastActivity: new Date("2024-12-08"),
    createdAt: new Date("2024-12-05"),
  });
  clientUser5.getToken();
  await clientUser5.save();

  const clientUser6 = new User({
    email: "client6@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Елена",
    lastName: "Коваленко",
    avatar: "fixtures/client6.avif",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "female",
    dateOfBirth: new Date("1993-04-18"),
    phoneNumber: "+996222121216",
    lastActivity: new Date("2024-12-09"),
    createdAt: new Date("2024-12-06"),
  });
  clientUser6.getToken();
  await clientUser6.save();

  const clientUser7 = new User({
    email: "client7@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Александр",
    lastName: "Тихонов",
    avatar: "fixtures/client7.avif",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "male",
    dateOfBirth: new Date("1988-10-10"),
    phoneNumber: "+996222121217",
    lastActivity: new Date("2024-12-10"),
    createdAt: new Date("2024-12-07"),
  });
  clientUser7.getToken();
  await clientUser7.save();

  const clientUser8 = new User({
    email: "client8@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Виктория",
    lastName: "Мельникова",
    avatar: "fixtures/client8.avif",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "female",
    dateOfBirth: new Date("1997-03-30"),
    phoneNumber: "+996222121218",
    lastActivity: new Date("2024-12-11"),
    createdAt: new Date("2024-12-08"),
  });
  clientUser8.getToken();
  await clientUser8.save();

  const clientUser9 = new User({
    email: "client9@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Григорий",
    lastName: "Орлов",
    avatar: "fixtures/client9.avif",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "male",
    dateOfBirth: new Date("1985-06-12"),
    phoneNumber: "+996222121219",
    lastActivity: new Date("2024-12-12"),
    createdAt: new Date("2024-12-09"),
  });
  clientUser9.getToken();
  await clientUser9.save();

  const clientUser10 = new User({
    email: "client10@fit.local",
    password: "test",
    confirmPassword: "test",
    role: "client",
    firstName: "Ольга",
    lastName: "Романова",
    avatar: "fixtures/client10.avif",
    timeZone: { value: "Europe/Moscow", label: "(GMT+3:00) Moscow" },
    gender: "female",
    dateOfBirth: new Date("1998-09-05"),
    phoneNumber: "+996222121220",
    lastActivity: new Date("2024-12-13"),
    createdAt: new Date("2024-12-10"),
  });
  clientUser10.getToken();
  await clientUser10.save();

  const courseType1 = await CourseType.create({
    name: "Yoga",
    isPublished: true,
  });

  const courseType2 = await CourseType.create({
    name: "Cardio",
    isPublished: true,
  });

  const courseType3 = await CourseType.create({
    name: "Pilates",
    isPublished: true,
  });

  const courseType4 = await CourseType.create({
    name: "Strength Training",
    isPublished: true,
  });

  const courseType5 = await CourseType.create({
    name: "HIIT",
    isPublished: true,
  });

  const courseType6 = await CourseType.create({
    name: "Dance Fitness",
    isPublished: false,
  });

  const courseType7 = await CourseType.create({
    name: "Meditation",
    isPublished: false,
  });

  const courseType8 = await CourseType.create({
    name: "CrossFit",
    isPublished: false,
    isBlocked: true,
  });

  const trainer1 = await Trainer.create({
    user: trainerUser._id,
    courseTypes: [courseType1._id, courseType7._id],
    specialization: "Fitness",
    experience: "5 years",
    certificates: [
      {
        title: "Certified Personal Trainer",
        image: "fixtures/certificate1.jpg",
      },
    ],
    description:
      "Professional fitness trainer with 5 years of experience in helping clients achieve their health and fitness goals. Specializes in creating customized workout plans tailored to individual needs. Committed to motivating and guiding clients to lead healthier and more active lifestyles.",
    availableDays: ["пн", "ср", "чт", "пт", "сб"],
  });

  const trainer2 = await Trainer.create({
    user: trainerUser2._id,
    courseTypes: [courseType2._id, courseType8._id],
    specialization: "Cardio Training",
    experience: "8 years",
    certificates: [
      {
        title: "Cardio Specialist",
        image: "fixtures/certificate2.jpg",
      },
    ],
    description:
      "Highly skilled cardio training expert with 8 years of professional experience. Adept at designing and implementing effective cardio programs to improve endurance, stamina, and overall cardiovascular health. Passionate about supporting clients in achieving their fitness objectives.",
    availableDays: ["пн", "ср", "чт", "сб", "вс"],
  });

  const trainer3 = await Trainer.create({
    user: trainerUser3._id,
    courseTypes: [courseType3._id, courseType6._id],
    specialization: "Yoga and Mindfulness",
    experience: "6 years",
    certificates: [
      {
        title: "Registered Yoga Teacher (RYT 200)",
        image: "fixtures/certificate2.jpg",
      },
    ],
    description:
      "Dedicated yoga instructor with 6 years of experience in teaching a variety of yoga styles, including Hatha, Vinyasa, and Ashtanga. Skilled in mindfulness practices and stress management techniques, helping clients achieve mental clarity and physical well-being.",
    availableDays: ["вт", "ср", "чт", "пт", "сб"],
  });

  const trainer4 = await Trainer.create({
    user: trainerUser4._id,
    courseTypes: [courseType4._id],
    specialization: "Strength and Conditioning",
    experience: "10 years",
    certificates: [
      {
        title: "Certified Strength and Conditioning Specialist",
        image: "fixtures/certificate1.jpg",
      },
    ],
    description:
      "Strength and conditioning expert with 10 years of experience in coaching athletes and individuals seeking to build strength and improve performance. Proficient in developing safe, effective strength training programs tailored to various fitness levels.",
    availableDays: ["пн", "вт", "ср", "чт", "сб"],
  });

  const trainer5 = await Trainer.create({
    user: trainerUser5._id,
    courseTypes: [courseType5._id],
    specialization: "HIIT and Functional Training",
    experience: "7 years",
    certificates: [
      {
        title: "Functional Training Specialist",
        image: "fixtures/certificate2.jpg",
      },
    ],
    description:
      "Certified trainer specializing in High-Intensity Interval Training (HIIT) and functional fitness with over 7 years of experience. Passionate about helping clients maximize their performance, burn calories, and improve overall functional movement patterns.",
    availableDays: ["пн", "вт", "ср", "пт", "вс"],
    rating: 5,
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

  const course3 = await Course.create({
    user: trainerUser3._id,
    courseType: courseType3._id,
    title: "Morning Yoga Flow",
    description:
      "Start your day with an energizing yoga session designed to awaken your mind and body.",
    format: "single",
    schedule: ["пн", "ср", "пт", "сб"],
    price: 120,
    image: "fixtures/morning_yoga.jpg",
    waitList: [],
  });

  const course4 = await Course.create({
    user: trainerUser3._id,
    courseType: courseType3._id,
    title: "Mindful Yoga and Meditation",
    description:
      "A combination of yoga and meditation practices to help you find inner peace and balance.",
    format: "single",
    schedule: ["вт", "чт", "сб"],
    price: 180,
    image: "fixtures/mindful_yoga.jpg",
    waitList: [],
  });

  const course5 = await Course.create({
    user: trainerUser4._id,
    courseType: courseType4._id,
    title: "Strength Building 101",
    description:
      "Learn the fundamentals of strength training with this introductory course.",
    format: "group",
    schedule: ["пн", "вт", "чт", "сб"],
    price: 130,
    image: "fixtures/strength_building.webp",
    waitList: [],
  });

  const course6 = await Course.create({
    user: trainerUser4._id,
    courseType: courseType4._id,
    title: "Advanced Strength Training",
    description:
      "Take your strength training to the next level with advanced techniques and workouts.",
    format: "group",
    schedule: ["ср", "пт", "вс"],
    price: 200,
    image: "fixtures/advanced_strength.webp",
    waitList: [],
  });

  const course7 = await Course.create({
    user: trainerUser5._id,
    courseType: courseType5._id,
    title: "HIIT for Beginners",
    description:
      "An introductory course to High-Intensity Interval Training (HIIT) suitable for all fitness levels.",
    format: "group",
    schedule: ["пн", "ср", "пт"],
    price: 110,
    image: "fixtures/hiit_beginners.jpg",
    waitList: [],
  });

  const course8 = await Course.create({
    user: trainerUser5._id,
    courseType: courseType5._id,
    title: "Functional Training Basics",
    description:
      "Learn the core principles of functional training to improve strength and mobility.",
    format: "group",
    schedule: ["вт", "чт", "сб"],
    price: 140,
    image: "fixtures/functional_training.jpg",
    waitList: [],
  });

  const course9 = await Course.create({
    user: trainerUser._id,
    courseType: courseType1._id,
    title: "Evening Yoga Relaxation",
    description:
      "Unwind at the end of your day with this relaxing yoga session designed for all levels.",
    format: "group",
    schedule: ["пн", "вт", "чт", "сб"],
    price: 100,
    image: "fixtures/evening_yoga.jpeg",
    waitList: [],
  });

  const course10 = await Course.create({
    user: trainerUser2._id,
    courseType: courseType2._id,
    title: "Cardio Blast",
    description:
      "An intense cardio workout to improve endurance and burn calories effectively.",
    format: "group",
    schedule: ["пн", "ср", "сб", "вс"],
    price: 160,
    image: "fixtures/cardio_blast.jpg",
    waitList: [],
  });

  const group1 = await Group.create({
    title: "Evening Yoga Group",
    course: course1._id,
    clients: [
      {
        client: clientUser8._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser9._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser10._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser2._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 10,
    scheduleLength: 1,
    startTime: "19:00",
    trainingLevel: "junior",
  });

  const clientsForWaitList = [
    {
      user: clientUser8._id,
      createdAt: new Date(),
      favoriteGroup: group1._id,
      status: "new",
    },
    {
      user: clientUser9._id,
      createdAt: new Date(),
      favoriteGroup: group1._id,
      status: "new",
    },
    {
      user: clientUser10._id,
      createdAt: new Date(),
      favoriteGroup: group1._id,
      status: "new",
    },
    {
      user: clientUser7._id,
      createdAt: new Date(),
      favoriteGroup: group1._id,
      status: "new",
    },
    {
      user: clientUser2._id,
      createdAt: new Date(),
      favoriteGroup: group1._id,
      status: "new",
    },
  ];

  course1.waitList.push(...clientsForWaitList);

  await course1.save();

  const group2 = await Group.create({
    title: "Cardio Training",
    course: course2._id,
    clients: [
      {
        client: clientUser6._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser5._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser4._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser3._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 10,
    scheduleLength: 2,
    startTime: "18:00",
    trainingLevel: "junior",
  });

  const group3 = await Group.create({
    title: "Morning Yoga Flow Group",
    course: course3._id,
    clients: [
      {
        client: clientUser3._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 1,
    scheduleLength: 1,
    startTime: "08:00",
    trainingLevel: "junior",
  });

  const group4 = await Group.create({
    title: "Mindful Yoga Evening Group",
    course: course4._id,
    clients: [
      {
        client: clientUser4._id,
        subscribeEnd: new Date("2025-03-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 1,
    scheduleLength: 1,
    startTime: "20:00",
    trainingLevel: "middle",
  });

  const group5 = await Group.create({
    title: "Beginner Strength Group",
    course: course5._id,
    clients: [
      {
        client: clientUser6._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser2._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser3._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser7._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser4._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 10,
    scheduleLength: 2,
    startTime: "10:00",
    trainingLevel: "advanced",
  });

  const group6 = await Group.create({
    title: "Advanced Strength Evening Group",
    course: course6._id,
    clients: [
      {
        client: clientUser9._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser10._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser3._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser6._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser2._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 8,
    scheduleLength: 3,
    startTime: "19:30",
    trainingLevel: "advanced",
  });

  const group7 = await Group.create({
    title: "HIIT Beginners Group",
    course: course7._id,
    clients: [
      {
        client: clientUser8._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser7._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser4._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser3._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser6._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 15,
    scheduleLength: 1,
    startTime: "07:00",
    trainingLevel: "junior",
  });

  const group8 = await Group.create({
    title: "Functional Training Group",
    course: course8._id,
    clients: [
      {
        client: clientUser6._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser3._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser2._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser5._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser4._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 10,
    scheduleLength: 2,
    startTime: "09:30",
    trainingLevel: "middle",
  });

  const group9 = await Group.create({
    title: "Evening Relaxation Yoga",
    course: course9._id,
    clients: [
      {
        client: clientUser9._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser5._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser4._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser2._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser7._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 10,
    scheduleLength: 1,
    startTime: "18:00",
    trainingLevel: "junior",
  });

  const group10 = await Group.create({
    title: "Cardio Blast Advanced Group",
    course: course10._id,
    clients: [
      {
        client: clientUser10._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser8._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser3._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser6._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
      {
        client: clientUser7._id,
        subscribeEnd: new Date("2025-02-01"),
        addedAt: Date.now(),
        status: "active",
      },
    ],
    maxClients: 12,
    scheduleLength: 3,
    startTime: "17:00",
    trainingLevel: "advanced",
  });

  await Client.create({
    user: clientUser._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "junior",
    physicalData: "Healthy",
  });

  await Client.create({
    user: clientUser2._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "junior",
    physicalData: "Moderate",
  });

  await Client.create({
    user: clientUser3._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "junior",
    physicalData: "Healthy",
  });

  await Client.create({
    user: clientUser4._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "advanced",
    physicalData: "Fit",
  });

  await Client.create({
    user: clientUser5._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "junior",
    physicalData: "Recovering",
  });

  await Client.create({
    user: clientUser6._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "advanced",
    physicalData: "Moderate",
  });

  await Client.create({
    user: clientUser7._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "middle",
    physicalData: "Healthy",
  });

  await Client.create({
    user: clientUser8._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "advanced",
    physicalData: "Fit",
  });

  await Client.create({
    user: clientUser9._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "middle",
    physicalData: "Athletic",
  });

  await Client.create({
    user: clientUser10._id,
    preferredWorkoutType: [
      courseType1._id,
      courseType2._id,
      courseType3._id,
      courseType4._id,
      courseType5._id,
    ],
    trainingLevel: "junior",
    physicalData: "Moderate",
  });

  await Lesson.create({
    group: group1._id,
    notPresent: [clientUser9._id],
    arePresent: [
      clientUser8._id,
      clientUser10._id,
      clientUser._id,
      clientUser2._id,
    ],
  });
  await Lesson.create({
    group: group1._id,
    createdAt: new Date(Date.now() - 100000),
    notPresent: [clientUser9._id],
    arePresent: [
      clientUser8._id,
      clientUser10._id,
      clientUser._id,
      clientUser2._id,
    ],
  });

  await Lesson.create({
    group: group2._id,
    notPresent: [clientUser5._id],
    arePresent: [
      clientUser._id,
      clientUser6._id,
      clientUser4._id,
      clientUser3._id,
    ],
  });

  await Lesson.create({
    group: group3._id,
    notPresent: [clientUser3._id],
    arePresent: [],
  });

  await Lesson.create({
    group: group4._id,
    notPresent: [],
    arePresent: [clientUser4._id],
  });

  await Lesson.create({
    group: group5._id,
    notPresent: [clientUser2._id, clientUser3._id],
    arePresent: [clientUser6._id, clientUser7._id, clientUser4._id],
  });

  await Lesson.create({
    group: group6._id,
    notPresent: [clientUser6._id],
    arePresent: [
      clientUser9._id,
      clientUser10._id,
      clientUser3._id,
      clientUser2._id,
    ],
  });

  await Lesson.create({
    group: group7._id,
    notPresent: [clientUser7._id, clientUser4._id],
    arePresent: [clientUser8._id, clientUser3._id, clientUser6._id],
  });

  await Lesson.create({
    group: group8._id,
    notPresent: [clientUser6._id, clientUser3._id],
    arePresent: [
      clientUser9._id,
      clientUser2._id,
      clientUser4._id,
      clientUser5._id,
    ],
  });

  await Lesson.create({
    group: group9._id,
    notPresent: [clientUser9._id],
    arePresent: [
      clientUser7._id,
      clientUser5._id,
      clientUser4._id,
      clientUser2._id,
    ],
  });

  await Lesson.create({
    group: group10._id,
    notPresent: [clientUser10._id],
    arePresent: [
      clientUser6._id,
      clientUser7._id,
      clientUser8._id,
      clientUser3._id,
    ],
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
    clientId: clientUser4._id,
    trainerId: trainerUser._id,
    rating: 5,
    comment: "Great workout!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser3._id,
    trainerId: trainerUser._id,
    rating: 4,
    comment: "Great session, but a bit too intense for me.",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser4._id,
    trainerId: trainerUser3._id,
    rating: 5,
    comment: "Loved the personalized approach, amazing results!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser5._id,
    trainerId: trainerUser3._id,
    rating: 5,
    comment: "Fantastic cardio workout, really pushed me to my limits!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser6._id,
    trainerId: trainerUser4._id,
    rating: 4,
    comment: "Cardio session was good, but I need more variety in exercises.",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser7._id,
    trainerId: trainerUser4._id,
    rating: 5,
    comment: "Intense and rewarding. Highly recommend!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser8._id,
    trainerId: trainerUser5._id,
    rating: 5,
    comment: "Great motivation and clear instructions. Will come again!",
    createdAt: new Date().toISOString(),
  });

  await TrainerReview.create({
    clientId: clientUser9._id,
    trainerId: trainerUser5._id,
    rating: 3,
    comment: "It was okay, but I expected a bit more focus on my form.",
    createdAt: new Date().toISOString(),
  });

  await trainer1.getRating();
  await trainer1.save();

  await trainer2.getRating();
  await trainer2.save();

  await trainer3.getRating();
  await trainer3.save();

  await trainer4.getRating();
  await trainer4.save();

  await trainer5.getRating();
  await trainer5.save();

  const groupChat1 = await GroupChat.create({
    group: group1._id,
    title: "Evening Yoga group",
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

  const groupChat3 = await GroupChat.create({
    group: group3._id,
    title: "Morning Yoga group",
  });

  await GroupChat.create({
    group: group4._id,
    title: "Afternoon Cardio group",
  });

  await GroupChatMessage.create({
    groupChat: groupChat3._id,
    author: trainerUser3._id,
    message: "Let's start the day with some yoga stretches!",
    createdAt: new Date().toISOString(),
    isRead: [
      {
        user: clientUser3._id,
        read: true,
      },
      {
        user: trainerUser3._id,
        read: true,
      },
    ],
  });

  await GroupChatMessage.create({
    groupChat: groupChat3._id,
    author: clientUser3._id,
    message: "I'm ready!",
    createdAt: new Date().toISOString(),
    isRead: [
      {
        user: trainerUser3._id,
        read: false,
      },
      {
        user: clientUser3._id,
        read: true,
      },
    ],
  });

  const privateChat2 = await PrivateChat.create({
    firstPerson: trainerUser3._id,
    secondPerson: clientUser3._id,
    availableTo: [clientUser3._id, trainerUser3._id],
  });

  await PrivateChat.create({
    firstPerson: trainerUser4._id,
    secondPerson: clientUser4._id,
    availableTo: [clientUser4._id, trainerUser4._id],
  });

  await PrivateMessage.create({
    privateChat: privateChat2._id,
    author: clientUser4._id,
    message: "Can we schedule a session this weekend?",
    createdAt: new Date().toISOString(),
    isRead: {
      user: trainerUser4._id,
      read: true,
    },
  });

  await PrivateMessage.create({
    privateChat: privateChat2._id,
    author: trainerUser3._id,
    message: "Sure! Let's do it on Saturday at 10 AM.",
    createdAt: new Date().toISOString(),
    isRead: {
      user: clientUser3._id,
      read: true,
    },
  });

  await db.close();
};

run().catch(console.error);
