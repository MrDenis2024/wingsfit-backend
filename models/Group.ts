import mongoose from "mongoose";
import { GroupsTypes } from "../types/groupTypes";

const Schema = mongoose.Schema;

const GroupSchema = new Schema<GroupsTypes>({
  title: {
    type: String,
    required: true,
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  clients: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: async (value: string) => {
        if (value.includes(':')) {
          const strArr = value.split(':');
          return (
              strArr.length === 2 &&
              strArr[1].length === 2 &&
              !isNaN(Number(strArr[0])) &&
              !isNaN(Number(strArr[1])) &&
              parseInt(strArr[0]) >= 0 &&
              parseInt(strArr[0]) < 24 &&
              parseInt(strArr[1]) >= 0 &&
              parseInt(strArr[1]) < 60
          );
        } else return false;
      },
      message: 'Time must be in hh:mm format',
    },
  },
  trainingLevel: {
    type: String,
    enum: ["junior", "middle", "advanced"],
    required: true,
  },
  scheduleLength: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  maxClients: {
    type: Number,
    min: 1,
    required: true,
  },
});

const Group = mongoose.model("Group", GroupSchema);

export default Group;
