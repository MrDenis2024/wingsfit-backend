import mongoose, { Types } from "mongoose";
import User from "./User";
import { CourseTypes } from "../types/courseTypes";
import CourseType from "./CourseType";
import Group from "./Group";

const Schema = mongoose.Schema;

const WaitListSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        return Boolean(user && user.role === "client");
      },
      message: "There can only be one role",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  favoriteGroup: {
    type: Schema.Types.ObjectId,
    ref: "Group",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const group = await Group.findById(value);
        return Boolean(group);
      },
      message: "Group does not exist",
    },
  },
  status: {
    required: true,
    type: String,
    enum: ["new", "migrate"],
  },
});

const CourseSchema = new Schema<CourseTypes>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        return Boolean(user && user.role === "trainer");
      },
      message: "There can only be one role",
    },
  },
  courseType: {
    type: Schema.Types.ObjectId,
    ref: "CourseType",
    required: true,
    validate: {
      validator: async (value: Types.ObjectId) => {
        const courseType = await CourseType.findById(value);
        return Boolean(courseType);
      },
      message: "CourseType does not exist",
    },
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  format: {
    type: String,
    default: "group",
    enum: ["single", "group"],
  },
  schedule: [
    {
      type: String,
      enum: ["пн", "вт", "ср", "чт", "пт", "сб", "вс"],
      required: true,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
  },
  waitList: {
    type: [WaitListSchema],
    _id: true,
  },
});

const Course = mongoose.model("Course", CourseSchema);
export default Course;
