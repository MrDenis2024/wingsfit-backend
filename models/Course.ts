import mongoose, { Types } from "mongoose";
import User from "./User";
import { CourseTypes } from "../types/courseTypes";

const Schema = mongoose.Schema;

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
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  format: {
    type: String,
    default: "group",
    enum: ["single", "group"],
  },
  schedule: {
    type: String,
    required: true,
  },
  scheduleLength: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
  },
  image: {
    type: String,
  },
  maxClients: {
    type: Number,
    required: true,
  },
});

const Course = mongoose.model("Course", CourseSchema);
export default Course;
