import mongoose, { Types } from "mongoose";
import User from "./User";
import { ClientTypes } from "../types/clientTypes";
import CourseType from "./CourseType";

const Schema = mongoose.Schema;

const ClientSchema = new Schema<ClientTypes>({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
    validate: {
      validator: async (value: Types.ObjectId) => {
        const user = await User.findById(value);
        if (user?.role !== "client") {
          return false;
        }
        const client = await Client.findOne({ user: value });
        if (client) {
          return false;
        }
        return Boolean(user);
      },
      message: "User does not exist!",
    },
  },
  subscribes: {
    type: [Schema.Types.ObjectId],
    ref: "Course",
  },
  preferredWorkoutType: [
    {
      type: Schema.Types.ObjectId,
      ref: "CourseType",
      validate: {
        validator: async (value: Types.ObjectId) => {
          const courseType = await CourseType.findById(value);
          return Boolean(courseType);
        },
        message: "Course type does not exist!",
      },
    },
  ],
  trainingLevel: {
    type: String,
    enum: ["junior", "middle", "advanced"],
  },
  physicalData: String,
});

const Client = mongoose.model("Client", ClientSchema);

export default Client;
