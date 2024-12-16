import mongoose, { Types } from "mongoose";
import User from "./User";
import { ICourseRequest } from "../types/courseTypes";

const Schema = mongoose.Schema;

const CourseRequestSchema = new Schema<ICourseRequest>({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  client: {
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
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "declined", "unsubscribed"],
  },
  createdAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
});

const CourseRequest = mongoose.model("CourseRequest", CourseRequestSchema);

export default CourseRequest;
