import mongoose, {Types} from "mongoose";
import User from "./User";

const Schema = mongoose.Schema;

const SubscribeSchema = new Schema({
  clients: {
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
  addedAt:{
    type: Date,
    default: new Date(),
  },
  subscribeEnd:{
    required:true,
    type: Date,
  },
})

const GroupSchema = new Schema({
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
  subscribeUsers:[SubscribeSchema]
});

const Group = mongoose.model("Group", GroupSchema);

export default Group;
